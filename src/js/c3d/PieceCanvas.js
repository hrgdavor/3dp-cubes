
mi2JS.addCompClass('c3d/PieceCanvas', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		
		this.listen(this.canvas.el, 'pointerdown', function(evt){
			var now = Date.now();

			if(!evt.ctrlKey && now - this.__lastDown < 500){
				this.animDirection *= -1;
				this.startAnim();
			}

			this.__lastDown = now;

			if(evt.ctrlKey) this.setValue(this.cubeView.rotatePieceL(this.piece));
			
			var x = evt.offsetX;
			var y = evt.offsetY;
		});

		this.listen(this.canvas.el, 'mousemove', function(evt){
			
		});

		this.animDirection = 1;
	};

	proto.startAnim = function(){
		this.__animStart = Date.now();
		this.__animStartAngle = this.cubeView.cfg.angle;
		cancelAnimationFrame(this.__anim);
		this.__anim = this.requestAnimationFrame(this.animateOffset);
	};

	proto.animateOffset = function(){
		var delta = Date.now() - this.__animStart;
		
		var oldAngle = this.cubeView.cfg.angle
		var delta = Math.round(this.animDirection * delta/20);
		var newAngle = this.__animStartAngle + delta;
		if(Math.abs(delta) > 360){
			cancelAnimationFrame(this.__anim);
			return;
		}

		if(oldAngle != newAngle){
			this.cubeView.setAngle(newAngle);
			this.cubeView.drawAll();
		}

		this.__anim = this.requestAnimationFrame(this.animateOffset);
	};

	proto.setConfig = function(cfg){
		var c = this.canvas.el;

		cfg = this.cfg = {...cfg, sizeForRotate:1}

		if(this.fixAA){
			c.style.zoom = ''+(1/this.fixAA);
			cfg.rx *= this.fixAA;
		}
		var cubeView = this.cubeView = new CubeView3D(c, cfg);
		this.maxOffset = this.cubeView.cubeDraw.offset;
		//this.cubeView.cubeDraw.offset = cfg.rx;
		if(this.fixAA){
			cubeView.cubeDraw.lineWidth = this.fixAA;
		}
	};

	proto.setValue = function(piece){
		var cubeView = this.cubeView;
		if(typeof piece == 'string') piece = cubeView.pieceToArray(piece);
		this.piece = piece;
		// piece = cubeView.rotatePiece(piece);
		// piece = cubeView.rotatePiece(piece);
		// piece = cubeView.rotatePiece(piece);
		cubeView.drawPiece(piece, 1, 1);	
	};

	proto.initTemplate = function(h,t,state, self){
		return <template>
				<canvas p="canvas" width="50" height="50"></canvas>
		</template>
	}

});