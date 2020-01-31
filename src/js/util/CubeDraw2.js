function CubeDraw2(ctx,angle, rx, x = 0, y = 0) {
  this.ctx = ctx;
  this.move(x, y);
  this.angle(angle, rx)
  this._color1 = "#f0f0f0";
  this._color2 = "#d2d2d2";
  this._color3 = "#b0b0b0";
  this._stroke = "#000";
  this.lineWidth = 1;
  
  // this.fixAA = 0;
  // ctx.translate(0.5,0.5);
}
var proto = CubeDraw2.prototype;

proto.move = function(x, y) {
  if(y === void 0){
    this.x = x.x
    this.y = x.y
  }else{
    this.x = x;
    this.y = y || 0;
  }
  return this;
}

proto.angle = function(angle, rx){
  angle = angle % 360
  if (angle < 0) angle += 360
  
  this._angle = angle
  this.flipColors = (angle >= 90 && angle < 180) || angle >= 270
  if(rx !== void 0) this.rx = rx
  this.points = cubePointsForAngle(angle, this.rx)
  //this.rotatePoints(this.points, angle)
  return this
}

proto.rotatePoints = function(points, angle){
  while(angle > 90){
    points.unshift(points.pop())
    angle -= 90
  }
}

proto.getDx = function(){
  return cubeDxForAngle(this._angle, this.rx)
}

proto.getDy = function() {
  return cubeDyForAngle(this._angle, this.rx)
}
proto.getDx2 = function(){
  return cubeDxForAngle(this._angle % 90, this.rx)
}

proto.getDy2 = function() {
  return cubeDyForAngle(this._angle % 90, this.rx)
}

proto.line = function(p1, p2, oy=0) {
  var x = this.x
  var y = this.y - oy
  this.ctx.moveTo(x + p1.x, y + p1.y)
  this.ctx.lineTo(x + p2.x, y + p2.y)
}

proto.lineTo = function(p1,oy = 0) {
   var x = this.x
   var y = this.y - oy
   this.ctx.lineTo(x + p1.x, y + p1.y)
}

proto.moveTo = function(p1, oy = 0) {
  var x = this.x;
  var y = this.y - oy;
  this.ctx.moveTo(x + p1.x, y + p1.y);
} 

proto.drawTop = function(oy, stroke, color) {
  var p = this.points
  var ctx = this.ctx
  ctx.beginPath();
  
  this.moveTo(p[0], oy);
  this.lineTo(p[1], oy);
  this.lineTo(p[2], oy);
  this.lineTo(p[3], oy);
  
  ctx.fillStyle = color || this._color1;
  ctx.closePath();
  ctx.fill();

  if (stroke || this._stroke) this.doStroke(stroke);
  return this;
}

proto.drawLeft = function(stroke, color) {
  var p = this.points
  var ctx = this.ctx
  var rx = this.rx

  ctx.beginPath();
  
  this.moveTo(p[0], rx);
  this.lineTo(p[3], rx);
  this.lineTo(p[3]);
  this.lineTo(p[0]);
  
  ctx.fillStyle = color || (this.flipColors ? this._color3 : this._color2)
  ctx.closePath();
  ctx.fill();

  if (stroke || this._stroke) this.doStroke(stroke);
  return this;
}

proto.drawRight = function(stroke, color) {
  var p = this.points
  var ctx = this.ctx
  var rx = this.rx

  ctx.beginPath();
  
  this.moveTo(p[3], rx);
  this.lineTo(p[2], rx);
  this.lineTo(p[2]);
  this.lineTo(p[3]);
  ctx.fillStyle = color || (this.flipColors ? this._color2 : this._color3)
  ctx.closePath();
  ctx.fill();

  if (stroke || this._stroke) this.doStroke(stroke);
  return this;
}

proto.stroke = function(stroke) {
  this._stroke = stroke;
  return this;
}

proto.doStroke = function(stroke) {
  this.applyStroke(stroke);
  this.ctx.stroke();
}

proto.applyStroke = function(stroke) {
  this.ctx.lineWidth = this.lineWidth;
  this.ctx.strokeStyle = stroke || this._stroke;
}

proto.draw = function(x, y, stroke) {
  if(x !== void 0) this.move(x,y)

  
  this.drawLeft(stroke);
  this.drawRight(stroke);
  this.drawTop(this.rx, stroke);

  return this;
}
