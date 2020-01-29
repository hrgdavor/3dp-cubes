

function init(){
  

  var canvas = document.getElementById('canvas')
  var canvas2 = document.getElementById('canvas2')
  var cubeView = new CubeView3D(canvas, {gridW: 10});
  cubeView.cubeDraw.offset=0
  var piece = cubeView.pieceToArray('1')
  cubeView.drawPiece(piece, 1,1)
  
  this.ctx = canvas2.getContext("2d");
  
  var cx =  100
  var rx = 100
  var cy = 150;
  var center = {x:cx, y:cy} 
  var i=35
  var cDraw = new CubeDraw2(ctx, 0,100, cx, cy)
  var cDraw2 = new CubeDraw2(ctx, 0, 20)
  function animateAngle(){
    cDraw.angle(i, rx)
    cDraw2.angle(i, 20)
    cDraw.drawTop()
    var points = cDraw.points
    var start = pointSum(points[0], center)
    var dx = cDraw2.getDx()
    var dy = cDraw2.getDy()
    start = pointSum(start, pointScale(dx, 0.5))
    start = pointSum(start, pointScale(dy, 0.5))
    cDraw2.move(start)
    cDraw2.draw()
    // cDraw2. drawTop(20)
    // i+=1
    setTimeout(animateAngle, 50)
  } 
  animateAngle()
}

function cubePointsForAngle(angle, rx){
  var ry = rx / 2
  angle = Math.PI * (angle - 45) / 180
  var points = []
  var sin = Math.sin(angle) * -1
  var cos = Math.cos(angle) * -1
  points.push({x: cos * rx, y: sin * ry})
  points.push({x:-sin * rx, y: cos * ry})
  points.push({x:-cos * rx, y:-sin * ry})
  points.push({x: sin * rx, y:-cos * ry})
  return points
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