
mi2JS.addCompClass('base/InputBase', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
/** <b>Extends:</b> {@link mi2JS(comp).Base}<br>

@class base/InputBase
@memberof mi2JS(comp)
*/


	var mi2 = mi2JS; // minimizer friendly

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		
		if(this.hasAttr('in-filter'))
			this.inFilter = mi2.parseFilter(this.attrDef('in-filter'), this.inFilter);
		
		if(this.hasAttr('out-filter'))
			this.outFilter = mi2.parseFilter(this.attrDef('out-filter'), this.outFilter);		
	};

	proto.setReadOnly = function(readOnly){
		this.attr('readonly', readOnly ? '':null);
	};

	proto.isReadOnly = function(readOnly){
		return this.hasAttr('readonly');
	};

	proto.setValue = function(value){
		this.setRawValue( mi2.filter(value, this.inFilter) );
        this.oldValue = this.getValue();
	};

	proto.getValue = function(){
		return mi2.filter( this.getRawValue(), this.outFilter );
	};

	proto.markValidate = function(data){
		mi2.markValidate(this,data);
	};

	proto.checkSubmit = function(evt){
		// TODO parametrize fire event like button
		if(this.checkSubmitKey(evt) && this.parent){
			this.fireEvent( this.eventData(evt) );
		}
	};

	proto.eventData = function(evt){
		return {name:this.attrDef('event','submit'), action: this.attr('action'), domEvent:evt, fireTo:'parent'};
	};

	proto.checkSubmitKey = function(evt){
		return evt.keyCode == 13 && !this.attrBoolean('no-submit');
	};

	proto.checkChanged = function(old, value){
		return value !== old;
	};
	
	proto.fireIfChanged = function(evt){
		if(this.timer) clearTimeout(this.timer);// avoid event bursts
		this.timer = this.setTimeout(this.fireIfChangedNow,50);
	};

	proto.fireIfChangedNow = function(evt){
		var old = this.oldValue;
		var value = this.getValue();
		if(this.checkChanged(old, value)){
			this.oldValue = value;
			this.fireEvent({name:'change', oldValue:old, value: value});
		}
	};

});
