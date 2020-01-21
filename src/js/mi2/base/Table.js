mi2JS.addCompClass('base/Table', 'base/Loop', '',

/**

*/

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
	
	var $ = mi2JS;

	proto.itemTpl = {
		tag:'TR',
		attr: { as: 'Base' },
		html: ''
	};


	proto.initTemplate = function(){

		var el = this.el;
		var THEAD = this.THEAD = findOrAdd(el, 'THEAD');
		var TBODY = this.TBODY = findOrAdd(el, 'TBODY');
		this.itemsArea = TBODY;

		if(this.headerJsx){//ensure to be in dom before tbody
			$.insertHtml(this.THEAD,this.headerJsx(this.state));
			delete this.headerJsx;
		}
		

		var TR = findOrAdd(THEAD, 'TR');

		this.listen(TBODY,'click',this.on_clickTbody);
		this.listen(THEAD,'click',this.on_clickThead);

		// extract header cell if defined together in body
		var it = TBODY.getElementsByTagName('TH');
		var arr = [];
		for(var i=0; i<it.length;i++){
			arr.push(it[i]);
		}

		// move them to THEAD
		for(var i=0; i<arr.length; i++) TR.appendChild(arr[i]);

		superProto.initTemplate.call(this);
	};

	proto.parseChildren = function(){
		superProto.parseChildren.call(this);

		var cells = this.TBODY.getElementsByTagName('TD');
		var cellTpl = [];
		for(var i=0; i<cells.length; i++){
			cellTpl[i] = cells[i].outerHTML;
		}

		var TR    = findOrAdd(this.THEAD, 'TR');
		var columns = {}, column;
		this.columns = [];
		arr = TR.children;
		// create Group for columns, by collecting each TH with "column" attribute
		for(var i=0; i<arr.length; i++){
			var colName = arr[i].getAttribute('column') || 'column'+i;
			var column = this.findRef(arr[i]);
			column.__index = i;
			column.cellTpl = cellTpl[i] || '';
			columns[colName] = column;
			this.columns.push(column);
		}
		this.$columns = new $.NWGroup(columns);
	};

	proto.on_clickThead = function(evt){
	};

	proto.on_clickTbody = function(evt){
		var evtName, action, TR, TD, comp;
		var el = evt.target;
		while(el.tagName != 'TBODY'){
			comp = el.getAttribute('as');
			if(comp && !(comp == 'Base' || comp =='Base' )) return; // do not mess with other components

			evtName = evtName || el.getAttribute('event');
			action  = action  || el.getAttribute('action');

			if(el.tagName == 'TD') TD = el;
			if(el.tagName == 'TR') { TR = el; break;};
			el = el.parentNode;
		}

		if(TR){
			this.fireEvent({
				name:evtName || 'rowClick',
				fireTo:'parent',
				action:action,
				domEvent: evt, 
				tr:TR,
				td:TD
			});
		}
		evt.stop();
		return false;
	};

	proto.columnIndex = function(colName){
		var column = this.$columns.getItem(colName);
		return column ? column.__index : -1;
	};

	proto.columnIndexMap = function(cols){
		var ret = {};
		for (var i = cols.length - 1; i >= 0; i--) {
			ret[ this.columnIndex(cols[i])] = true;
		};
		return ret;
	};

	proto.extractText = function(row, useMap, skipMap){
		var ret = [];
		skipMap = skipMap || {};
		if(row instanceof $) row = row.el;
		var i=0, el=row.firstElementChild;

		while(el){
			if((!useMap || useMap[i]) && !skipMap[i]){
				ret.push( el.textContent );
			}
			i++;
			el = el.nextElementSibling;
		}
		return ret;
	}

	proto.getCol = function(row, index){
		if(typeof index == 'string') index = this.columnIndex(index);

		if(row instanceof $) row = row.el;
		var i=0, el=row.firstElementChild;

		while(el){
			if(i == index) return el;
			i++;
			el = el.nextElementSibling;
		}
	}

	proto.hideColumns = function(){
		this.$columns.forSome(arguments, function(item, code){
			item.setVisible(false); 
		});
		this.rebuild();
	};

	proto.rebuild = function(){
		var html = '', columns = this.columns;
		var j=0;
		for(var i=0; i<columns.length; i++){
			if(columns[i].isVisible()){
				html += columns[i].cellTpl;
				columns[i].__index = j;
				j++;
			}else{
				columns[i].__index = -1;
			}
		}
		this.itemTpl.html = html;
	};

	proto.markSort = function(def){
		this.$columns.forEach(function(item, code){
			// without this condition, columns that were not sortable 
			// would become sortable by setting the sort attribute
			if(item.hasAttr('sort')) 
				item.attr('sort', def[code] || '');
		}); 
	};

	proto.getSort = function(def){
		var ret = {};
		this.$columns.forEach(function(item, code){
			if(item.attr('sort')) ret[code] = item.attr('sort');
		}); 
		return ret;
	};


	function findOrAdd(el,tag,before){
		var ch = $.find(tag, el);
		return ch ? ch : $.addTag(el, tag, before);
	}

	proto.initAttr = function(attr, updaters){ 
		if(attr.header){
			this.headerJsx = attr.header;
			delete attr.header;
		}
		superProto.initAttr.apply(this, arguments);
	};

	proto.findItemsArea = function(el){
		console.log('this.findItemsArea',this.findItemsArea);
		return this.TBODY;
	};

	proto.findItemTpl = function(el){ return this.TBODY.firstElementChild || this.itemTpl; };   

});
