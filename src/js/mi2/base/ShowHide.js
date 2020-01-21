
mi2JS.addCompClass('base/ShowHide', 'Base', '<-TEMPLATE->',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){

	var $ = mi2JS;

	proto.initTemplate = function(){
		var el = this.el;
		this.titleHTML = el.innerHTML;
		el.innerHTML = '';

		superProto.initTemplate.call(this);

		this.texts = this.attrDef('texts','&#x25B2;,&#x25BC;').split(',');
	};

	proto.initChildren = function(){
		superProto.initChildren.call(this);

		this.title.setHtml(this.titleHTML);

		this.listen(this.el, 'click');

		var code = this.attrDef('target','+');
		this.panel = this.parent.findRef(code, this);
		if(!this.panel) throw new Error('Panel not found '+code);
		this.panel.addClass('ShowHidePanel');
		this.updateButton();
	};

	proto.updateButton = function(){
		try{
			var idx = this.panel.isVisible() ? 1:0;
			this.button.setHtml(this.texts[idx]);
			this.classIf('collapsed', !idx);
		}catch(e){
			console.error('updateButton error '+e.message);
		}
	};

	proto.setValue = function(val){
		this.panel.setVisible(val);
	}

	proto.getValue = function(val){
		return this.panel.isVisible();
	}

	proto.on_click = function(sel){
		this.setValue(!this.getValue());
		this.updateButton();
		this.fireEvent({name:'change', value:this.panel.isVisible()});
	};
});
