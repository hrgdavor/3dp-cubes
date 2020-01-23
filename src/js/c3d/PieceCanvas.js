
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

			if(evt.ctrlKey) this.setValue(this.cubeView.rotatePiece(this.piece));
			
			var x = evt.offsetX;
			var y = evt.offsetY;
			console.log('evt',x,y,evt);
		});

		this.listen(this.canvas.el, 'mousemove', function(evt){
			
		});

		this.animDirection = 1;
	};

	proto.startAnim = function(){
		this.__animStart = Date.now();
		this.__animStartOffset = this.cubeView.cubeDraw.offset;
		cancelAnimationFrame(this.__anim);
		this.__anim = this.requestAnimationFrame(this.animateOffset);
	};

	proto.animateOffset = function(){
		var delta = Date.now() - this.__animStart;
		
		var oldOffset = this.cubeView.cubeDraw.offset;
		var newOffset = this.__animStartOffset + Math.round(this.animDirection * delta/50);
		if(Math.abs(newOffset) > this.maxOffset){
			cancelAnimationFrame(this.__anim);
			return;
		}

		if(oldOffset != newOffset){
			this.cubeView.cubeDraw.offset = newOffset;
			this.setValue(this.piece);
		}
		this.__anim = this.requestAnimationFrame(this.animateOffset);
	};

	proto.setConfig = function(cfg){
		var c = this.canvas.el;

		cfg = this.cfg = mi2.copy(cfg);

		if(this.fixAA){
			c.style.zoom = ''+(1/this.fixAA);
			cfg.gridW *= this.fixAA;
		}
		var cubeView = this.cubeView = new CubeView3D(c, cfg);
		this.maxOffset = this.cubeView.cubeDraw.offset;
		//this.cubeView.cubeDraw.offset = cfg.gridW;
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