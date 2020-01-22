	function CubePiece(def){
		this.maxX = 0;
		this.maxY = 0;
		this.maxZ = 0;
		this.items = [];
	}

	var proto = CubePiece.prototype;

	proto.add = function(item){
		this.maxX = Math.max(this.maxX, item.x);
		this.maxY = Math.max(this.maxY, item.y);
		this.maxZ = Math.max(this.maxZ, item.z);

		// todo sort by z index
		this.items.push(item);
	};

