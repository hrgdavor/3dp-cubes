mi2JS.addCompClass('base/MultiCheck', 'base/InputBase', '',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
	
	var mi2 = mi2JS;

	if(mi2JS.applyNwGroup){
		mi2JS.applyNwGroup(proto, {setValue:1,getValue:1});
	}else 
		mi2JS.mixin(comp,mi2JS.NWGroup);


	proto.itemTpl = {tag:'BUTTON'};

	proto.construct = function(el, parent){
		this.items = {};
		superProto.construct.call(this, el, parent);
	};

	proto.initChildren = function(){
		this.listen(this.el,'click');
		superProto.initChildren.call(this);
		this.mapItems(this.el.children);
		if(this.isReadOnly()) this.setReadOnly(true);
	}

	proto.mapItems = function(it){
		var id, nw;
		for(var i=0; i<it.length; i++){
			nw = this.findRef(it[i]);
			id = nw.dataAttr('id');
			if(id !== null) this.items[id] = nw;
		}
	};

	proto.setReadOnly = function(v){
		superProto.setReadOnly.call(this,v);
		this.callFunc('attr',['readonly',v ? '':null]);
	};

	proto.on_click = function(evt){
		if(this.isReadOnly() || !this.isEnabled()) return;

		var target = this.getItem(evt.target);
		if(target){
			if(this.attrBoolean('single-value')){
				this.selectedIs(target.dataAttr('id'));
			}else{
				target.setSelected(!target.isSelected());
			}
			this.fireIfChanged();
		}
	};

	proto.setConfig = function(data){
		// NodeWrapper is cheap, so we discard the old ones
		this.el.innerHTML = '';
		this.items = {};
		// allow key:value object or array of {id:'',text:''} objects
		var isArray = data instanceof Array;
		for(var p in data){
			var id = isArray ? data[p].id : p;
			var item = mi2.add(this.el, this.itemTpl);
			item.dataAttr('id', id);
			item.setText(   isArray ? (data[p].text || data[p].name)  : data[p]);
			this.items[id] = item;
		}
	};

	proto.setRawValue = function(value){
		this.selectedIs( value );
	};

	proto.getRawValue = function(value){
		var ret = [];
		this.forEach(function(item){
			if(item.isSelected()) ret.push(item.dataAttr('id'));
		});

		if(this.attrBoolean('single-value')) ret = ret[0];

		return ret;
	};

});
