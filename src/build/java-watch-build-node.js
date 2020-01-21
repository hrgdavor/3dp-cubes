var build = module.exports = {};

function _include(){ addToArray(this.data.include, arguments); return this;}
function _exclude(){ addToArray(this.data.exclude, arguments); return this; }

function __setter(self,name, field){ 
  if(!field) field = name;
  self[name] = function(val){ this.data[field] = val; return this; } 
}

function __pusher(self, name, field){ 
  if(!field) field = name;
  self[name] = function(){ addToArray(this.data[field], arguments); return this; } 
}

function addToArray(arr1,arr2){
  if(!arr1.push) console.log('no push on arr1',arr1);
    for(var i=0; i<arr2.length; i++){
      if(arr2[i] instanceof Array) 
        addToArray(arr1, arr2[i]);
      else
        arr1.push(arr2[i]);
    }
    return arr1;
}



function toArray(args){
  return Array.prototype.splice.call(args,0);
}

function restArgs(args){
  return args.length>1 ? Array.prototype.splice.call(args,1) : [];
}


build.extractArgv = function(argv, argvAlias){
  for(var i=2; i<process.argv.length; i++){
    var str = process.argv[i];
    if(str.startsWith('--')){
      var idx = str.indexOf('=');
      if(idx == -1){
        argv[str.substring(2)] = true;
      }else{
        argv[str.substring(2,idx)] = str.substring(idx+1);
      }
    }else if(str.startsWith('-')){
      for(var i=1; i<str.length; i++){
        var ch = str.charAt(i);
        if(argvAlias[ch]) argv[argvAlias[ch]] = true;
      }
    }
  }
}

build.TASKS = [];

build.dumpTasks = function(){
  var str = '[';
  this.TASKS.forEach((task,i)=>str += (i>0 ? ',\n':'\n')+JSON.stringify(task.data,void 0, 2));
  str += '\n]\n';
  console.log(str);
}


build.addTask = function(task){
  this.TASKS.push(task);
  return task;
}

/* ****************************     copyTask     ************************ */


build.doCopy = function(inp,out){
  return this.addTask(new CopyTask(inp,out));
}

function CopyTask(input,output,include=[], exclude=[]){
  this.data = {type:'Copy', input,output,
    include:addToArray([],include),
    exclude:addToArray([],exclude)
  };
  this.include = _include;
  this.exclude = _exclude;
  __setter(this,'compareBytes');
  __setter(this,'reverseSyncModified');
}


/* ****************************     gzipTask     ************************ */


build.doGzip = function(inp,out){
  return this.addTask(new GzipTask(inp,out));
}

function GzipTask(input,output,include=[], exclude=[]){
  this.data = {type:'Gzip', input,output,
    include:addToArray([],include),
    exclude:addToArray([],exclude)
  };
  this.include = _include;
  this.exclude = _exclude;
}


/* ****************************     extTask     ************************ */

build.doExt = function(cmd){
  return this.addTask(new ExtTask(cmd, restArgs(arguments)));
}

function ExtTask(cmd, params=[]){
  this.data = {type:'Ext',
    cmd, params,
    include:[],
    exclude:[]
  };
  this.include = _include;
  this.exclude = _exclude;
  __pusher(this,'params');
  __setter(this,'input');
  __setter(this,'output');
  __setter(this,'srcRoot');
  __setter(this,'options');
}


/* ****************************     Lang     ************************ */

build.doLang = function(){
  return this.addTask(new LangTask(toArray(arguments)));
}

function LangTask(input=[]){
  this.data = {type:'Lang',input, output:[]};
  __pusher(this,'output');
  __setter(this,'varName');
  __setter(this,'compareBytes');
}

/* ****************************     Proxy     ************************ */

build.doProxy = function(port){
  return this.addTask(new ProxyTask(port) );
}

function ProxyTask(port=8080){
  this.data = {type:'Proxy',port, items:[], noCache:[]};
  __pusher(this,'noCache');
  __setter(this,'host');
  __setter(this,'wwwRoot');
  __setter(this,'proxyHeaders');
  __setter(this,'httpsKeyStore');
  __setter(this,'httpsKeyStorePass');
  this.paths = function(proxyTo){
    for(var i=1; i<arguments.length; i++){
      this.data.items.push({proxyTo, path:arguments[i]});
    }
      return this;
  }
  this.path = function(proxyTo, path, prefix){
      this.data.items.push({proxyTo, path, prefix});
      return this;
  }
}

/* ****************************     Mkdir     ************************ */

build.doMkdir = function(){
  return this.addTask(new MkdirTask(toArray(arguments)));
}

function MkdirTask(dirs=[]){
  this.data = {type:'Mkdir', dirs: dirs};
  __pusher(this,'dirs');
}


/* ****************************     JsBundles     ************************ */

build.doJsBundles = function(root, outputText){
  return this.addTask(new JsBundlesTask(root, outputText)); 
}

function JsBundlesTask(root, compilationLevel='whitespace', outputJS=false, outputText=false){
  this.data = {type:'JsBundles',root, outputText, bundles:[]};
  this.add = function(name){
    var include = restArgs(arguments);
    var bundle = new Bundle(name,include);
    this.data.bundles.push(bundle.data);
    return bundle;

  }
}

function Bundle(name,include=[]){
  this.data = {name, include,
    exclude:[]
  };
  this.include = _include;
  this.exclude = _exclude;  
}


/* ****************************     Sass / Scss     ************************ */

build.doScss = build.doSass = function(input, output, outputStyle, generateSourceMap=false, generateSourceComments=false){
  return this.addTask( new SassTask(input, output, outputStyle, generateSourceMap, generateSourceComments));
}

function SassTask (input, output, outputStyle='expanded', generateSourceMap=false, generateSourceComments=false){
  this.data = {type:'Sass', input, output, outputStyle, generateSourceMap, generateSourceComments, include:[] };
  this.include = _include;
}

/* ****************************     LiveReload     ************************ */

build.doLiveReload = function(input){
  return this.addTask( new LiveReloadTask(input));
}

function LiveReloadTask (input){
  this.data = {type:'LiveReload', input, include:[] };
  this.include = _include;
  this.exclude = _exclude;
  __setter(this,'pauseAfterCss');
  __setter(this,'port');
  __setter(this,'liveReloadScript');
}

/* ****************************     HtmlScriptAndCss     ************************ */

build.doHtmlScriptAndCss = function(input, output){
  return this.addTask( new HtmlScriptAndCss(input, output));  
}

function HtmlScriptAndCss(input, output, scriptVariable='SCRIPT'){
  this.data = {type:'HtmlScriptAndCss',input, output, scripts:[], css:[], scriptVariable, globals:{} };
  __setter(this,'scriptVariable');
  __setter(this,'globalsReplace');
  __setter(this,'cssReplace');
  __setter(this,'scriptReplace');
  __setter(this,'lastModReplace');
  __setter(this,'output');
  __pusher(this,'scripts');
  __pusher(this,'css');
  this.global = function(key, value){
    this.data.globals[key] = value;
      return this;
  }
  this.globals = function(obj){
    for(var key in obj)
      this.data.globals[key] = obj[key];
      return this;
  }
}


