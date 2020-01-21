(function(mi2){
/** 
@namespace mi2JS(html)
*/

/** 
<p>Tempalte object for passing info about a HTML node taht should be created</p>
<p>Used by {@link mi2JS(html).addTag}, {@link mi2JS(html).add}</p>
  @typedef TagTemplate
  @type {object}
  @property {string} tag - tag name (uppercase)
  @property {string} html - html code to put into innerHTML of the newly created node
  @property {Object} attribs - name/value pairs for desired attributes and the values
 */

	var mi2Proto = mi2.prototype; // allow minimizer to shorten prototype assignments

	/** 
	Create a html node. <br>


	@function addTag
	@memberof mi2JS(html)
	@param {Element} parent - parent for the new node. Use null if you intend to add the node to a parent later using appendChild(..) .
	@param {string|TagTemplate} tpl - tag name, or tag template object must be uppercase
	@param {Object} tpl - tag name, must be uppercase

	@returns {Element} new node

	@example 
	mi2.addTag(document.body, 
		{	tag:'DIV', 
			html: '<b>Title:</b>Sunshine', 
			attr:{'class':'freaky-line'}
		}
	);
	// returns creaed Element
	*/
	mi2.addTag = function(parent, tpl, nextSibling){

		if(typeof tpl == 'string') tpl = {tag:tpl};
		if(!(tpl instanceof mi2.TagDef)) tpl = new mi2.TagDef(tpl.tag, tpl.attr, tpl.children || [], tpl.html);
		return mi2.insertHtml(parent, tpl, nextSibling);
	};

	/** 
	Create a html node, and returns a {@link mi2JS(core).NodeWrapper}. Uses {@link mi2JS(html).addTag} with same parameters <br>
	but returns the created node wrapped with {@link mi2JS(core).NodeWrapper}.

	@function add
	@memberof mi2JS(html)
	@see {@link mi2JS(html).addTag}
	*/
	mi2.add = function(parent, tpl, nextSibling){
		return new mi2(mi2.addTag(parent, tpl, nextSibling));
	}

	/** Check if two rectangles are intersecting each other.

	@function intersect
	@memberof mi2JS(html)
	*/	
	mi2.intersect = function(a, b) {
		return (a.left <= b.right &&
			b.left <= a.right &&
			a.top <= b.bottom &&
			b.top <= a.bottom);
	}

	/** Generate {@link TagTemplate} object that represents the given Element.

	@function toTemplate
	@memberof mi2JS(html)
	@param {Element} node 
	@param {Object} defAttr oprional default attribute values
	*/
	mi2.toTemplate = function(node, defAttr){
		var tpl = { tag: node.tagName, html: node.innerHTML};
		var attr = defAttr ? mi2.copy(defAttr) : {};
		var it = node.attributes;
   		if(it) for(var i=0; i<it.length; i++){
   			if(it[i].name == 'template') continue;
   			attr[it[i].name] = it[i].value;
   		}
		tpl.attr = attr;
		return tpl;
	}

	mi2.dom_register = function(name, returnValue, func){

		var staticName = 'h_'+name;
		
		mi2[staticName] = func;

		mi2Proto[name] = function(){
			var newArgs = Array.prototype.slice.call(arguments,0);
			newArgs.unshift(this.el);
			return func.apply(this, newArgs);
		};
	}

	/** Check if node har a specified attribute defined (regardless of value, null or other)

	@instance
	@method hasAttr
	@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('hasAttr', true, function(node, name, val){
		return node.hasAttribute(name);
	});

	/** get/set attribute on the wrapped node. Setting attribute to null or undefined
	will remove the attribute.

	@instance
	@method attr
	@memberof mi2JS(core).NodeWrapper

	@param {String} name attribute name
	@param {String} value optionaly if sent sets the attribute
	*/
	mi2.dom_register('attr', true, function(node, name, val){
		if(arguments.length > 2){
			if(val === null || val === void 0){
				if(node.hasAttribute(name)) node.removeAttribute(name);
			}else{
				if(val !== node.getAttribute(name)) 
					node.setAttribute(name,val);
			}
		}else{
			return node.getAttribute(name);
		}
	});

	/** Get attribute, but return default value if not defined

	@instance
	@method attrDef
	@memberof mi2JS(core).NodeWrapper
	@param {string} name attribute name
	@param {object} def default value if attribute is not present
	*/
	mi2.dom_register('attrDef', true, function(node, name, def){
		return node.hasAttribute(name) ? node.getAttribute(name) : def;
	});

	/** Get attribute, but convert frist using {@link mi2JS(core).num}. Returns 0 when value not a number or
	if attribute is not present.

	@instance
	@method attrNum
@memberof mi2JS(core).NodeWrapper
	@param {string} name attribute name
	@param {object} def default value if attribute is not present
	*/
	mi2.dom_register('attrNum', true, function(name, def){
		return mi2.num( mi2.h_attrDef(name, def) );
	});


	/** Boolean from attribute

		@instance
		@method attrBoolean
@memberof mi2JS(core).NodeWrapper
		@param {string} name attribute name
		@param {object} def default value if attribute is not present

@example 
Value is true for all these instances
just defined - <input required> <input required="">
value same as name <input required="required">
value 1,true - <input required="1"> <input required="true">

	*/
	mi2.dom_register('attrBoolean', true, function(node, name, def){

		if(node.hasAttribute(name)){
			var val = node.getAttribute(name);
			if(val === null || val == '' || val == 'true' || val == name || val == '1') return true;
		}else{
			return def;
		}

		return false;
	});

/* 

@function data
@instance
@memberof mi2JS(core).NodeWrapper

no real need to use dataset, and attributes work on more browsers 
*/
	mi2.dom_register('dataAttr', true, function(node, name, val){
		name = 'data-'+name;
		if(arguments.length >2){
			mi2.h_attr(node,name,val);
		}else{
			return mi2.h_attr(node,name);
		}
	});

	/** Add class to the element if condition is true, and remove if false. 

@function classIf
@instance
@memberof mi2JS(core).NodeWrapper
		@param toAdd - className to add/remove 
		@param condition - (true/false) determines if add/remove is executed. Usualy a result of an expression in the caller code. 
	*/
	mi2.dom_register('classIf', false, function(node, toAdd, condition){
		if(condition)
			node.classList.add(toAdd);
		else
			node.classList.remove(toAdd);
	});

	/*** Same as classIf but reversed condition. 
@function classUnless
@instance
@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('classUnless', false, function(node, toAdd, condition){
		if(condition)
			node.classList.remove(toAdd);
		else
			node.classList.add(toAdd);
	});

	/** Add a css class to the element. Common function to initiate change defined in css. 
@function addClass
@instance
@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('addClass', false, function(node, toAdd){
		node.classList.add(toAdd);
	});

	/** Check if one of space separated values is in the element's className 
@function hasClass
@instance
@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('hasClass', true, function(node, name){
		return node.classList.contains(name);
	});

/** Check if node has a class and toggle it
@function hasClass
@instance
@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('toggleClass', true, function(node, name){
		return node.classList.toggle(name);
	});


	/** Remove a css class from the element (leaving others intact) 
@function removeClass
@instance
@memberof mi2JS(core).NodeWrapper
	*/
	mi2.dom_register('removeClass', true, function(node, toRemove){
		if(node.classList.length)
			return node.classList.remove(toRemove);
	});

/*
@function setHtml
@instance
@memberof mi2JS(core).NodeWrapper
*/
	mi2.dom_register('setHtml', false, function(node, html){
		if(typeof html == 'string'){
			if(node.innerHTML !== html) node.innerHTML = html;
		}else if(html instanceof mi2.TagDef){ 
			// TODO diff
			node.innerHTML = '';
			mi2.insertHtml(node, html);
		}
	});

/*
@function setHtml
@instance
@memberof mi2JS(core).NodeWrapper
*/
	mi2.dom_register('setContent', false, function(node, content){
		if(content instanceof mi2) content = content.el;
		if(typeof(content) == 'string'){
			mi2.h_setText(node,content);
		}else if((content instanceof mi2.TagDef) || (content instanceof Array)){
			node.innerHTML = '';
			mi2.insertHtml(node, content);
		}else{
			node.innerHTML = '';
			node.appendChild(content);
		}
	});


/*
@function setText
@instance
@memberof mi2JS(core).NodeWrapper
*/
	mi2.dom_register('setText', false, function(node, text){
		if(node.textContent !== text) node.textContent = text;
	});

/*
@function getText
@instance
@memberof mi2JS(core).NodeWrapper
*/
	mi2.dom_register('getText', true, function(node){
		return node.textContent;
	});

})(mi2JS);
