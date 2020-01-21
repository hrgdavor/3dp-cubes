
// requires
fs = require('fs');
path = require('path');

// config
var compFolder = 'src/js';
var scssFolder = 'src/scss';
var scssFile = '';//'src/main/scss/style.scss';


// class that handles interaction

function Runner(args){
	this.hadleArgs(args);
}

var proto = Runner.prototype;

proto.hadleArgs = function(args){
	this.parseArgs(args);
	if(this.mode == 'failed')
	  	process.exit(1);
	 else if(this.mode == 'gen' || this.mode == 'copy'){
		this.prepFiles();
	 }
};

proto.parseArgs = function(args){
	this.opts = {};
	this.rest = [];

	for(var i=0; i<args.length; i++){
		if(args[i].indexOf('-') == 0){
			this.opts[args[i].substring(1)] = true;
		}else{
			this.rest.push(args[i]);
		}
	}

	if(this.rest.length == 0){
		this.printHelp(false);
		this.mode = this.opts.i ? 'interactive':'failed';
		if(this.opts.i) 
			process.stdout.write('type the arguments and press [ENTER]\n');
		return;
	}

	this.mode = 'gen';

	this.compName = this.rest[0];
	this.compBase = this.rest[1] || 'Base';
	this.jsName   = this.compName+'.js';
	this.scssName = this.compName+'.scss';

	// prepare what to generate/copy
	if(this.opts.c){
		this.jsNameFrom   = this.compBase+'.js';
		this.scssNameFrom = this.compBase+'.scss';
		if(fs.existsSync(compFolder+'/'+this.jsNameFrom)){
			this.mode = 'copy';
			this.templateNameFrom = this.compBase+'.tpl';
			this.templateName = this.compName+'.tpl';
			this.genTemplate = fs.existsSync(compFolder+'/'+this.templateNameFrom);
			if(!this.genTemplate){
				this.templateNameFrom = this.compBase+'.html';
				this.templateName = this.compName+'.html';
				this.genTemplate = fs.existsSync(compFolder+'/'+this.templateNameFrom);
			}
			this.genScss = fs.existsSync(scssFolder+'/'+this.scssNameFrom);
		}else{
			process.stdout.write('component does not exist '+compFolder+'/'+this.jsNameFrom+'\n');
			process.exit(1);
		}
	}else{	
		this.genTemplate = this.opts.a || this.opts.t ? 2:0;
		this.templateName = this.compName + (this.genTemplate == 1 ? '.html':'.tpl');
		this.genScss = this.opts.a || this.opts.s;
	}

}

proto.onData = function(data){
	if(this.mode == 'interactive'){
		var args = data.trim().split(/\s/);
		this.hadleArgs(args);
	}else{
		if(data.trim() != 'n'){
			if(this.mode == 'copy'){
				this.copyFiles();
			}else{
				this.writeFiles();
			}
		}
	  	process.exit(0);
	}
};

proto.printHelp = function(showInteractive){
	process.stdout.write(' [parameters] package/ComponentName [parentComponent]\n');
	process.stdout.write('  -c   - copy a component\n');
	process.stdout.write('  -a   - with template and scss\n');
	process.stdout.write('  -t   - with template\n');
	process.stdout.write('  -s   - with scss\n');
	if(showInteractive)
		process.stdout.write('  -i   - interactive mode\n');
};

proto.copyFiles = function(){
	process.stdout.write('\n copying files \n ');
	var data = fs.readFileSync(compFolder+'/'+this.jsNameFrom);
	data = data.toString().replace("'"+this.compBase+"'", "'"+this.compName+"'");
	data = data.replace("\""+this.compBase+"\"", "'"+this.compName+"'");
	writeIfNoFile(compFolder+'/'+this.jsName, data);
	
	if(this.genTemplate){
		data = fs.readFileSync(compFolder+'/'+this.templateNameFrom);
		writeIfNoFile(compFolder+'/'+this.templateName, data);
	}

	if(this.genScss){
		data = fs.readFileSync(scssFolder+'/'+this.scssNameFrom);
		data = data.toString().replace("\""+this.compBase+"\"", "'"+this.compName+"'");
		writeIfNoFile(scssFolder+'/'+this.scssName, data);
	}
};

