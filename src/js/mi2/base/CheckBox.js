mi2JS.addCompClass('base/CheckBox', 'base/InputBase', '',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
	
	var mi2 = mi2JS;

	mi2.mixin(comp,mi2.NWGroup);

	proto.itemTpl = {tag:'B'};

	proto.construct = function(el, parent){
		this.items = {};
		superProto.construct.call(this, el, parent);

	};

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		this.useValue = this.attrDef('value',true);
		this.unchecked = this.attrDef('unchecked',false);

		this.listen(this.el,'click');
	};

	proto.on_click = function(evt){
		if(this.isReadOnly() || !this.isEnabled()) return;
		this.setSelected(!this.isSelected());
		this.fireIfChanged();
	};

	proto.setRawValue = function(value){
		this.setSelected( value == this.useValue );
	};

	proto.getRawValue = function(value){
		return this.isSelected() ? this.useValue:this.unchecked;
	};

});
