var wb = require("./java-watch-build-node.js")
const fs = require('fs');

var gen_root = "deploy/_gen"
var collect_root =  "deploy/collect"
var dev_root=  "deploy/dev"
var dev_www =  dev_root+"/www"
var profile =  "dev"
var languages = ["en"]
var lang = languages[0];

function calcCompPackages(){
  var skipPackages = {mi2:1,images:1};
  var ret = [];
  var path = 'src/js';
  var dir = fs.readdirSync(path).forEach(f=>{
    if(!skipPackages[f] && fs.lstatSync(path+'/'+f).isDirectory()) ret.push(f);
  });
  return ret;
}

var componentLibs = calcCompPackages();
var bundles = ["lib","app"].concat(componentLibs)


var argv = {};
var argvAlias = {l:'livereload', p:'proxy', t:'test'};

wb.extractArgv(argv, argvAlias);


// prepare files
wb.doCopy("src/js",collect_root+"/js");


wb.doExt("node","ext/babel-transform.js")
  .input(collect_root+"/js")
  .output(gen_root+"/js")
  .srcRoot("src")
  .options({minify:true,srcRoot:'src'})
  .include("**.js", "**/*.tpl");

// doLang(langPath,languages)
languages.forEach(function(lang){
  wb.doLang(`src/lang/${lang}.yml`)
    .output(`${gen_root}/js/${lang}.js`)
    .output(`${gen_root}/js/${lang}.json`);
});


// doJsBundles(root)
var bundlesTask = wb.doJsBundles(gen_root);

bundlesTask.add("lib",
    "js/mi2/mi2.js",
    "js/mi2/NWGroup.js",
    "js/mi2/*.js",
    "js/mi2/Base.js",
    "js/mi2/base/**.js",
    "js/qrcode.js"
).exclude(
    "js/mi2/base/TabPane.js",
    "js/mi2/base/RenderTable.js",
    "js/mi2/base/Pager.js",
    "js/mi2/base/MultiInput.js"
);
bundlesTask.add("app","js/site.js");

componentLibs.forEach(function(name){ 
  bundlesTask.add(name,`js/${name}/*.js`); 
});

// sassTask = function(input, outputStyle, generateSourceMap=false, generateSourceComments=false){
wb.doSass("src/scss/style.scss",dev_www,"expanded", false, true)
  .include("src/scss", "node_modules/bourbon/core");

// Generate bundles js (concat files that are already compresses)
wb.doExt("node","ext/concat.js")
  .input(gen_root+"/")
  .output(gen_root+"/")
  .srcRoot("src")
  .options({minify:false})
  .include("bundle.*.json");


// copy needed files to deply
wb.doCopy("src/js",    dev_www+"/src");// for debug
wb.doCopy("src/html",  dev_www).exclude("index.html");
wb.doCopy("src/font/fonts", dev_www+"/fonts").exclude("**/placeholder.txt");

var bundleLibs = bundles.map(i=>`bundle.${i}.js`);

wb.doCopy(gen_root, dev_www)
  .include(languages.map(lang=>`js/${lang}.js`))
  .include(bundleLibs)
  .include(bundleLibs.map(bundle=> bundle+".map"));


var pageSrc = "src/html/";
var pageToBuild =  "index.html";
if(argv.test){
  wb.doCopy("test_src/www", dev_www).exclude("*.html");
  pageSrc = "test_src/www/";
  pageToBuild =  "_test.html";
}


// Generate index.html with js and css
var index = wb.doHtmlScriptAndCss(pageSrc+pageToBuild, dev_www+"/"+pageToBuild)
  .scriptVariable("SCRIPTS")
  .scripts(bundleLibs)
  .css("style.css");


if(argv.proxy){
  wb.doProxy(8080)
    .wwwRoot(dev_www)
    // .httpsKeyStore('ext/ssl/keystore.jks')
    // .httpsKeyStorePass('keystorePass')
    .noCache('/')
    .noCache('/_test.html');
}

if(argv.livereload){
  wb.doLiveReload(dev_www).include(pageToBuild,"style.css")
    .pauseAfterCss(200);
}

wb.dumpTasks();