proto.writeFiles = function(){
	process.stdout.write('\n generating files \n ');
	writeIfNoFile(compFolder+'/'+this.jsName, makeJsFile(this.compName, this.compBase, this.genTemplate));
	if(this.genTemplate)
		writeIfNoFile(compFolder+'/'+this.templateName, '\n<frag>\n\n</frag>\n');
	if(this.genScss){
		writeIfNoFile(scssFolder+'/'+this.scssName, makeScssFile(this.compName));
		if(scssFile){
	        process.stdout.write('\n\n adding to '+scssFile+' this line \n\n@import "'+this.compName+'";\n\n');
	        fs.appendFileSync(scssFile,'\n@import "'+this.compName+'";\n');			
		}
	}
};

proto.prepFiles = function(){
	var op = this.mode == 'gen' ? 'generated ':'copied to ';

	if(fs.existsSync(compFolder+'/'+this.jsName))
		process.stdout.write('!! JavaScript file already exists '+compFolder+'/'+this.jsName+'\n');
	else
		process.stdout.write('JavaScript file will be '+op+compFolder+'/'+this.jsName+'\n');

	if(this.genTemplate){
		if(fs.existsSync(compFolder+'/'+this.templateName))
			process.stdout.write('!! Template file already exists '+compFolder+'/'+this.templateName+'\n');
		else
			process.stdout.write('Template file will be '+op+compFolder+'/'+this.templateName+'\n');
	}

	if(this.genScss){
		if(fs.existsSync(scssFolder+'/'+this.scssName))
			process.stdout.write('!! SCSS file already exists '+scssFolder+'/'+this.scssName+'\n');
		else
			process.stdout.write('SCSS file will be '+op+scssFolder+'/'+this.scssName+'\n');
	}
	process.stdout.write('\n type "n" to cancel, or kill script with CTRL-C \n ');
	process.stdout.write('\n press [ENTER] to continue \n ');
};

function mkdirs(folder){
	var parent = path.dirname(folder);
	if(!fs.existsSync(parent))	mkdirs(parent);
	fs.mkdirSync(folder);
}

function writeIfNoFile(file, content){
	if(fs.existsSync(file)){
		console.log('File already exists '+file);
		return false;
	}
	var folder = path.dirname(file);
	if(!fs.existsSync(folder))	mkdirs(folder);

	process.stdout.write('writinng \n'+file+'\n\n'+ content+'\n\n');
	fs.writeFileSync(file, content);
	return true;	
}

function makeJsFile(compName, compBase,genTemplate){
	var template = genTemplate == 1 ? "<-TEMPLATE->":"";
	var str= ""
		+"\nmi2JS.addCompClass('"+compName+"', '"+compBase+"', '"+template+"',\n\n"
		+"// component initializer function that defines constructor and adds methods to the prototype\n"
		+"function(proto, superProto, comp, mi2, h, t, filters){\n\n"
		+"//\tproto.initChildren = function(){\n"
		+"//\t\tsuperProto.initChildren.call(this);\n\n"
		+"//\t};\n\n";
		
	if(genTemplate == 2){
		str +="\tproto.initTemplate = function(h,t,state, self){\n"
    		+"\t\treturn <template/>\n"
  			+"\t}\n\n";
	}
	str +="});"
	return str;
}

function makeScssFile(compName){
	return '[as="'+compName+'"]{\n\n}';
}


/***************************** initialization from command line *********************************/

var args = process.argv.slice(2);

var runner = new Runner(args);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data){
	runner.onData(data);
});

process.on('SIGINT', function () {
  process.exit(0);
});


