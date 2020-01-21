
mi2JS.addCompClass('base/Dialog', 'Base', '<div class="dialog-inner"> <div class="dialog-title" p="title"></div> <div class="dialog-content" p="content"></div> <div class="dialog-buttons" p="buttons" as="base/Loop"><button template as="base/Button" event="close"></button></div> </div>',

// component initializer function that defines constructor and adds methods to the prototype
function(proto, superProto, comp, mi2, h, t, filters){

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		
		this.listen(document.body,'keyup', function(evt){
			if(evt.keyCode == 27){
				if(this.isVisible() && this.hasCancel) this.on_close({action:'cancel'});
			}
		});
	};

	proto.show = function(params){
		this.expandVars({});
		this.params = params;
		var title = params.title || '';
		var content = params.content || '';
		var buttonClass = params.buttonClass;
		var contentClass = params.contentClass || '';
		var buttons = params.buttons || [{action:'ok'},{action:'cancel'}];
		// button: {action: 'ok', text: t('ok'), 'class':''}

		this.title.setContent(title);
		this.content.el.className = 'dialog-content '+contentClass;
		
		this.content.setContent(content);

		this.buttons.setValue([]);
		this.hasCancel = false;
		for(var i=0; i< buttons.length; i++){
			var button = buttons[i];
			if(typeof button == 'string') button = {action:button};
			var text = button.text || mi2.t(button.action);
			this.buttons.push(text);
			if(button.action == 'cancel') this.hasCancel = true;

			var item = this.buttons.getItem(i);
			item.setContent(text);
			item.attr('action', button.action);
			item.attr('class',  button['class'] || buttonClass);
		}
		this.setVisible(true);

		if(buttons.length > 0){
			this.setTimeout(function(){
				var button = this.buttons.getItem(0);
				button.el.focus();
			},10);

		} 
	};

	proto.on_close = function(evt){
		var resp = evt.action;
		var params = this.params;
		if(params.callback){
			if(params.callback(evt.action) !== false){
				this.setVisible(false);
			}
		}else if(params['callback_'+resp]){
			if(params['callback_'+resp](evt.action) !== false){
				this.setVisible(false);
			}
		}else{
			this.setVisible(false);			
		}
	};

});