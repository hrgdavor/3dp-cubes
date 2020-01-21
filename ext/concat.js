// terser is fork of uglify-es ... both uglify and uglify es have stopped maintenance
var terser = require("terser");

var Concat = require("concat-with-sourcemaps");

const fs = require('fs');
const JSON5 = require('json5'); // babel uses this instead of the builtin strict JSON for reading .babelrc

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var config = null;

/* Communication goes as following.
First line is a config object (JSON)
we must respond with OK

all other lines are notification about file change
each line is a list of tab delimited values
 0 - [string] full path for source
 1 - [string] full path for destination
 2 - [string] relative path for the source
 3 - [boolean] initial. (if part of initial scan or change event)

*/

rl.on('line',function(line){
	if(config){
		line = line.replace(/\\/g,"/");
		try{
			doBuild(line);
		}catch(e){
			console.error(e);
		}
	}else{
		config = line ? JSON5.parse(line):{};
	}
	console.log("OK");
})

console.log("OK");







var cache = {};

function getModifiedTime(file){
	if(!fs.existsSync(file)) return 0;
	return fs.statSync(file).mtimeMs;
}

function readCached(file, modified){
	return getCached(file).content;
}

function getCached(file, modified){
	if(!cache[file]) cache[file] = {mtime:0, content:''};
	
	var mtime = modified || getModifiedTime(file);

	if(mtime > cache[file].mtime){
		if(config.verbose > 1) console.error("INFO Load file "+file+" "+mtime);
		cache[file].mtime = mtime;
		cache[file].content = fs.readFileSync(file, "utf8");
	}else{
		if(config.verbose > 1) console.error("INFO From cache "+mtime+" "+cache[file].mtime+" "+file);
	}
	return cache[file];
}

function doBuild(line){
	var startTime = Date.now();

	let fNames = line.split('\t')
	var initial = fNames[3] == 'true';
	var inputPath = fNames[0];
	var outputPath = fNames[1];
	var outputName = outputPath.replace('.json','.js');
	
	var dir = dirName(inputPath);
	var dirOut = dirName(outputPath);
	var bundle;
	try{
		bundle = JSON5.parse(readCached(inputPath));
	}catch(e){
		console.error('error parsing ' +inputPath);
		throw(e);
	}
	var concat = new Concat(true, 'test.ugly.js', '\n');

	var jsRoot = dirOut;
	var jsRelRoot = '';
	if(bundle.jsRoot){
		jsRoot = dirOut+'/'+bundle.jsRoot;
		jsRelRoot = bundle.jsRoot;
	}
	if(bundle.srcRoot){
		jsRelRoot = bundle.srcRoot;
	}

	function addOne(path, modified){
		try{
			var map = void 0;
			try{ map = readCached(jsRoot+'/'+path+".map", modified) }catch(e){}
			if(!map) map = void 0; // empty string breaks concat 
			var jsContent = readCached(jsRoot+'/'+path, modified);
			if(!config.minify){
				jsContent = jsContent.replace( /\/\/# sourceMappingURL\=.*/ ,'');
			}
			if(jsContent)
				concat.add(jsRelRoot, jsContent, map );
			else{
				console.error('Not found  '+jsRoot+'/'+path);
			}
		}catch(e){
			console.error('do-uglify: problem in js or sourcemap for '+jsRoot+'/'+path+' '+e.message);
		}
	}

	var maxTime = 0;
	bundle.files.forEach(def=>{
		if(maxTime < def.modified) maxTime = def.modified;
	});

	if(maxTime < getModifiedTime(outputName)){
		if(config.verbose > 0) console.error("INFO Skip older "+outputName+" "+maxTime+" < "+getModifiedTime(outputName)+" "+new Date(maxTime)+" < "+new Date(getModifiedTime(outputName)));
		return;
	}

	bundle.files.forEach(def=>{
		addOne(def.script, def.modified);
	});

	if(config.verbose > 0) console.error('INFO bundle:'+bundle.name+" - Load files "+(Date.now()-startTime));
	startTime = Date.now();

	var options = {
		mangle: {
			toplevel: false,
		},
		sourceMap: { filename: outputName, url:fileName(outputName)+'.map?'+maxTime, content: concat.sourceMap  },
		nameCache: {}
	};

	var newSrc = concat.content;
	var newMap = concat.sourceMap;

	if(config.minify){
		var conf = {};

		conf[outputName] = newSrc.toString();
		var mini = terser.minify(conf, options);

		if(mini.error){
			console.error(mini.error);
		}
		newSrc = mini.code;
		newMap = mini.map;
	}else{
		newSrc += '\n//# sourceMappingURL='+options.sourceMap.url;
	}

	fs.writeFileSync(outputName, newSrc, "utf8");
	fs.writeFileSync(outputName+'.map', newMap, "utf8");
	if(config.verbose > 0) console.error('INFO bundle:'+bundle.name+" - Uglify files "+(Date.now()-startTime));
	startTime = Date.now();
}

function dirName(fname){
	let idx = fname.lastIndexOf('/');
	if(idx == -1) return void 0;

	return fname.substring(0,idx);
}

function fileName(fname){
	let idx = fname.lastIndexOf('/');
	if(idx == -1) return void 0;

	return fname.substring(idx+1);
}

