/* jshint browser:true, jquery:true, esversion: 6 */

/*
http://localhost:7700/3dp-cubes/test.html?oauth=github
http://3d.hrg.hr/cubes/?oauth=github

https://github.com/login/oauth/access_token?client_id=e6bd1aaa69a9630cdd56&scope=gist


*/
var GIST_LS_KEY = 'gist-auth-token';
var CLIENT_ID = 'e6bd1aaa69a9630cdd56';
var gitOauthUrl = 'https://github.com/login/oauth/authorize?client_id='+ 
    CLIENT_ID + '&scope=gist&state='+Math.random();

function readOauth(){
  var qParams = parseUrl(document.location.search);
  var headers = {Accept: 'application/json'};
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
  var cubes = [];
  var canvas2 = document.getElementById('canvas2')
  canvas2.style.touchAction = 'none'
  
  var cfg = {angle:curAngle, rx: 35, wx:5,wy:5,wz:5,
    sizeForRotate:1, 
    resizeGrid: 0,
    symetricBottom:0}
  var cView2 = new CubeView3D(canvas2, cfg)
  
  var piece = cubePieceToArray('02.12.1-0.01')
  console.log(cubeArrayToPiece(piece))
  // var piece = cubePieceToArray('022223.333333.333333.022223')
  //piece = cView2.rotatePieceL(piece);
  
  var curAngle=30
  var first = 1;
  var gridSelected = {x:-1,y:-1,stroke:'red'}

  function circlePos(circle){
    if(circle) return cView2.toPx( 
        circle.x + (circle.ox || 0), 
        circle.y + (circle.oy || 0),
        circle.z + (circle.oz || 0)
      )
  }

  function redrawCube(){
     var ctx = cView2.ctx;
     cView2.clear()
     cView2.drawGrid([gridSelected])
     cView2.drawCubesFrom(0);
     var rx = cView2.cfg.rx;
     if(oldCube || gridSelected.x > -1){
      var first = circlePos(oldCube) ;
      for(var i=cubes.length-1; i>=0; i--){
        cube = cubes[i];
        var pos = circlePos(cube);
        drawCircle(pos, rx/2);
        if(i>0){
          ctx.moveTo(first.x,first.y-rx/2);
          ctx.lineTo(pos.x,pos.y-rx/2);
        }
        ctx.strokeStyle = cube.del ? 'red':'green';
        ctx.fillStyle = '#ffffffcc';
        ctx.fill();
        ctx.stroke();
      };

     }
  }

  function drawCircle(pos, radius){
      var ctx = cView2.ctx;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - radius, radius, 0, Math.PI *2)
  }

  window.minusCube = function(cube){
    if(!cube) cube = oldCube;
    if(cube) {
      cView2.removeCube(cube)
      gridSelected.x = cube.x
      gridSelected.y = cube.y
      oldCube = cView2.findCube({x:cube.x, y:cube.y, z:cube.z-1})
      if(oldCube) {
        oldCube.stroke = 'red'
        gridSelected.x = - 1
        recalcCubes(oldCube);
      }else{
        cubes = [{...gridSelected, z:0}] 
      }

      redrawCube()
    } 
  }
  
  window.plusCube = function(cube){
    var newCube = {stroke:'red'}
    if(cube){
        newCube = {...newCube, ...cube, ox:0,oz:0,oy:0};
    }else if(oldCube && (oldCube.z+1)<cView2.cfg.wz){
      newCube.x = oldCube.x
      newCube.y = oldCube.y
      newCube.z = oldCube.z + 1
    }else if(gridSelected.x != -1){
      newCube.x = gridSelected.x
      newCube.y = gridSelected.y
      newCube.z = 0
    }
    var taken = cView2.findCube(newCube)
    
    while(taken){
      newCube.z++
      taken = cView2.findCube(newCube)
    }
    if(newCube.z < cView2.cfg.wz){
      cView2.addCube(newCube)
      if(oldCube) oldCube.stroke = null
      gridSelected.x = -1
      oldCube = newCube
      recalcCubes(oldCube);
      redrawCube()
    }
  }
  
  window.saveCube = function(){
    var piece = cubeListToArray(cView2.cubes)
    var str = cubeArrayToPiece(piece)
    console.log(str) 
    localStorage.setItem('3d.cube.def', str)
  }
  
  window.loadCube = function(){
    var piece = cubePieceToArray(localStorage.getItem('3d.cube.def'))
    cView2.drawPiece(piece, 1)
    oldCube = null
  }

  window.clearCube = function(){
    cView2.drawPiece([], 1)
    oldCube = null
  }

  function animateAngle(){
    cView2.setAngle(curAngle)
    if(first){
      cView2.drawPiece(piece, 1)
      first = 0
    }else{
      redrawCube()
    }
    curAngle += 2
    
    
    // setTimeout(animateAngle, 130) 
  }

  function recalcCubes(cube){
      cubes = [{...cube, del:1, oz:0}];
      let tmp;

      tmp = {...cube, z:cube.z -1, oz:-0.25}
      if(tmp.z >= 0 && !cView2.findCube(tmp)) cubes.push(tmp);

      tmp = {...cube, x:cube.x -1, ox:-0.25}
      if(tmp.x >= 0 && !cView2.findCube(tmp)) cubes.push(tmp);
      
      tmp = {...cube, z:cube.z +1, oz:0.25}
      if(tmp.z < cView2.cfg.wz && !cView2.findCube(tmp)) cubes.push(tmp);

      tmp = {...cube, x:cube.x +1, ox:0.25}
      if(tmp.x < cView2.cfg.wx && !cView2.findCube(tmp)) cubes.push(tmp);

      tmp = {...cube, y:cube.y -1, oy: -0.25}
      if(tmp.y >=0 && !cView2.findCube(tmp)) cubes.push(tmp);

      tmp = {...cube, y:cube.y +1, oy: 0.25}
      if(tmp.y < cView2.cfg.wy && !cView2.findCube(tmp)) cubes.push(tmp);    


  }
  
  var pdown;
  var startX, startY, startAngle, oldCube;
  
  mi2JS.listen(canvas2, 'pointerup', function(evt){
    pdown = false
  });
  
  mi2JS.listen(canvas2, 'pointerdown', function(evt){
    pdown = true
    startAngle = curAngle
    startX = evt.offsetX
    startY = evt.offsetY

    var rx = cView2.cfg.rx;
    var rx2 = rx/2*rx/2
    
    if(cubes) for(var i=0; i<cubes.length; i++){
      let tmp = cubes[i];
      let pos = circlePos(tmp);
      let dx = pos.x - startX
      let dy = pos.y - startY - rx/2

      if(dx*dx + dy*dy < rx2) {
        if(tmp.del)
          minusCube(tmp);
        else
          plusCube(tmp);
        pdown = false;
        return;
      }
    }

    var cube = cView2.findCubePx(startX, startY)
    
    if(cube && cube != oldCube){
      pdown = false
      
      cube.stroke = 'red'
    }
    
    var grid = cube ? 0: cView2.findGrid(startX, startY)
    
    if(grid){
      pdown = false
      gridSelected.x = grid.x
      gridSelected.y = grid.y
    }
    
    if(!pdown){
      if (oldCube) {
        delete oldCube.stroke
      }
      if(cube){
        recalcCubes(cube);
      }else{
        cubes = [{...gridSelected, z:0}]
      }
      oldCube = cube

      if(!grid) gridSelected.x = -1
      
      redrawCube()
    }

  });

  mi2JS.listen(canvas2, 'pointermove', function(evt){
    
    if(pdown){
      curAngle = startAngle - (evt.offsetX - startX)
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
