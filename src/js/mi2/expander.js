(function(mi2){
/**
Methods needed to suport templating inside {@link mi2JS(comp) components}. It is important to know that
template strings are parsed from DOM nodes from the <b>text and attribute values only</b>.<br>

@namespace mi2JS(expander)
*/

	mi2.expandPrefix = {};

	mi2.expandPrefix.filter = function(prop, el, part, comp){
		var idx = prop.indexOf('|');

		function makeExtractValue(prop){
			if(prop === '') return function(data){
				return data;
			}
			var keys = prop.split('.');
			var count = keys.length;
			return function(data){
				var val = data;
				for(var i=0; i<count; i++){
					if(val !== void 0 && val !== null) val = val[keys[i]];
				}
				return val;
			}
		}

		// simple value extract
		if(idx == -1) return makeExtractValue(prop);

		// filter extracted value
		var filter = mi2.parseFilter(prop.substring(idx+1));
		prop = prop.substring(0,idx);
		var getter = makeExtractValue(prop);

		return function(data){
			return mi2.filter( getter(data), filter, prop, data); 
		};
	}

	mi2.expandPrefix['const'] = function(prop, el, part, comp){
		var val = mi2.filters['const'](prop);
		return function(){ return val; };
	};

	function genPart(prop, el, part, comp){
		var idx = prop.indexOf(':'), prefix = 'filter';
		if(idx != -1){
			prefix = prop.substring(0,idx);
			prop = prop.substring(idx+1);
		}
		if(!mi2.expandPrefix[prefix]) consol.error('prefix not supported '+prefix+' in expression '+prefix+':'+prop);
		return mi2.expandPrefix[prefix](prop, el, part, comp);
	}

	function genPrinter(arr){
		return function(data){
			// data = data || {};
			if(arr.length == 1){
				// return exact value for single 
				return arr[0] instanceof Function ? arr[0](data) : arr[0];
			}else{
				// sanitize null and undefined for concatenated strings
				var str = '';
				for( var i=0; i<arr.length; i++){
					str += arr[i] instanceof Function ? toEmpty(arr[i](data)) : toEmpty(arr[i]);
				}
				return str;				
			}
		}
	}

/* Fix value for string concatenation.
@returns empty string instead of null or undefined 
*/
	function toEmpty(val){
		return val === null || val === void 0 ? '':val;
	}

	/** regexp that checks if expression is a expander expression. */
	var tplReg = /\$\{([^}]*)\}/g;

/**
@function parseExpanderExp
@memberof mi2JS(expander)

@param str - expander expression that defines the functionality
@param el - element where expanded value will be inserted
@param part - part of element(text node or attribute)
@param comp - component instance


*/
	mi2.parseExpanderExp = function(str, el, part, comp){
		var arr = [];
		var offset = 0;
		str.replace(tplReg, function(match, prop, idx){
			if(offset < idx) arr.push(str.substring(offset,idx));
			arr.push(genPart(prop, el, part, comp));
			offset = idx+match.length
			return match;
		});

		if(offset == 0) return null;
		if(offset < str.length) arr.push(str.substring(offset,str.length));
		return genPrinter(arr, el, part, comp);
	};

/**
@function parseExpander
@memberof mi2JS(expander)
*/
	mi2.parseExpander = function(exp){
		var tpl;
		for(var p in exp){
			if(typeof exp[p] == 'string'){
				tpl = mi2.parseExpanderExp(exp[p]);
				if(tpl) exp[p] = tpl;
			}
		}
		return exp;
	};

/**
@function expandData
@memberof mi2JS(expander)
*/
	mi2.expandData = function(data, exp, copy){
		var ret = copy ? mi2.update({},data) : {};

		for(var p in exp){
			ret[p] = exp[p] instanceof Function ? exp[p](data) : exp[p];
		}
		
		return ret;
	};

/**
@function expandArray
@memberof mi2JS(expander)
*/
	mi2.expandArray = function(arr, exp, copy){
		var ret = [];
		
		for(var i=0; i<arr.length; i++){
			ret.push(mi2.expandData(arr[i], exp, copy));
		}

		return ret;
	};

	function forAttr(el, attr, func){
		el.attr(attr, null);
		return function(data){
			el.attr(attr, func(data));
		}
	}

	function forTextNode(node, func){
		node.nodeValue = '';
		return function(data){
			var str = func(data);
			if(node.nodeValue != str) node.nodeValue = str; // avoid updating DOM if not needed
		}
	}

	function setValue(data){
		var count = this.length;
		for(var i=0; i<count; i++){
			this[i](data);
		}
	}

/**
@function loadExpander
@memberof mi2JS(expander)
*/
	mi2.loadExpander = function(el, comp){
		if(el instanceof mi2) el = el.el;
		var list = [];
		mi2.loadExpanderRec(el,list,comp)
		list.setValue = setValue;
		return list;
	};

/**
@function loadExpanderRec
@memberof mi2JS(expander)
*/
	mi2.loadExpanderRec = function(el, list, comp){
		list = list || [];
		var attribs = el.attributes;
		var count = attribs.length;
		var updater, wrapped;

		// We go in reverse because attributes with expressions are removed right away.
		// This way we do not go out of bounds ot the collection as it shortens
		for(var i=count-1; i>=0; i--){
			if(!attribs[i].value) continue;

			updater = mi2.parseExpanderExp(attribs[i].value, el, attribs[i], comp);
			if(updater){
				if(wrapped == null) wrapped = new mi2(el); // create wrapper only if needed
				list.push(forAttr(wrapped, attribs[i].name, updater));
			}
		}

		var ch = el.firstChild;
		while(ch){
			if(ch.tagName){
				if(!ch.hasAttribute('template'))
					mi2.loadExpanderRec(ch,list, comp);
			}else{
				// TextNode
				updater = mi2.parseExpanderExp(ch.nodeValue, el, ch, comp);
				if(updater) list.push(forTextNode(ch,updater));
			}
			ch = ch.nextSibling;
		}
		return list;		
	}


}(mi2JS));