

function init(){
  

  var canvas = document.getElementById('canvas')
  var canvas2 = document.getElementById('canvas2')
  var cubeView = new CubeView3D(canvas, {gridW: 10});
  cubeView.cubeDraw.offset=0
  var piece = cubeView.pieceToArray('1')
  cubeView.drawPiece(piece, 1,1)
  
  this.ctx = canvas2.getContext("2d");
  
  var cx =  100;
  var cy = 50;
  var i=0;
  
  function animateAngle(){
    var rx = 20
    var ry = rx / 2
    var angle = Math.PI * i /180;
    ctx.clearRect(0,0,canvas2.width, canvas2.height)
    ctx.beginPath()
    //ctx.moveTo(cx,cy)
    var sin = Math.sin(angle)*-1
    var cos = Math.cos(angle)*-1
    ctx.moveTo(cx+cos*rx, cy+sin*ry)
    ctx.lineTo(cx-sin*rx, cy+cos*ry)
    ctx.lineTo(cx-cos*rx, cy-sin*ry)
    ctx.lineTo(cx+sin*rx, cy-cos*ry)
    ctx.closePath()
    ctx.stroke()
    i+=10
    setTimeout(animateAngle, 100)
  } 
  animateAngle()
}
