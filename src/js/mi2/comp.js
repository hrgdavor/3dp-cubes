(function(mi2){
/**
@namespace mi2JS(comp)
*/

	// if the script is loaded again, it will reuse existing mi2.compData
	var compData = mi2.compData = mi2.compData || {def:{}, tpl:{}, later:{}, tags:{}, counterSeq:0};
	compData.tags.INPUT = compData.tags.SELECT = compData.tags.TEXTAREA = 'base/Input';
	var mi2Proto = mi2.prototype;

/** 
@namespace mi2JS(comp)

@function makeComp
@memberof mi2JS(comp)
*/
mi2.addComp = function(parent, tag, parNode){
	var node = mi2.addTag(parNode || parent, tag, null, parent);
	return mi2.makeComp(node, null, parent, parNode);
}

/**
 Construct and initialize component, as most code would ecpect the componet
to be live after created 

@function makeComp
@memberof mi2JS(comp)

*/
	mi2.makeComp = function(el, compName, parent, parNode){
		var c = mi2.constructComp(el, compName, parent);
		if(!c.lazyInit) c.__init();
		return c;
	};

/**
Just construct the component without initialization. This is mostly used during 
automatic component template parsing (parseChildren) and initialization is done
 in the second run on all previously created components 

@function constructComp
@memberof mi2JS(comp)
 */
	mi2.constructComp = function(el, compName, parent, updaters){
		try{

			// sanitize, to allow === null check to work later
			if(!parent) parent = null;

			if( !compName ){
				compName = el.getAttribute('as');
				if(!compName) compName = compData.tags[el.tagName];
			}

			el.setAttribute('as', compName);
			el.compRefId = mi2.compData.counterSeq++;

			var compDef = this.getComp(compName, el);
			var c = new compDef();
			c.__template = this.getCompCompTpl(compName);
			c.construct(el, parent);
			c.setParent(parent);
			updaters = updaters || (parent ? parent._updaters : []);

			if(el.jsxAttr){
				if(parent) parent.initChildAttr(c, el.jsxAttr, el.jsxDir, updaters);
				c.initAttr(el.jsxAttr, updaters );
				delete el.jsxAttr;
			}

			if(el.jsxChildren){
				el.jsxChildren = c.initChildrenJsx(el.jsxChildren);
				mi2.insertHtml(el, el.jsxChildren, null, updaters);
				delete el.jsxChildren;
			}

			return c;

		}catch(e){
			// log the component and the node where the error happened
			// this will occur for each parent too as the error is rethrown
			// and error will show up in console for inspection of execution stack
			console.log('error while creating a component ',compName, el, '\ninside the component ', parent,'\n', e);
			throw e;
		}
	};
/**
@function getCompCompTpl
@memberof mi2JS(comp)
*/
	mi2.getCompCompTpl = function(name){ 
		var tpl = compData.tpl[name];
		if(!tpl && tpl !== '') throw new Error('Component template not found: '+name);
		return tpl;
	};

/**
@function checkComp
@memberof mi2JS(comp)
*/
	mi2.checkComp = function(name){ return compData.def[name] || compData.later[name]; }
	
/**
@function getComp
@memberof mi2JS(comp)
*/
	mi2.getComp = function(name, el){ 
		var compDef = compData.def[name];
		if(!compDef && compData.later[name]){
			// initialize the parent component by calling the function in compData.later
			compDef = compData.later[name]();
		}
		if(!compDef) {
			var msg = 'Component not found: '+name;
			console.log(msg,el);
			throw new Error(msg);
		}
		return compDef; 
	};

/**
@function addCompClass
@memberof mi2JS(comp)
*/
	mi2.addCompClass = function(name, supName, tpl, initializer){
		if(compData.def[name] || compData.later[name]) console.error('Component with same name already defined '+name);
		compData.tags[name.replace('/','-').toUpperCase()] = name;
		compData.tags[name] = name; // cover cases where tag is upercase(HTL), or exact case (XHTML)

		// if(compData.def[supName]){
			// this.initComp(name, supName, tpl, initializer);
		// }else{
			// collect first, initialize whn needed
			// so if any mixing is extended changes may apply to the component
			compData.later[name]  = function(){ return mi2.initComp(name, supName, tpl, initializer); };
		// }

	};

/**
@function initComp
@memberof mi2JS(comp)
*/
	mi2.initComp = function(name, supName, tpl, initializer){
		var comp = compData.def[name];

		var superClass = this.getComp(supName);
		if(!comp){
			comp = eval('(function '+name.replace('/','_')+'(){})');
			comp.superClass = superClass;
			mi2.extend( comp, superClass );
		}
		// else: 
		// hapens when reloading component in runtime
		// changes to the component prototype can be applied to the already instantiated components
		initializer(comp.prototype, superClass.prototype, comp, mi2, mi2.h, mi2.t, mi2.filters);
		comp.compName = name;

		if(tpl && tpl == 'extend:') 
			tpl = this.getCompCompTpl(supName);
		else if(tpl && tpl.length > 7 && tpl.substring(0,7) == 'extend:') 
			tpl = this.getCompCompTpl(tpl.substring(7));

		if(tpl || tpl === '') 
			compData.tpl[name] = tpl;

		return (compData.def[name] = comp);
	};


	mi2.popupControl = function(comp, ctrl,opt){
	  opt = opt || {};

	  var el = ctrl.el;
	  if(el.parentNode != document.body) document.body.appendChild(el);

	  ctrl.setVisible(true); // must be vesible to have values for offsetHeight and etc.
	  var parent = el.parentNode;
	  var r = comp.el.getBoundingClientRect();

	  var top = r.bottom;
	  var left = r.left;
	  if(opt.alignTop == 'top') top = r.top; 
	  if(opt.alignLeft == 'right') left = r.right; 
	  
	  top  += opt.offsetTop  || 0;
	  left += opt.offsetLeft || 0;

	  if(top < 0) top = 0;
	  if(left < 0) left = 0;

	  if(parent.clientHeight < (top + el.offsetHeight) ) top = parent.clientHeight - el.offsetHeight;
	  if(parent.clientWidth < (left + el.offsetWidth) ) left = parent.clientWidth - el.offsetWidth;

	  el.style.top  = top  +'px';
	  el.style.left = left +'px';
	}

}(mi2JS));
