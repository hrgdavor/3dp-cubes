/*
Combination of button functionality with variable expansion support.

*/

mi2JS.addCompClass('base/Button', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){

	proto.minClickDelay = 300;

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		this.listen(this.el,'click');		
	};

	proto.on_click = function(evt){
		if(evt.which != 1) return; // only left click

		var eventData = this.eventData(evt.target, evt);
		if(eventData.cancelClick) return;

		if(eventData.events.length && this.parent.fireEvent){
			var now = Date.now();
			if(this._lastClick && now - this._lastClick < this.minClickDelay) return;	
			this._lastClick = now;

			this.fireEvent(eventData);

			evt.stop();
			return false;
		}
	};

	proto.eventData = function(el,evt){
		var evtNames = [], actions = [], comp, cancelClick = false;
		while(true){
			if(this.cancelClick(el)) cancelClick = true;

			if(el.hasAttribute('event')) evtNames.push(el.getAttribute('event'));
			if(el.hasAttribute('action')) actions.push(el.getAttribute('action'));

			if(el == this.el) break;
			el = el.parentNode;
		}

		if(this.__propName) actions.push(this.__propName);
		
		return {
				action:actions[0],
				actions:actions,
				events:evtNames,
				name: evtNames[0],
				domEvent: evt,
				cancelClick: cancelClick,
				target: el,
				fireTo: 'parent'
			};
	};

	proto.cancelClick = function(el){
		
		// if disabled at any level 
		if(el.hasAttribute(mi2JS.disabledAttribute)) return true;
		
		// do not mess with other components
		comp = el.getAttribute('as');
		return (comp && el != this.el && !(comp == 'Base' || comp =='Base' )); 
	};

});
