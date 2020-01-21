// terser is fork of uglify-es ... both uglify and uglify es have stopped maintenance
var terser = require("terser");

const babylon = require('babylon');
const babel = require('babel-core');
const {parse}  = babylon;

const babel_generator = require('babel-generator');
const generate = babel_generator.default;

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


function loadOptions(file){
	var file = dirName
	babel.loadOptions();
}

function getModifiedTime(file){
	if(!fs.existsSync(file)) return 0;
	return fs.statSync(file).mtimeMs;
}

function readCached(file){
	return getCached(file).content;
}

function getCached(file){
	if(!cache[file]) cache[file] = {mtime:0, content:''};
	
	var mtime = getModifiedTime(file);

	if(mtime > cache[file].mtime){
		cache[file].mtime = mtime;
		cache[file].content = fs.readFileSync(file);
	}else{
		if(config.verbose > 1) console.error("INFO From cache "+mtime+" "+cache[file].mtime+" "+file);
	}
	return cache[file];
}





function doBuild(line){
	let fNames = line.split('\t')
	var split = splitName(fNames[0]);
	var initial = fNames[3] == 'true';
	// ignore .html and .tpl in initial run, but rebuild on change
	if( split[1] == '.js' || (!initial && (split[1] == '.tpl' || split[1] == '.html')) ){
		for(let i=0; i<3; i++){
			split = splitName(fNames[i]);
			if(!split){
				console.error('invalid file name '+fNames[i]);
			}else{
				fNames[i] = split[0]+'.js';
			}
		}
		if(fs.existsSync(fNames[0])){
			writeAst(fNames[0], fNames[1], fNames[2], initial);
		}else{
			console.error('File not found '+fNames[0]);
		}
	}
}

function splitName(fname){
	let idx = fname.lastIndexOf('.');
	if(idx == -1) return void 0;

	return [fname.substring(0,idx),fname.substring(idx)];
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


function mkSubdir(fname){
	let dir = dirName(fname);
	if(fs.existsSync(dir)) return;

	mkSubdir(dir);
	fs.mkdirSync(dir);
}

function writeIfDifferent(file, content){
	var oldContent = '';
	if(fs.existsSync(file)) oldContent = fs.readFileSync(file, 'utf8');

	if(content != oldContent){
		fs.writeFileSync(file, content);
	}else{
		if(config.verbose > 1) console.error('INFO skip identical: '+file);
	}
}

function writeAst(src, dest, srcRelative, initial ){
	var startTime = Date.now();
	let fContent = getCached(src);

	var srcPrefix = src.substring(0,src.length-3);
	if(config.srcRoot) {
		var tmp = srcRelative;
		var arr = srcRelative.split('/');
		srcRelative = '';
		for(var i=0; i< arr.length; i++){
			if(arr[i]) 
				srcRelative += '../';
		}
		srcRelative += config.srcRoot+'/';
		srcRelative += tmp;
		if(config.verbose > 1) console.error('INFO '+tmp+' -> '+srcRelative);
	}

	let mtimeSrc = Math.max(fContent.mtime, getModifiedTime(srcPrefix+'.tpl'));
	let mtimeJs = Math.max(fContent.mtime, getModifiedTime(srcPrefix+'.js'));

	var mtimeDest = getModifiedTime(dest);
	// console.error(mtimeSrc+"\t"+new Date(mtimeSrc)+" "+srcPrefix+'.tpl');
	// console.error(mtimeJs+"\t"+new Date(mtimeJs)+" "+srcPrefix+'.js');
	// console.error(mtimeDest+"\t"+new Date(mtimeDest)+" "+dest);

	if(mtimeDest >= mtimeSrc && mtimeDest >= mtimeJs){
		if(config.verbose > 1) console.error("INFO Skip older "+src);
		return;
	}

	// READ .babelrc
	var dir = dirName(src);
	var options = { retainLines: true };
	if(dir && fs.existsSync(dir+'/.babelrc')){
		options = JSON5.parse(readCached(dir+'/.babelrc'));
	}
	var templateContent = fs.existsSync(srcPrefix+'.tpl') ? readCached(srcPrefix+'.tpl',true):'';
	options.parserOpts = {sourceFilename: srcRelative, filename: src, templateContent: templateContent};
	options.filename = src;
	options.code = false;

	
	// TRANSFORM
	let trans = babel.transform( fContent.content, options);


	var sourceMapName = dest+'.map';
	var stats = fs.statSync(src);
	var prefix = dest.substring(0,dest.length-3)
	var relativePrefix = srcRelative.substring(0,srcRelative.length-3);

	options.sourceMaps = true;
	options.quotes = "'"; // WORKAROUND for babel-generator bug causing error -> TypeError: code.slice is not a function

	let { code:newSrc, map } = generate(trans.ast, options, {});

	let jsName = prefix+'.js';
	mkSubdir(jsName);

	newSrc +='\n//# sourceMappingURL='+fileName(sourceMapName)+'?'+stats.mtimeMs+'\n'

	var newMap = map;
	
	if(map.sources.length) map.sources[0] = map.sources[0];

	for(let i=1; i<map.sources.length; i++){
		if(map.sources[i].substring(map.sources[i].length-4) == '.tpl'){
			map.sources[i] = relativePrefix+'.tpl';
		}
		if(map.sources[i].substring(map.sources[i].length-4) == 'html'){
			map.sources[i] = relativePrefix+'.html';
		}
		map.sources[i] = map.sources[i];
	}
	if(map.sources.length == 1){
		map.sources.push(relativePrefix+'.tpl');
	}

	var newMap = map;
	if(map.sourcesContent){
		newMap = {version: map.version, sources:map.sources,names:map.names, mappings:map.mappings, sourcesContent:[]};
		 for(var i=0; i<map.sourcesContent.length; i++){
			newMap.sourcesContent.push(map.sourcesContent[i].toString('utf8'));
		}		
	}

	if(config.verbose > 0) console.error('INFO transform:'+jsName+"  "+(Date.now()-startTime));
	startTime = Date.now();
	if(config.minify){
		var options = {
			mangle: {
				toplevel: false,
			},
			sourceMap: { filename: sourceMapName, url:fileName(sourceMapName)+'?'+stats.mtimeMs, content: newMap  },
			nameCache: {}
		};
		var conf = {};

		conf[jsName] = newSrc.toString();
		var mini = terser.minify(conf, options);
		if(mini.error){
			console.error(mini.error);
		}

		newSrc = mini.code;
		newMap = mini.map;

		if(config.verbose > 0) console.error('INFO minify:'+jsName+"  "+(Date.now()-startTime));
		startTime = Date.now();
	}else{
		newMap = JSON.stringify(newMap);
	}

	writeIfDifferent(sourceMapName, newMap);
	writeIfDifferent(jsName, newSrc);
}
