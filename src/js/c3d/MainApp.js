
mi2JS.addCompClass('c3d/MainApp', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

//	proto.initChildren = function(){
//		superProto.initChildren.call(this)
//	}
	
	var defs = {}
	defs.cube1 = {
		name:'cube 1',
		pieces: 'A21.01--B111.100--C011.110--D12.10--E12.01--F111.010--G11.01',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}
	defs.inchard = {
		name:'Incredibly hard',
		link: 'http://puzzlewillbeplayed.com/333/Impuzzables/#blue', 
		designer: 'Gerard d\'Arcey', 
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Arcey.xml', 
		pieces: 'A1.2.11--B1.1.12--C02.12.1-0.01--D1.1.11--E1.12--E1.12',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}


	defs.flat_out = {
		name: 'Flat Out',
		link: 'http://puzzlewillbeplayed.com/333/FlatOut/',
		designer: 'Martin H. Watson',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Watson.xml',
		pieces: 'P11.11.01--U11.01.11--V111.001.001--T001.111.001--F001.111.010--W001.011.110--Z001.111.100--X010.111.010--A10.10',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.coffinsq = {
		name: 'Coffin\'s Quintet',
		link: 'http://puzzlewillbeplayed.com/333/CoffinsQuintet/',
		designer: 'Stewart T. Coffin.',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Coffin.xml',
		pieces: 'A12.10.11--B12.10.20--C11.02.01--D02.11.01--E10.12.01',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.knossos = {
		name: 'knossos',
		link: 'http://puzzlewillbeplayed.com/333/Knossos/',
		designer: 'Bernhard Schweitzer',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Schweitzer.xml',
		pieces: 'A211.010--B210.011--C021.110--D12.10--E21.10--F111.010',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.cubismerhan = {
		link:'https://diypuzzles.wordpress.com/2013/04/22/cubismerhan/',
		designer: 'Erhan Cubukcuoglu',
		designerLink: 'https://diypuzzles.wordpress.com/about/',
		pieces: 'A211.211--A211.211--B121.121--B121.121--C221.111--C221.111--D122.111--D122.111',
		// pieces: '011--010.020--010.000.300',
		piecesCfg: { wx:1, wy:1, wz:1, resizeGrid:1 },
		puzzles: [
			'4444.4444.4444.4444', //AABBCCDD
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
	}

	proto.init = function(){
		this.showPuzzle('cubismerhan')
	}

	proto.showPuzzle = function(code){
		

		var puzzleDef  = defs[code]
		var size = 16

		this.expandVars({puzzleName: puzzleDef.name || code})

		this.link.setHtml(puzzleDef.link ? '<a target="_blank" href="'+puzzleDef.link+'">(link)</a>':'')
		var str = ''
		if(puzzleDef.designer) str += 'Designer: <a target="_blank" href="'+puzzleDef.designerLink+'">'+puzzleDef.designer+'</a>. '
		this.credits.setHtml(str)

		this.piecesCfg = {...puzzleDef.piecesCfg, rx:size}
		
		this.puzzlesCfg = {...puzzleDef.puzzlesCfg, rx:size}
		
		var pieces = splitPieces(puzzleDef.pieces)
		this.loop.setValue(pieces)

		var puzzles = splitPieces(puzzleDef.puzzles)
		this.loop2.setValue(puzzles)
	}

	function splitPieces(def){
		if(typeof def == 'string')
			return def.split('--')
		return def
	}

	proto.on_itemCreated = function(evt){
		evt.item.fixAA = 2

		if(evt.src == this.loop)
			evt.item.setConfig(this.piecesCfg)
		else
			evt.item.setConfig(this.puzzlesCfg)
	}
	
	proto.initTemplate = function(h,t,state, self){
		return <template/>
	}

})