mi2JS.addCompClass('base/Loop', 'base/Group', '',

/**  <b>Extends:</b> {@link mi2JS(comp).base/Group}<br>

if component extends Loop and has an element bound to itemsArea it will be used instead
of the component root.

example with inline template: 
	mi2JS.addCompClass('base/List', 'lock3/Loop', '<div class="title">title</div><div p="itemsArea"></div>',

example in separate template file:
	<div class="title">title</div>
	<div p="itemsArea"></div>

@class base/Loop
@memberof mi2JS(comp)
*/
// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
	
	var mi2 = mi2JS;

	proto.initTemplate = function(){
		var el = this.el;
		
		if(this.__template) el.innerHTML = this.__template;
		delete this.__template;
		
		this.loadItemTpl(el);

		// this was done before calling parent constructor to avoid stack overflow in case
		// of component recursion using Loop component (example: tree-like structures)

		superProto.initTemplate.call(this);

		if(this.hasAttr('in-filter'))
			this.inFilter = mi2.parseFilter(this.attrDef('in-filter'), this.inFilter);
		
		if(this.hasAttr('out-filter'))
			this.outFilter = mi2.parseFilter(this.attrDef('out-filter'), this.outFilter);		

		if(this.itemTpl.attr) {
			var comp = this.attrDef('item',this.itemTpl.attr.as);
			if(comp){
				var idx = comp ? comp.indexOf(':'):-1;
				if(idx != -1){
					this.itemTpl.tag = comp.substring(0,idx).toUpperCase();
					comp = comp.substring(idx+1);
				}
				this.itemTpl.attr.as = comp;
			}
		}

		this.allItems = [];
		this.items = [];
        // TODO remove after NwGroup refactor
		// if(mi2.applyNwGroup) mi2.applyNwGroup(this);
		this.count = 0;

		this.itemMixin = function(tm,tmProto,tmSuper){};
	};

	proto.initAttr = function(attr, updaters){ 
		if(attr.tpl){
			this.itemTpl = attr.tpl;
			delete attr.tpl;
		}
		superProto.initAttr.apply(this, arguments);
	};

/**
@function findItemTpl
@instance
@memberof mi2JS(comp).base/Loop
*/

	proto.findItemTpl = function(el){
		var ch = el.firstElementChild;
		while(ch){
			if(ch.hasAttribute('template')) return ch;
			if(!ch.hasAttribute('as')){
				var ret = this.findItemTpl(ch);
				if(ret) return ret;
			}
			ch=ch.nextElementSibling;
		}
	};

	proto.loadItemTpl = function(el){
		var ch = this.findItemTpl(el) || el.firstElementChild;
		if(ch && ch.tagName){
			this.itemsArea = ch.parentNode;
			this.itemTpl = mi2.toTemplate(ch, this.itemTpl ? this.itemTpl.attr:null);
			this.itemNextSibling = ch.nextElementSibling;
			ch.parentNode.removeChild(ch);
		}else{
			this.itemsArea = this.itemsArea || el;
			if(!this.itemTpl) this.itemTpl = { tag:'DIV', attr: { }};
		}
	};

	proto.findItem = function(el){
		while(el){
			if(el.parentNode == this.itemsArea){
				for(var i=0; i<this.items.length; i++){
					if(this.items[i].el == el) return this.items[i];
				}
				break;
			} 
			el = el.parentNode;
		}
	};

	proto.getItemIndex = function(item){
		if(!item) return -1;
		if(item instanceof mi2) item = item.el;
		return item.loopIndex;
	};

	proto.findItemsArea = function(el){
		var ch = el.firstChild;
		while(ch){
			if(ch.getAttribute){
				if (ch.getAttribute('p') == 'itemsArea') return ch;
				if (!ch.hasAttribute('as')){
					var found = this.findItemsArea(ch);
					if(found) return found;
				} 
			} 
			ch = ch.nextSibling;
		}	
	};

	proto.setValue = function(arr){
		this.setRawValue( mi2.filter( arr, this.inFilter));
	}

	proto.setRawValue = function(arr){
		arr = arr || [];
		for(var i=0; i<arr.length; i++){
			this.setItem(arr[i],i);
		}
		this.count = arr.length;
		if(this.noData) this.noData.setVisible(!this.count);

		this._fixItemList(true);

		this.fireEvent('afterSetValue');
	};

	proto.setConfig = function(arr){
		arr = arr || [];
		for(var i=0; i<arr.length; i++){
			this.setItem(void 0,i);
			this.allItems[i].setConfig(arr[i]);
		}
		this.count = arr.length;
		if(this.noData) this.noData.setVisible(!this.count);

		this._fixItemList(true);

		this.fireEvent('afterSetConfig');
	};

	/** returns only active items (do not access .times property directly as it contains also disabled ones) */
	proto.getItems = function(){
		return this.items;
	};

	proto.getItem = function(index){
		return this.items[index];
	};

	function defGetValue(){ }

	proto.makeItem = function(newData,i){
		var node, compName;
		var jsxInline = typeof this.itemTpl == 'function';
		var state = {};
		var updaters = [];
		if(jsxInline){
			// state object needs to be present during call to template definition from jsx
			// it will be later put into component, as otherwise state changes would not be seen
			// by the generated template
			var def = this.itemTpl(state);
			def.attr = def.attr || {};
			compName = def.attr.as = def.attr.as || 'Base';
			// updaters will be generated during this step, and will be later injected into the new component
			node = mi2.insertHtml(this.itemsArea, def, this.itemNextSibling, updaters);
			node.setAttribute('as',compName);
		}else{
			compName = this.itemTpl.attr ? this.itemTpl.attr.as:null;
			node = mi2.addTag(this.itemsArea, this.itemTpl, this.itemNextSibling);
		}

		if(compName){
			var comp = mi2.constructComp(node, compName, this, updaters);

			var compClass = mi2.getComp(comp.getCompName());
			var superClass = compClass.superClass;

			if(jsxInline){
				comp.state = state;
				comp._updaters = updaters;
				comp.initUpdaters();
			}
			if(!comp.lazyInit) comp.__init();

			this.itemMixin(comp, compClass.prototype, superClass.prototype, compClass, superClass);			
		}else{
			comp = new mi2(node);
		}

		if(!comp.getValue) comp.getValue = defGetValue;

		this.itemCreated(comp, i);

		return comp;
	};

	/** 
	Use this method to add extra initialization for created components (extra methods or init params).

	Component that extends Loop can override this method, and if used inside 
	another component it can listen to itemCreated event by adding method on_itemCreated.
	This distinction also avoids Loop inside a Loopp accidentaly coliding for this event. 
	*/
	proto.itemCreated = function(item, i){
		this.fireEvent({name:'itemCreated',item:item, index:i, fireTo:'parent'});
	};

	proto.setItemValue = function(item, newData){
		if(item.setValue){
			item.setValue(newData);
		}else{
			mi2.logError('setValue not found', new Error(),{item:item, data:newData});
		} 
	};

	proto.getItemValue = function(item){
		return item.getValue();
	};

	proto.setItem = function(newData,i){
		var item = this.allItems[i];

		if(!item) item = this.allItems[i] = this.makeItem(newData, i);

		item.el.loopIndex = i;
		if(newData != void 0){
			this.setItemValue(item, newData);
			this.fireEvent({name:'afterSetItemValue', index:i, data:newData, item:item});
			item.setVisible(true);
		}
	};

	proto.getRawValue = function(){
		return this.forEachGet(this.getItemValue.bind(this))
	}

	proto.getValue = function(){
		return mi2.filter( this.getRawValue(), this.outFilter);
	};

	proto.push = function(data){
		var index = this.count;
		this.setItem(data,index);
		this.count++;
		this._fixItemList();
		this.fireEvent({name:'afterAdd', index:index, data:data, item:this.getItem(index)});
		return this.getItem(index);
	};

	proto.pop = function(data){
		if(this.count == 0) return;
		this.count--;
		var item = this.items.pop();
		item.setVisible(false);

		this._fixItemList();

		this.fireEvent({name:'afterPop', item:item});
		return item;
	};

	proto._fixItemList = function(reindex){
        this.items = this.allItems.slice(0,this.count);
        // TODO remove after NwGroup refactor
        //if(mi2.applyNwGroup) mi2.applyNwGroup(this.items);
		if(reindex){
	    	var it = this.allItems;
	    	for(var i=0; i<it.length; i++){
	    		it[i].el.loopIndex = i;
	    		it[i].setVisible(i<this.count);
	    	}    	
		}		
	};

	proto.moveItem = function(fromIndex, insertBefore){
    	var item = this.allItems.splice(fromIndex,1)[0];
    	if(fromIndex < insertBefore) insertBefore--;
    	var elBefore = insertBefore < 0 ? null : elBefore = this.allItems[insertBefore].el;
    	if(insertBefore < 0){
    		this.allItems.push(item);
    	}else{
    		this.allItems.splice(insertBefore,0,item);
    	}
    	this.itemsArea.insertBefore(item.el, elBefore);
    	this._fixItemList(true);
	};

	proto.removeItem = function(item){
		var index = this.getItemIndex(item);
		this.splice(index,1);
	};

	proto.size = function(){
		return this.count;
	};

	proto.splice = function(index, deleteCount){
		var toAdd = Array.prototype.splice.call(arguments,2);

		// items not used and hidden for reuse later
		var countReusable = this.allItems.length - this.count;

		for(var d=0; d<toAdd.length; d++){
			if(deleteCount <= 0){
				// need to inject new item (reuse one from the end of allItems array, or create new)
				var newItem = countReusable > 0 ? this.allItems.pop():this.makeItem(toAdd[d], index);
				this.allItems.splice(index,0, newItem);
				var next = this.allItems[index+1];
				this.itemsArea.insertBefore(this.allItems[index].el, next ? next.el:null);
				countReusable--;
			}
			this.setItem(toAdd[d], index );
			index++;
			deleteCount--;
		}

		if(deleteCount >0){
			var removed = this.allItems.splice(index,deleteCount);
			for(var i =0; i<removed.length; i++){
				var tmp = removed[i];
				this.itemsArea.insertBefore(tmp.el,this.itemNextSibling||null);
				this.allItems.push(tmp);
				tmp.setVisible(false);
			}
		}
		this.count = Math.max(this.count - deleteCount,0);
		this._fixItemList(true);
	}

});
