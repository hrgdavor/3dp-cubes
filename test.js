

function init(){
  
  var test = {a:1,b:3}
  
  var canvas2 = document.getElementById('canvas2')
  canvas2.style.touchAction = 'none'
  
  var cfg = {angle:i, rx: 40, wx:3,wy:3, sizeForRotate:1, symetricBottom:0}
  var cView2 = new CubeView3D2(canvas2, cfg)
  
  var piece = cView2.pieceToArray('300003.000000.300013')
  // var piece = cView2.pieceToArray('022223.333333.333333.022223')
  piece = cView2.rotatePieceL(piece);
  
  var i=30
  var first = 1;

  function animateAngle(){
    cView2.setAngle(i)
    cView2.drawPiece(piece, first || !cfg.sizeForRotate)
    i += 2
    first = 0
    
    // setTimeout(animateAngle, 30) 
  }
  
  var pdown;
  var startX, startY, startAngle;
  mi2JS.listen(canvas2, 'pointerup', function(evt){
    pdown = false
  });
  mi2JS.listen(canvas2, 'pointerdown', function(evt){
    pdown = true
    startAngle = i
    startX = evt.offsetX
    startY = evt.offsetY
    
    var cube = cView2.findCube(startX, startY)
    
    if(cube && 0){
      pdown = false
      cView2.drawCubeRest(-1)
      cView2.drawCube(cube, 'red')
      cView2.drawCubeRest(cube.index)
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