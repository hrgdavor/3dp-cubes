
// requires
fs = require('fs');
path = require('path');

// config
var compFolder = 'src/main/js';
var scssFolder = 'src/main/scss';


// class that handles interaction

function Runner(args){
	this.hadleArgs(args);
}

var proto = Runner.prototype;

proto.hadleArgs = function(args){
	this.parseArgs(args);
	if(this.mode == 'failed')
	  	process.exit(1);
	 else if(this.mode == 'gen')
		this.prepFiles();
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
	this.jsName = this.compName+'.js';
	this.templateName = this.compName+'.html';
	this.scssName = this.compName+'.scss';

	this.genTemplate = this.opts.a || this.opts.t;
	this.genScss = this.opts.a || this.opts.s;

}

proto.onData = function(data){
	if(this.mode == 'interactive'){
		var args = data.trim().split(/\s/);
		this.hadleArgs(args);
	}else{
		if(data.trim() != 'n'){
			this.writeFiles();
		}
	  	process.exit(0);
	}
};

proto.printHelp = function(showInteractive){
	process.stdout.write(' [parameters] package/ComponentName [parentComponent]\n');
	process.stdout.write('  -a   - with template and scss\n');
	process.stdout.write('  -t   - with template\n');
	process.stdout.write('  -s   - with scss\n');
	if(showInteractive)
		process.stdout.write('  -i   - interactive mode\n');
};

proto.writeFiles = function(){
	process.stdout.write('\n generating files \n ');
	writeIfNoFile(compFolder+'/'+this.jsName, makeJsFile(this.compName, this.compBase, this.genTemplate));
	if(this.genTemplate)
		writeIfNoFile(compFolder+'/'+this.templateName, '');
	if(this.genScss){
		writeIfNoFile(scssFolder+'/'+this.scssName, makeScssFile(this.compName));
        process.stdout.write('\n\n add this line to your scss file: \n\n@import "'+this.compName+'";\n\n');
	}
};

proto.prepFiles = function(){
	if(fs.existsSync(compFolder+'/'+this.jsName))
		process.stdout.write('!! JavaScript file already exists '+compFolder+'/'+this.jsName+'\n');
	else
		process.stdout.write('JavaScript file will be generated '+compFolder+'/'+this.jsName+'\n');

	if(this.genTemplate){
		if(fs.existsSync(compFolder+'/'+this.templateName))
			process.stdout.write('!! Template file already exists '+compFolder+'/'+this.templateName+'\n');
		else
			process.stdout.write('Template file will be generated '+compFolder+'/'+this.templateName+'\n');
	}

	if(this.genScss){
		if(fs.existsSync(scssFolder+'/'+this.scssName))
			process.stdout.write('!! SCSS file already exists '+scssFolder+'/'+this.scssName+'\n');
		else
			process.stdout.write('SCSS file will be generated '+scssFolder+'/'+this.scssName+'\n');
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
		return;
	}
	var folder = path.dirname(file);
	if(!fs.existsSync(folder))	mkdirs(folder);

	process.stdout.write('writinng \n'+file+'\n\n'+ content+'\n\n');
	fs.writeFileSync(file, content);	
}

function makeJsFile(compName, compBase,genTemplate){
	var template = genTemplate ? "<-TEMPLATE->":"";
	return ""
		+"\nmi2JS.addCompClass('"+compName+"', '"+compBase+"', '"+template+"',\n\n"
		+"// component initializer function that defines constructor and adds methods to the prototype\n"
		+"function(proto, superProto, comp, superComp){\n\n"
		+"	var mi2 = mi2JS;\n\n"
		+"	proto.initTemplate = function(){\n"
		+"		superProto.initTemplate.call(this);\n\n"
		+"	};\n\n"
		+"});"
	;
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


