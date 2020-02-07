/*
http://localhost:7700/3dp-cubes/test.html?oauth=github
http://3d.hrg.hr/cubes/?oauth=github

https://github.com/login/oauth/access_token?client_id=e6bd1aaa69a9630cdd56&scope=gist


*/
var GIST_LS_KEY = 'gist-auth-token'
var CLIENT_ID = 'e6bd1aaa69a9630cdd56';
var gitOauthUrl = 'https://github.com/login/oauth/authorize?client_id='+CLIENT_ID+'&scope=gist&state='+Math.random()

function readOauth(){
  var qParams = parseUrl(document.location.search)
  var headers = {Accept: 'application/json'} 
  fetchJson('http://3d.hrg.hr/cubes/token.php?code='+qParams.code, {method:'GET', headers}).then(resp=>{
    console.log('resp',resp);
    if(resp.access_token){
      localStorage.setItem(GIST_LS_KEY, resp.access_token)
    }
  })
}

function init(){
  if(document.location.href.indexOf('oauth=github') != - 1){
    readOauth()
    return
  }
  
  
  var test = {a:1,b:3}
  
  var canvas2 = document.getElementById('canvas2')
  canvas2.style.touchAction = 'none'
  
  var cfg = {angle:i, rx: 30, wx:4,wy:4,
    sizeForRotate:1, 
    resizeGrid: 0,
    symetricBottom:0}
  var cView2 = new CubeView3D(canvas2, cfg)
  
  var piece = cView2.pieceToArray('02.12.1-01')
  // var piece = cView2.pieceToArray('022223.333333.333333.022223')
  //piece = cView2.rotatePieceL(piece);
  
  var i=30
  var first = 1;

  function animateAngle(){
    cView2.setAngle(i)
    if(first){
      cView2.drawPiece(piece, 1)
    }else{
      cView2.clear()
      cView2.drawGrid()
      cView2.drawCubesFrom(0)
    }
    i += 2
    first = 0
    
    // setTimeout(animateAngle, 130) 
  }
  
  var pdown;
  var startX, startY, startAngle, oldCube;
  mi2JS.listen(canvas2, 'pointerup', function(evt){
    pdown = false
  });
  mi2JS.listen(canvas2, 'pointerdown', function(evt){
    pdown = true
    startAngle = i
    startX = evt.offsetX
    startY = evt.offsetY
    
    var cube = cView2.findCube(startX, startY)
    
    if(cube){
      pdown = false
      if(oldCube){
        delete oldCube.stroke
      }
      cube.stroke = 'red'
      cView2.drawCubesFrom(0)
      oldCube = cube
    }
    var grid = cube ? 0: cView2.findGrid(startX, startY)
    if(grid){
      pdown = false
      logObj(grid)
    }

  });

  mi2JS.listen(canvas2, 'pointermove', function(evt){
    
    if(pdown){
      i = startAngle - (evt.offsetX - startX)
      animateAngle()
    } 
  });
  


  animateAngle()
}

function logObj(obj){
  var str = ''
  for(var p in obj) {
    try{
    str += p + ': ' + JSON.stringify(obj[p]) + '<br>\n'
    }catch(e){} 
  } 
  console.log(str) 
}
