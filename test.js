

function init(){
  
  var test = {a:1,b:3}
  
  var canvas2 = document.getElementById('canvas2')
  canvas2.style.touchAction = 'none'
  
  var cfg = {angle:i, rx: 30, wx:3,wy:3, sizeForRotate:1, symetricBottom:0}
  var cView2 = new CubeView3D(canvas2, cfg)
  
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
    
    if(cube  && cube.isTop){
      pdown = false
      if(oldCube){
        delete oldCube.stroke
      }
      cube.stroke = 'red'
      cView2.drawCubesFrom(0)
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
