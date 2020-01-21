(function(){

var mi2 = mi2JS;

mi2._xClickCancel = function(el, end){
	
	// if disabled at any level 
	if(el.hasAttribute(mi2JS.disabledAttribute)) return true;
	
	// if listen is on the root node of component
	if(el === end) return false;

	// do not mess with other components
	comp = el.getAttribute('as');
	return (comp && el != this.el && !(comp == 'Base' || comp =='Base' )); 
};

mi2._xClickEventData = function(el,evt, end){
	var evtNames = [], actions = [], comp, cancelClick = false;
	while(true){
		if(mi2._xClickCancel(el, end)) cancelClick = true;

		if(el.hasAttribute('event')) evtNames.push(el.getAttribute('event'));
		if(el.hasAttribute('action')) actions.push(el.getAttribute('action'));

		if(el == end) break;
		el = el.parentNode;
	}
	
	return {
			action:actions[0],
			actions:actions,
			events:evtNames,
			name: evtNames[0],
			domEvent: evt,
			cancelClick: cancelClick,
			target: el,
			required: true,
			fireTo: 'parent'
		};
};

mi2.xclick = function(comp, attrValue){
	// udpaters not needed
	mi2._xClickListen(comp.el,attrValue,null,comp);
}

mi2._xClickListen = function(n, attrValue, updaters, parentComp){
	if(!parentComp) return;
	parentComp.listen(n,'click',function(evt){
		try{
			var evtData = mi2._xClickEventData(evt.target, evt, n);
			var context;
			if(typeof attrValue == 'function'){
				context = attrValue(evt, evtData.action);
			}else if(typeof attrValue == 'string' && !evtData.name){
				evtData.name = attrValue;
			}

			evtData.context = context;

			// WORKAROUND to be compatible with base/Button
			// changing fireEvent recognitionf of skipping the initiator component
			// would break base/Button behavior, so this trick is used to make it work along
			evtData.__src = parentComp;

			if(evtData.name && !evtData.cancelClick){
				parentComp.fireEvent(evtData);
			} 

		}catch(e){
			mi2.logError('problem activating click',evt, {target:evt.target,parent:parentComp});
			throw e;
		}	
	});
}

mi2.registerDirective('x-click', function(el, comp, value, updaters, parentComp, options){
	if(comp) parentComp = comp.parent; //
		//throw new Error('x-click not supported on component nodes');
	mi2._xClickListen(el, value, updaters, parentComp);
});

})();