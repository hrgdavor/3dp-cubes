
function CubeDraw(ctx,gridW,x=0,y=0, gx=0, gy=0){
  this.ctx = ctx;
  this.gridW = gridW;
  this.move(x,y);
  this.gmove(gx,gy);
  this._color1 = "#f0f0f0";
  this._color2 = "#d2d2d2";
  this._color3 = "#b0b0b0";
  this._stroke = "#000";
  this.lineWidth = 1;
  // this.fixAA = 0;
  // ctx.translate(0.5,0.5);
}
var proto = CubeDraw.prototype;

proto.move = function(x=0,y=0, gx=0, gy=0){
  this.x = x;
  this.y = y;
  return this;
}
proto.gmove = function(gx=0, gy=0){
	if(typeof gx == 'object'){
	  this.gx = gx.gx;
	  this.gy = gx.gy;		
	}else{
	  this.gx = gx;
	  this.gy = gy;
	}
  return this;
}

proto.line = function(x0,y0,x1,y1){
  var x = this.x + this.gx * this.gridW;
  var y = this.x + this.gy * this.gridW;
  this.ctx.moveTo(x + x0 * this.gridW, y + y0 * this.gridW);
  this.ctx.lineTo(x + x1 * this.gridW, y + y1 * this.gridW);
}
proto.lineTo = function(x1,y1){
  var x = this.x + this.gx * this.gridW;
  var y = this.x + this.gy * this.gridW;
  this.ctx.lineTo(x + x1 * this.gridW, y + y1 * this.gridW);
}
proto.moveTo = function(x0,y0){
  var x = this.x + this.gx * this.gridW;
  var y = this.x + this.gy * this.gridW;
  this.ctx.moveTo(x + x0 * this.gridW, y + y0 * this.gridW);
}

proto.drawTop = function(stroke, color){
	var ctx = this.ctx;
  ctx.beginPath();
  // if(this.fixAA) ctx.translate(0.5,0.5);
  this.moveTo(0,1); 
  this.lineTo(2,0); 
  this.lineTo(4,1); 
  this.lineTo(2,2);
  this.lineTo(0,1);
  ctx.fillStyle = color || this._color1;
  ctx.closePath();
  ctx.fill();

  if(this._stroke) this.doStroke(stroke);
  return this;
}

proto.drawLeft = function(stroke, color){
  var ctx = this.ctx;

  ctx.beginPath();
  // if(this.fixAA) ctx.translate(0.5,0.5);
  this.moveTo(0,1); 
  this.lineTo(2,2); 
  this.lineTo(2,4); 
  this.lineTo(0,3);
  this.lineTo(0,1);
  ctx.fillStyle = this._color2;
  ctx.closePath();
  ctx.fill();

  if(this._stroke) this.doStroke();
  return this;
}

proto.drawRight = function(stroke, color){
  var ctx = this.ctx;

  ctx.beginPath();
  // if(this.fixAA) ctx.translate(0.5,0.5);
  this.moveTo(2,2); 
  this.lineTo(4,1); 
  this.lineTo(4,3); 
  this.lineTo(2,4);
  this.lineTo(2,2);
  ctx.fillStyle = this._color3;
  ctx.closePath();
  ctx.fill();

  if(this._stroke) this.doStroke();
  return this;
}

proto.stroke = function(stroke){
	this._stroke = stroke;
	return this;
}

proto.doStroke = function(stroke){
  	this.applyStroke(stroke);
  	this.ctx.stroke();
}

proto.applyStroke = function(stroke){
    this.ctx.lineWidth = this.lineWidth;
  	this.ctx.strokeStyle = stroke || this._stroke;
}

proto.draw = function(gx,gy){
  if(gx != void 0 && gy != void 0) this.gmove(gx,gy);

  this.drawTop();
  this.drawLeft();
  this.drawRight();
  

  return this;
}

proto.drawLines = function(gx,gy){
  if(gx != void 0 && gy != void 0) this.gmove(gx,gy);
  
  this.line(0,1,2,0); this.line(2,0,4,1);
  this.line(0,1,2,2); this.line(2,2,4,1);

  this.line(0,1,0,3); 
  this.line(2,2,2,4);
  this.line(4,1,4,3); 

  this.line(0,3,2,4); this.line(2,4,4,3);

  this.ctx.stroke();
  return this;
}

