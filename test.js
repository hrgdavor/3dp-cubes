

function init(){
  
  var test = {a:1,b:3}
  
  var canvas2 = document.getElementById('canvas2')
  canvas2.style.touchAction = 'none'
  
  var cfg = {angle:i, rx: 30, wx:3,wy:3, sizeForRotate:1, symetricBottom:0}
  var cView2 = new CubeView3D2(canvas2, cfg)
  
  var piece = cView2.pieceToArray('311003.000000.311013')
  // var piece = cView2.pieceToArray('022223.333333.333333.022223')
  piece = cView2.rotatePieceL(piece);
  
  var i=0
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
    
    setTimeout(animateAngle, 130) 
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
      var index = cube.index
      if(oldCube){
        delete oldCube.stroke
        index = Math.min(index,oldCube.index)
      }
      cube.stroke = 'red'
      cView2.drawCubesFrom(index)
      oldCube = cube
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

function cubePointsForAngle(angle, rx){
  var ry = rx / 2
  angle = angle % 90
  if (angle < 0) angle += 90
  
  angle = Math.PI * (angle - 45) / 180
  var points = []
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  points.push({x:-cos * rx, y:-sin * ry})
  points.push({x: sin * rx, y:-cos * ry})
  points.push({x: cos * rx, y: sin * ry})
  points.push({x:-sin * rx, y: cos * ry})
  return points
}

function cubeDxForAngle(angle, rx){
  angle = Math.PI * (angle - 45) / 180
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  return {x: (cos - sin) * rx, y: (sin + cos) * rx/2} 
  
}

function cubeDyForAngle(angle, rx) {
  angle = Math.PI * (angle - 45) / 180
  var sin = Math.sin(angle)
  var cos = Math.cos(angle)
  return { x: (cos + sin) * rx, y: (sin - cos) * rx / 2 }
  
}

function pointDelta(p1, p2){
  return {x: p2.x-p1.x, y: p2.y-p1.y} 
}

function pointSum(p1, p2){
  return {x: p2.x+p1.x, y: p2.y+p1.y} 
}

function pointScale(p, scale){
  return {x: p.x * scale, y: p.y * scale} 
}