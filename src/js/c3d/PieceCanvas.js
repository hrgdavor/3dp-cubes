
mi2JS.addCompClass('c3d/PieceCanvas', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		this.listen(this.canvas.el, 'mousedown', function(){
			console.log('this.piece',this.piece);
			this.setValue(this.cubeView.rotatePiece(this.piece));
		});
	};

	proto.setConfig = function(cfg){
		var c = this.canvas.el;

		cfg = this.cfg = mi2.copy(cfg);

		if(this.fixAA){
			c.style.zoom = ''+(1/this.fixAA);
			cfg.gridW *= this.fixAA;
		}
		var cubeView = this.cubeView = new CubeView3D(c, cfg);
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
		cubeView.drawPiece(piece);		
	};

	proto.initTemplate = function(h,t,state, self){
		return <template>
				<canvas p="canvas" width="50" height="50"></canvas>
		</template>
	}

});