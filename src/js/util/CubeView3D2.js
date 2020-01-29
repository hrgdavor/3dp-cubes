	function CubeView3D2(canvas, cfg={}, resize) {
	  
	  this.cfg = cfg = {
	      rx: 10,
	      angle: 30,
	      wx: 3, wy: 3, wz: 3,
	      fitCanvas: 0,
	      sizeForRotate: 1,
	      resizeGrid: 1,
	      symetricBottom: 0,
	      gridStroke: '#ddd',
	      gridFill: '#fff'
	  ,... cfg}
    
	  this.canvas = canvas;
	  this.ctx = canvas.getContext("2d");
	  this.ctx.imageSmoothingEnabled = true;

	  this.setAngle(cfg.angle, cfg.rx)
	  this.setGridSize(cfg, resize)

	}

	var proto = CubeView3D2.prototype;
  
proto.setAngle = function(angle, rx){
    angle = angle % 360
    if(angle < 0) angle += 360
    this.cfg.angle = angle
    
    if(rx === void 0) rx = this.cfg.rx
    this.cfg.rx = rx
    
    if(!this.cubeDraw){
      this.cubeDraw = new CubeDraw2(this.ctx, angle, rx);
    }else{
      this.cubeDraw.angle(angle, rx)
    }
    this.bounds = this.getBounds()
}
  
	proto.setGridSize = function({ wx = 3, wy = 3, wz = 3 } = {}, resize) {
	  var cfg = this.cfg
	  
	  cfg.wx = wx
	  cfg.wy = wy
	  cfg.wz = wz

	  if (resize){
	    if(this.cfg.fitCanvas){
	    	this.resizeView()
	    }else{
  	    	this.resizeCanvas();
	    }
	  }
	};

	proto.getBounds = function(){
		var dx = this.cubeDraw.getDx()
		var dy = this.cubeDraw.getDy()
		var cfg = this.cfg
    
    
		var rx = cfg.rx
		var angle = cfg.angle
		var ret = {dx, dy, rx}
		
		var wx = cfg.wx
		var wy = cfg.wy
		var wz = cfg.wz
		
		var gridH = Math.max(wx, wy)
		
		if(cfg.sizeForRotate){
			// angle where piece takes most space to draw
			var myAngle = Math.atan(wx/wy) / Math.PI * 180;

			var dx1 = cubeDxForAngle(myAngle, rx);
			var dy1 = cubeDyForAngle(myAngle, rx);

		    var gridH = (Math.abs(dx1.y*wx) + Math.abs(dy1.y*wy))

			ret.h = wz * rx + gridH
			ret.w = gridH * 2

		}else{
		
			gridH = Math.abs(dx.y*wx) + Math.abs(dy.y*wy)
			
			ret.h = wz * rx + gridH
			ret.w = Math.abs(dx.x*wx) + Math.abs(dy.x*wy)
		  // console.log(gridH, ret.w, ret.w/gridH);
		  // if(angle < 90){
		  //   ret.sx = (dx.x+dy.x) / 2
		  //   ret.sy = wz * rx - dy.y * (wy-0.5) + dx.y /2
		  // }else if(angle<180) {
		  //   ret.sx = -dx.x * (wx-0.5) + dy.x / 2
		  //   ret.sy = wz * rx + (dy.y + dx.y) / 2
		  // }else if(angle < 270){
		  //   ret.sx = ret.w + (dx.x + dy.x) / 2
		  //   ret.sy = ret.h - dy.y * (wy - 0.5) + dx.y/2
		  // }else{
		  //   ret.sx = ret.w - dx.x * (wx-0.5) + dy.x / 2
		  //   ret.sy = ret.h + (dy.y + dx.y) / 2
		  // }

		}

		ret.cx = ret.w / 2
		ret.cy = wz * rx + gridH / 2
	  
		ret.sx = ret.cx - dx.x * (wx-1)/2 - dy.x * (wy-1)/2
		ret.sy = ret.cy - dx.y * (wx-1)/2 - dy.y * (wy-1)/2

		return ret;
	}

	proto.resizeCanvas = function() {
		var bounds = this.bounds = this.getBounds()

		this.canvas.width = bounds.w
		this.canvas.height = bounds.h
	};
	
	proto.resizeView = function(){
	  var bounds = this.bounds = this.getBounds()
	  var wRatio = this.canvas.width / bounds.w 
	  var hRatio = this.canvas.height / bounds.h
	  var rx = bounds.rx * Math.min(wRatio, hRatio)
	  this.setAngle(this.cubeDraw._angle, rx)
	  
	}

	proto.toPx = function(x = 0, y = 0, z = 0) {
	   var bounds = this.bounds
	   var dx = bounds.dx
	   var dy = bounds.dy
	   
	   return {
	     x: bounds.sx + dx.x * x + dy.x * y, 
	     y: bounds.sy + dx.y * x + dy.y * y - z * bounds.rx
	   }
	};

	proto.pieceToSize = function(piece, { wx = 1, wy = 1, wz = 1 } = {}, symetricBottom) {

		var newSize = { wx: Math.max(wx, piece.length), wy, wz };

		piece.forEach(liney => {
			newSize.wy = Math.max(newSize.wy, liney.length);
			
			liney.forEach(linez => {
				newSize.wz = Math.max(newSize.wz, linez.length);
			})
		});
		
		if (symetricBottom) {
			newSize.wx = newSize.wy = Math.max(newSize.wx, newSize.wy);
		}
		return newSize;
	}

	proto.pieceToArray = function(str) {
	  var ret = [];
	  var lines = str.split('.');
	  for (var x = 0; x < this.wx || x < lines.length; x++) {
	    ret[x] = [];
	    var line = lines[x] || '';
	    for (var y = 0; y < this.wy || y < line.length; y++) {
	      ret[x][y] = [];
	      var height = parseFloat(line[y] || '0')
	      for (var z = 0; z < this.wz || z < height; z++) {
	        ret[x][y][z] = z < height ? 1 : 0;
	      }
	    }
	  }
	  return ret;
	};

	proto.clear = function(piece) {
	  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	proto.rotatePieceR = function(piece) {
	  var maxY = 0;
	  piece.forEach(row => { maxY = Math.max(maxY, row.length) });

	  var ret = [];
	  for (var y = maxY - 1; y >= 0; y--) {
	    for (var x = 0; x < piece.length; x++) {
	      var newY = maxY - y - 1;
	      if (!ret[newY]) ret[newY] = [];
	      var z = piece[x][y];
	      ret[newY].push(z ? mi2JS.copy(z) : []);
	    }
	  }
	  return ret;
	};

  proto.rotatePieceL = function(piece) {
    var maxY = 0;
    piece.forEach(row => { maxY = Math.max(maxY, row.length) });
  
    var ret = [];
    for (var y = maxY - 1; y >= 0; y--) {
      for (var x = 0; x < piece.length; x++) {
        var newY = y
        if (!ret[newY]) ret[newY] = [];
        var z = piece[x][y];
        ret[newY].unshift(z ? mi2JS.copy(z) : []);
      }
    }
    return ret;
  };

	proto.resizeToPiece = function(piece, resizeCanvas) {
	  var size = this.pieceToSize(piece, {}, this.cfg.symetricBottom);
	  this.setGridSize(size, resizeCanvas);
	};

	proto.drawPiece = function(piece, resizeCanvas) {

	  if (this.cfg.resizeGrid) {
	    this.resizeToPiece(piece, resizeCanvas);
	  }
	  
    var cfg = this.cfg
    var cubes = this.cubes = []
	  var offset = this.cubeDraw.offset;
	  var angle = this.cubeDraw._angle
	  this.clear();
	  this.drawGrid();
	  
	  var revX = angle > 180
	  var startX = revX ? cfg.wx-1 : 0
	  var endX = revX ? -1 : cfg.wx 
	  var stepX = revX ? -1 : 1
	  
	  var revY = angle < 90 || angle > 270
	  var startY = revY ? cfg.wy-1 : 0
	  var endY = revY ? -1 : cfg.wy 
	  var stepY = revY ? -1 : 1
	  

	  for (var x = startX; x != endX; x+=stepX) {

	    for (var y = startY; y != endY ; y+=stepY) {

	      for (var z = 0; z < cfg.wz; z++) {

	        if (piece[x] && piece[x][y] && piece[x][y][z]) {
	          var pos = this.toPx(x,y,z)
	          this.cubeDraw
	            .move(pos)
	            .draw();
	            cubes.push({x, y, z, pos})
	        }
	      }
	    }
	  }
	  //this.cubes = cubes.reverrse()

	}
	
	proto.findCube = function(px, py){
	  var rx = this.cfg.rx
	  var rx2 = rx*rx
	  for(var i=this.cubes.length-1; i>=0; i--){
	    var cube = this.cubes[i]
	    var dx = cube.pos.x - px
	    var dy = cube.pos.y - py
	    
	    if(dx*dx + dy*dy < rx2) {
	      cube.index = i
	      return cube
	    } 
	  }
	}
	
	proto.drawCube = function(cube, stroke){
	  this.cubeDraw.draw(cube.pos,void 0,stroke)
	}
	
	proto.drawCubeRest = function(index){
	  for(var i=index+1; i<this.cubes.length; i++){
	    this.cubeDraw.draw(this.cubes[i].pos)
	  }
	}


	proto.drawGrid = function() {
	  var cfg = this.cfg
	  

	  for (var x = 0; x < cfg.wx; x++) {

	    for (var y = 0; y < cfg.wy; y++) {
       
	      this.cubeDraw
	        .move(this.toPx(x,y))
	        .drawTop(0, cfg.gridStroke, cfg.gridFill)
	    }
	  }
	};