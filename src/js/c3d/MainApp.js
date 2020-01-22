
mi2JS.addCompClass('c3d/MainApp', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

//	proto.initChildren = function(){
//		superProto.initChildren.call(this);
//	};

	var piecesKnossos = '211.010--210.011--021.110--12.10--21.10--111.010';
	var piecesCubismerhan = '211.211--121.121--221.111--122.111';
	var piecesCube1 = '21.01--111.100--011.110--12.10--12.01--111.010--11.01';

	var knossos = {
		pieces: '211.010--210.011--021.110--12.10--21.10--111.010',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	};

	var cubismerhan = {
		// pieces: '211.211--211.211--121.121--121.121--221.111--221.111--122.111--122.111',
		pieces: '011--010.020--010.000.300',
		piecesCfg: { wx:1, wy:1, wz:1, resizeGrid:1 },
		puzzles: [
			'4444.4444.4444.4444',
			'2222.3333.3333.3333.3333.2222',
			'0440.4444.4444.0440.0440.0440',
			'2222.2332.2552.2552.2332.2222',
			'022220.222222.222222.222222.222222.022220',
			'334.344.344.344.344.334',
			'0044.0044.0044.4444.4400.4400.4400',
			'022220.444444.444444.022220',
			'2244.2224.2224.2224.2224.2244'
			],
		puzzlesCfg: { wx:1, wy:1, wz:1, resizeGrid:1 }
	};

	proto.init = function(){
		var puzzleDef  = cubismerhan;
		
		this.piecesCfg = mi2.copy(puzzleDef.piecesCfg);
		this.piecesCfg.gridW = 30;
		
		this.puzzlesCfg = mi2.copy(puzzleDef.puzzlesCfg);
		this.puzzlesCfg.gridW = 30;
		
		var pieces = splitPieces(puzzleDef.pieces);
		this.loop.setValue(pieces);
		this.loop.getItem(0).cubeView.drawGridX();

		var puzzles = splitPieces(puzzleDef.puzzles);
		this.loop2.setValue(puzzles);
	}

	function splitPieces(def){
		if(typeof def == 'string')
			return def.split('--');
		return def;
	}

	proto.on_itemCreated = function(evt){
		evt.item.fixAA = 2;

		if(evt.src == this.loop)
			evt.item.setConfig(this.piecesCfg);
		else
			evt.item.setConfig(this.puzzlesCfg);
	};
	
	proto.initTemplate = function(h,t,state, self){
		return <template/>
	}

});