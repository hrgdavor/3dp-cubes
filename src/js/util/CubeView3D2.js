	function CubeView3D2(canvas, cfg) {
	  this.rx = cfg.rx;

	  this.canvas = canvas;
	  this.ctx = canvas.getContext("2d");
	  this.ctx.imageSmoothingEnabled = true;
	  this.cubeDraw = new CubeDraw2(this.ctx, 35, this.rx);


	  this.cfg = cfg;
	  this.setSize(cfg, 0, 1);

	  this.gridStroke = '#ddd';
	  this.gridFill = '#fff';

	}

	var proto = CubeView3D2.prototype;

	proto.setSize = function({ wx = 3, wy = 3, wz = 3 } = {}, resizeCanvas) {
	  this.wx = wx;
	  this.wy = wy;
	  this.wz = wz;

	  this.gh = wx + wy + wz * 2;
	  this.gw = wx * 2 + wy * 2;
	  this.oy = wy + wz * 2 - 3;
	  this.offsetY = (this.wy - 1) * this.cubeDraw.offset;

	  if (resizeCanvas) this.resizeCanvas();

	};

	proto.resizeCanvas = function() {
	  this.canvas.width = this.gw * this.cfg.gridW + (this.wx - this.wy) * this.cubeDraw.offset;
	  this.canvas.height = this.gh * this.cfg.gridW + (this.wy - this.wx) * this.cubeDraw.offset;
	};

	proto.toGrid = function(x = 0, y = 0, z = 0) {
	  return {
	    gx: x * 2 + y * 2,
	    gy: this.oy - y + x - z * 2
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
	};

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

	proto.rotatePiece = function(piece) {
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

	/*
		proto.drawGridX = function(){
			var ctx = this.ctx;
			var canvas = this.canvas;
			for(var x=1; x<this.gw; x++){
				ctx.beginPath();
		  		ctx.strokeStyle = x % 4 == 0 ? 'red':'gray';
				ctx.moveTo(x*this.gridW,0);
				ctx.lineTo(x*this.gridW, canvas.height);
				ctx.stroke();
			}
			for(var y=1; y<this.gh; y++){
				ctx.beginPath();
		  		ctx.strokeStyle = y % 4 == 2 ? 'red':'gray';

				ctx.moveTo(0, y*this.gridW,0, 0);
				ctx.lineTo(canvas.height, y*this.gridW);
				ctx.stroke();
			}
		}
	*/

	proto.resizeToPiece = function(piece, symetricBottom, resizeCanvas) {
	  var size = this.pieceToSize(piece, {}, symetricBottom);
	  this.setSize(size, resizeCanvas);
	};

	proto.drawPiece = function(piece, symetricBottom, resizeCanvas) {

	  if (this.cfg.resizeGrid) {
	    this.resizeToPiece(piece, symetricBottom, resizeCanvas);
	  }

	  var offset = this.cubeDraw.offset;
	  this.clear();
	  this.drawGrid();

	  for (var x = 0; x < this.wx; x++) {

	    for (var y = this.wy - 1; y >= 0; y--) {

	      for (var z = 0; z < this.wz; z++) {

	        if (piece[x] && piece[x][y] && piece[x][y][z]) {
	          this.cubeDraw
	            .move((x - y) * offset, (-x - y) * offset + this.offsetY)
	            .gmove(this.toGrid(x, y, z)).draw();
	        }
	      }
	    }
	  }

	}

	proto.drawCube = function(x = 0, y = 0, z = 0) {
	  this.cubeDraw.gmove(this.toGrid(x, y, z)).draw();
	}

	proto.drawGrid = function() {
	  var offset = this.cubeDraw.offset;

	  for (var x = 0; x < this.wx; x++) {

	    for (var y = 0; y < this.wy; y++) {

	      this.cubeDraw
	        .move((x - 1 - y + 1) * offset, (-x - 1 - y + 1) * offset + this.offsetY)
	        .gmove(this.toGrid(x, y, -1))
	        .drawTop(this.gridStroke, this.gridFill);
	    }
	  }
	};