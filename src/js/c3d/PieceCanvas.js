
mi2JS.addCompClass('c3d/PieceCanvas', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		
		var pdown;
		var startX, startY, startAngle, oldCube;
		
		this.listen(this.canvas.el, 'pointerup', function(evt){
			pdown = false
			this.canvas.el.releasePointerCapture(evt.pointerId)
		});

		this.listen(this.canvas.el, 'pointerdown', function(evt){
			var now = Date.now();

			if(!evt.ctrlKey && now - this.__lastDown < 300){
				this.animDirection = evt.offsetX < this.el.offsetWidth / 2 ? 1:-1;
				this.startAnim();
			}else{

				cancelAnimationFrame(this.__anim)

				pdown = true
				this.canvas.el.setPointerCapture(evt.pointerId)
				
				startAngle = this.cubeView.cfg.angle
				startX = evt.offsetX
				startY = evt.offsetY

			}

			this.__lastDown = now;
		});


		this.listen(this.canvas.el, 'pointermove', function(evt){
			if(pdown){
				var newAngle = startAngle - (evt.offsetX - startX)
				this.cubeView.setAngle(newAngle);
				this.cubeView.drawAll();
			} 
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
		if(Math.abs(delta) > 90){
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
		var name = '';
		if(typeof piece == 'string'){
		    if (/[a-zA-Z]/.test(piece[0])) name = piece[0];
			piece = cubePieceToArray(piece);
		} 
		this.piece = piece;
		this.expandVars({name});
		// piece = cubeView.rotatePiece(piece);
		// piece = cubeView.rotatePiece(piece);
		// piece = cubeView.rotatePiece(piece);
		cubeView.drawPiece(piece, 1, 1);	
	};

	proto.initTemplate = function(h,t,state, self){
		return <template>
			<b>{state.name}</b>
			<canvas p="canvas" width="50" height="50"></canvas>
		</template>
	}

});