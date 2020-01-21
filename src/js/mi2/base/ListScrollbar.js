
mi2JS.addCompClass('base/ListScrollbar', 'Base', '<div></div>',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, superComp){

	var mi2 = mi2JS;

	proto.initChildren = function(){
		superProto.initChildren.call(this);
 
		this.allData = this.data = this.chunk = [];
		this.limit = 0;
		this.offset = 0;
		this.scrollAmount = 0;
		this.filter = null;
		this.sort = null;
		this.bar = this.el.firstElementChild;
		this.listen(this.el,'click');
		this.listen(this.el.parentNode,'mouseover', this.updateScroll);
		this.listen(this.bar,'mousedown');
		this.listen(document,'mousemove');
		this.listen(document,'mouseup');
		this.minLength = 20;
	};

	proto.on_click = function(evt){
		if(evt.target == this.el){
			var rect = this.el.getBoundingClientRect();
			var to = ((evt.pointerY()-rect.top)/this.el.offsetHeight);
			this.fireEvent({name:'scrollTo',pos:to});
			this.setOffset( Math.floor(to*this.data.length) );
			this.updateScroll();
		}
	};

	proto.on_mousedown = function(evt){
		evt.stop();
		this.addClass('scroll-moving');
		this.mousedown = true;
	};

	proto.on_mousemove = function(evt){
		if(!this.mousedown) return;
		evt.stop();
		var rect = this.el.getBoundingClientRect();
		var to = ((evt.pointerY()-rect.top)/this.el.offsetHeight);
		this.setOffset( Math.floor(to*this.data.length) );		
	};

	proto.on_mouseup = function(evt){
		if(!this.mousedown) return;
		this.removeClass('scroll-moving');
		this.mousedown = false;
	};

	proto.setValue = function(offset,range,max){
		var hor = this.attr('direction') == 'horizontal';
		var style = this.bar.style;
		var maxSize = hor ? this.el.offsetWidth : this.el.offsetHeight;
		var len = Math.floor( (range/max)*maxSize );
		if(len<this.minLength){
			maxSize -= this.minLength;
			range = max/(maxSize)*this.minLength;
			len = this.minLength;
		} 
		var pos = Math.floor( ((offset+range)/max)*(maxSize))-len;
		if(hor){
			style.width = len+'px';
			style.left = pos+'px';
		}else{
			style.height = len+'px';
			style.top = pos+'px';
		}
	};

	proto.init = function(list, scrollAmount){
		this.list = list;
		this.scrollAmount = scrollAmount || 3;
		// FF
		this.listen(this.list.el,'DOMMouseScroll',this.on_mousewheel);
		// other
		this.listen(this.list.el,'mousewheel');
	};


	proto.on_mousewheel = function(evt){
		var dir = evt.deltaY || evt.detail;
		// this.moveOffset(this.limit * (dir > 0 ? 1:-1) );
		if(this.moveOffset(this.scrollAmount * (dir > 0 ? 1:-1) ))
			evt.stop();

		this.updateScroll();
	};

	proto.updateScroll = function(){
		this.setTimeout(function(){		
			// this.setVisible(wh < max);
			// this.setValue(this.scrollWrap.el.scrollTop,wh,max,);
			var len = this.data.length;
			this.setVisible(this.limit < len);
			this.setValue( this.offset, this.limit, len );
		},0);
	};


	function makeAsc(column){
		return function(a,b){
			if (a[column] == b[column]) return 0; 
			return a[column] > b[column] ? 1:-1; 
		}
	}

	function makeDesc(column){
		return function(a,b){
			if (a[column] == b[column]) return 0; 
			return a[column] > b[column] ? -1:1; 
		}
	}
	
	proto.setOrderColumn = function(order){
		if(order){
			this.setSort( order[1] == 'DESC' ?  makeDesc(order[0]) : makeAsc(order[0]));
		}else{
			this.setSort(null);
		}
	};

	proto.newData = function(allData){
	    this.allData = allData || [];
	    this.applySort();
	    this.applyFilter();
	    this.applyLimit();
	};

	proto.moveOffset = function(move){
		return this.setOffset(this.offset + move);
	};

	proto.setOffset = function(offset, limit){
		var old = this.offset;
		this.offset = offset;
		if(limit !== void 0) this.limit = limit;
		this.applyLimit();
		return old != this.offset;
	};

	proto.setLimit = function(limit){
	  this.limit = limit;
	  this.applyLimit();
	};

	proto.setFilter = function(filter){
	  this.filter = filter;
	  this.applyFilter();
	  this.applyLimit();
	};

	proto.setSort = function(sort){
	  this.sort = sort;
	  this.applySort();
	  this.applyFilter();
	  this.applyLimit();
	};

	proto.applySort = function(){
	  if(this.sort) this.allData.sort(this.sort);
	};

	proto.applyFilter = function(){
	    if(this.filter){
	      this.data = this.allData.filter(this.filter);
	    }else{
	      this.data = this.allData;
	    }  
	};

	proto.applyLimit = function(){
	    var data = this.data;
	    if(this.limit){
	      if(this.limit + this.offset > data.length) this.offset = data.length - this.limit;
	      if(this.offset < 0) this.offset = 0;
	      var to = this.offset + this.limit;
	      if(to > this.data.length) to = data.length;
	      this.chunk = this.data.slice(this.offset, to);
	    }else{
	      this.chunk = this.data;
	    }
	    this.updateScroll();
	    if(this.list) this.list.setValue(this.chunk);
	};

});