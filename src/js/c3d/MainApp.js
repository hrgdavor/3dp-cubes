
mi2JS.addCompClass('c3d/MainApp', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

//	proto.initChildren = function(){
//		superProto.initChildren.call(this)
//	}
	
	var defs = {}
	defs.cube1 = {
		name:'cube 1',
		pieces: '21.01--111.100--011.110--12.10--12.01--111.010--11.01',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}
	defs.inchard = {
		name:'Incredibly hard',
		link: 'http://puzzlewillbeplayed.com/333/Impuzzables/#blue', 
		designer: 'Gerard d\'Arcey', 
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Arcey.xml', 
		pieces: '1.2.11--1.1.12--02.12.1-01--1.1.11--1.12--1.12',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}


	defs.flat_out = {
		name: 'Flat Out',
		link: 'http://puzzlewillbeplayed.com/333/FlatOut/',
		designer: 'Martin H. Watson',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Watson.xml',
		pieces: '11.11.01--11.01.11--111.001.001--001.111.001--001.111.010--001.011.110--001.111.100--010.111.010--1.1',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.coffinsq = {
		name: 'Coffin\'s Quintet',
		link: 'http://puzzlewillbeplayed.com/333/CoffinsQuintet/',
		designer: 'Stewart T. Coffin.',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Coffin.xml',
		pieces: '12.10.11--12.10.20--11.02.01--02.11.01--10.12.01',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.knossos = {
		name: 'knossos',
		link: 'http://puzzlewillbeplayed.com/333/Knossos/',
		designer: 'Bernhard Schweitzer',
		designerLink: 'http://puzzlewillbeplayed.com/-/designer/Schweitzer.xml',
		pieces: '211.010--210.011--021.110--12.10--21.10--111.010',
		piecesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 },
		puzzles: '333.333.333',
		puzzlesCfg: { wx:3, wy:3, wz:3, resizeGrid:1 }
	}

	defs.cubismerhan = {
		link:'https://diypuzzles.wordpress.com/2013/04/22/cubismerhan/',
		designer: 'Erhan Cubukcuoglu',
		designerLink: 'https://diypuzzles.wordpress.com/about/',
		pieces: 'A211.211--211.211--121.121--121.121--221.111--221.111--122.111--122.111',
		// pieces: '011--010.020--010.000.300',
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