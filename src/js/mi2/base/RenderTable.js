mi2JS.addCompClass('base/RenderTable', 'Base', '<-TEMPLATE->',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
/*
data sample:  { offset:5, limit:5, rowcount:25, data: [{},{},{},{},{}] }
*/
	var $ = mi2JS;
	var h = $.h;
	var t = $.t;

	proto.isTransitive = function(){ return true; };

	proto.construct = function(el, parent){
		superProto.construct.call(this, el, parent);
	};

	proto.initChildren = function(){
		superProto.initChildren.call(this);

		this.hideHeader = this.attr("hide_header");
		this.showPager = this.attr('show_pager') || 'when_needed';// when_neede / always
		this.opts = {};
		this.sortInline = true;


		// if(this.noData)
			this.noData.innerHTML = t(this.attrDef("no_data","no_data_to_display"));
		
		this.listen(this.tbody.el,"click",this.rowClick);

	};

	function tdFunc(func,def){
		if(!func) return def;
		if(typeof(func) == "string") return function(tr,td){td.innerHTML = func;};
		return func;
	}

	function defRender(tr,td,code, data, table){
		td.innerHTML = data[code] === null || typeof(data[code]) == 'undefined' ? '' : data[code];
	}

	// NOTE: 
	// different order would be more optimizer friendly based on use
	// also order in Array forEach is like the first 3 params
	// function defTitle(value, idx, data, td, tr, table)
	function defTitle(tr,th,code,table){
		th.innerHTML = table.opts.title  ? t(table.opts.title) : t(code);
	}

	proto.defCompareFunc = function(d1,d2, code){
		if(d1[code] == d2[code]) return 0;
		if(d1[code] <  d2[code]) return -1;
		return 1;
	};

	function makeCompareFunc(self,func,code){
		return function(d1,d2){
			return func.call(self,d1,d2,code);
		};
	}

	proto.setup = function(optsIn){
		this.pager1.setup(optsIn.pager || {});
		this.pager2.setup(optsIn.pager || {});
		this.cols = optsIn.columns || {};
		this.showPager1 = optsIn.pager != 'hidden' && optsIn.pager != 'bottom';
		this.showPager2 = optsIn.pager != 'hidden' && optsIn.pager != 'top';
		this.pager1.setVisible(this.showPager1);
		this.pager2.setVisible(this.showPager2);
		var i=0;
		this.thead.el.innerHTML = '';
		var tr = $.addTag(this.thead.el, "TR", null, this);
		var tr2 = $.addTag(this.thead.el,"TR", null, this);
		var span = 0;
		for(var code in this.cols){
			var th = $.addTag(tr,"TH", null, this);
			var opts = this.cols[code];
			th.code = code;
			if(opts.compareFunc) opts.sortable = 1;
			if(!opts.hasOwnProperty('sortable')) opts.sortable = optsIn.sortable;
			th.sortable =  opts.sortable;
			th.className = 'cell_'+code;
			if(opts.sortable){
				th.className = 'cell_'+code+" sortable";
				opts.compareFunc = opts.compareFunc || this.defCompareFunc; 
			} 

			opts.code = code; opts.index = i;

			opts.th = tdFunc(opts.th, defTitle);
			opts.td = opts.td || defRender;
			opts.th(tr,th,code,this);
			if(opts.group){
				var thGroup = $.addTag(tr,{tag:"TH",attr:{'class':"group"}});
				thGroup.innerHTML = opts.group.title;
				span = opts.group.span || 2;
				thGroup.setAttribute("colspan",span);
				$(th).addClass('group_first');
			}
			
			if(span > 0){
				if(span == 1) $(th).addClass('group_last');
				tr2.appendChild(th);
			}

			else th.setAttribute("rowspan",2);

			i++;
			span--;
		}
		if(this.hideHeader) this.thead.setVisible(false);
		this.listen(this.thead.el,"click",this.theadClick);
	};

	proto.theadClick = function(evt){
		var th = evt.target; if(th.tagName != 'TH') th = $.parent(th,'TH');
		// if it was asc(ascending) before the click, we will reverse it
		// this is also when is not sorted as well
		var asc = !$(th).hasClass("asc");
		this.sortBy(th,asc);
	};

	proto._findTh = function(code){
		var tr = this.thead.find('TR');
		while(tr){
			var tmp = tr.firstElementChild;
			while(tmp){
				if(tmp.code == code && tmp.tagName == 'TH') return tmp;
				tmp = tmp.nextElementSibling;
			}
			tr = tr.nextElementSibling;			
		}
		return null;
	};

	proto.sortBy = function(th,asc){
		if(typeof th == "string") {
			var thNode = this._findTh(th);
			if(!thNode) return console.error('column not found '+th);
			else th = thNode;
		}
		this.sortColumn = th;
		if(th.sortable){
			var opts = this.cols[th.code];
			if(opts.compareFunc){
				var tmp = th.parentNode.firstElementChild;
				while(tmp){
					if(tmp.sortable) tmp.className = "sortable";
					tmp = tmp.nextElementSibling;
				}
				th.className = asc ? "sortable asc": "sortable desc";
				this.applySort(th,opts, asc);
			}
		}
	};

	proto.applySort = function(th, opts, asc){
		if(this.tData && this.tData.data){
			this.tData.data.sort(makeCompareFunc(this, opts.compareFunc,th.code));
			if(!asc) this.tData.data.reverse();
		}
		if(this.tData)
			this.__update(this.tData);
	};

	proto.update = function(tData){
		this.tData = tData;

		if(this.sortColumn && this.sortInline){
			var asc = !$(this.sortColumn).hasClass("desc");
			this.sortBy(this.sortColumn,asc);
		}
		this.__update(tData);
		if(this.toBlink) this.blink(this.toBlink.col, this.toBlink.value);
	};

	proto.__update = function(tData){
		var empty = tData.data.length == 0;
		this.noData.setVisible(empty);
		this.dataArea.setVisible(!empty);

		this.pager1.update(tData);
		this.pager2.update(tData);

		if(this.showPager1) this.pager1.setVisible(this.showPager == 'always' ||  this.pager1.pagesCount > 1);
		if(this.showPager2) this.pager2.setVisible(this.showPager == 'always' ||  this.pager2.pagesCount > 1);

		this.tbody.setHtml('');
		for(var i=0; i<tData.data.length; i++){
			var row = tData.data[i];
			var tr = $.addTag(this.tbody.el,{tag:"TR",attr:{'class':"high"}}, null, this);
			tr.data = tData.data[i];
			for(var code in this.cols){
				var td = $.addTag(tr,{tag:"TD",attr:{'class':'cell_'+code}}, null, this);
				td.code = code;
				var opts = this.cols[code];
				var def = '';

				if(opts.render){
					def = opts.render(tr.data[code], code, tr.data, mi2JS.h, mi2JS.t, this);
					if(typeof(def) == 'string') td.innerHTML = def;
				}else{
					def = opts.td(tr,td,code,tr.data,this);
				}

				if(def instanceof mi2JS.TagDef){
					if(def.tag == 'td'){
						mi2JS.vdiffNode(td, def,true);
					}else{
						var chDef = def.children;
						if(def.tagName != 'frag'){
							chDef = [def];
						}
						mi2JS.vdiffChildren(td, chDef);
					} 
				}
			}
//			this.tbody ... save list
		}
	};

	proto.makeBt = function(action, text, param){
		return '<span class="tableBt" action="'+action+'" param="'+param+'">'+t(text || action)+'</span>';
	};

	proto.prepBlink = function(col, value){
		this.blink(col,value, true);
	};

	proto.blink = function(col, value, isBefore){
		
		if(isBefore) this.toBlink = {col:col, value: value};
		else this.toBlink = null;

		var tr = this.tbody.firstElementChild;
		while(tr){
			if(tr.tagName == 'TR' && tr.data[col] == value){
				if(isBefore){
					tr.style.opacity = '0';				
				}else
					$(tr).fadeIn();
				return;
			}
			tr = tr.nextElementSibling;
		}
	};

	proto.rowClick = function(evt, mouseDown){
		var bt = evt.target;
		var td = bt;
		var action = null, param = null;
		while(td.tagName != 'TD' && !action ){
			action = td.getAttribute('action');
			param = td.getAttribute('param');
			td=td.parentNode;
		}
		if(! action ) action = 'edit';
		var tr = td.parentNode;
		this.fireEvent({
			name:'rowClick',
			fireTo:'parent',
			tr: tr, 
			data:tr.data, 
			td:td, 
			code:td.code, 
			action:action, 
			param:param, 
			src:this, 
			domEvent: evt
		});
	};

});


