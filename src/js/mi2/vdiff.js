(function(){
	var mi2 = mi2JS;

	mi2.vdiffNode = function(node, def, update){
		mi2.vdifAttr(node, def.attr, update);
		mi2.vdiffChildren(node, def.children);
	}

	mi2.vdiffChildren = function(node, children){
		mi2.vdiffChildrenAt(node, children, node.firstChild);
	}

	mi2.vdiffChildrenAt = function(node, children, next){

		children = children || [];
		var def, remove, newNode, tag, tmp;
		

		var count = children.length;
		for(var i=0; i<count; i++){
		
			def = children[i];
		
			if(def instanceof mi2.TagDef){
				if(def.tag == 'template1' || def.tag == 'frag'){
					mi2.vdiffChildrenAt(node, def.children, next);
				}else{				
					tag = def.tag.toUpperCase();

					if(next && next.tagName == tag){
						// console.log('update tag', tag);
						newNode = next;
						next = next.nextSibling;
					}else{
						// console.log('add tag', tag);
						newNode = document.createElement(tag);
						node.insertBefore(newNode, next);
					}
					mi2.vdiffNode(newNode, def);
				}
			}else {
				// for now, all other are textual

				// TODO join text node updating and value handling
				if(def === null || def === void 0) def = '';				
				if(typeof(def) != 'string') def = ''+def;

				if(next && next.nodeType == 3){
					if(next.textContent != def){
						// console.log('change text', next.textContent, def);
						next.textContent = def;
					}
					next = next.nextSibling;
				}else{
					// console.log('insert text',node, def, next);
					node.insertBefore(document.createTextNode(def), next);
				}

			}
		}
		while(next){
			tmp = next;
			next = next.nextSibling;
			node.removeChild(tmp);
		}
	}

	mi2.vdifAttr = function(node, newAttr, update){
		var list = node.attributes;
		var count = list.length;
		var toRemove = [];
		var attr, name, newValue;
		for(var i=0; i<count; i++){
			attr = list[i];
			name = attr.name;
			newValue = newAttr ? newAttr[name] : void 0;
			if(newValue == void 0 || newValue === null || newValue === false){
				toRemove.push(name);
			}
		}

		count = update ? 0 : toRemove.length;// do not remove attributes if in update mode
		for(var i=0; i<count; i++){
			node.removeAttribute(toRemove[i]);
		}
		if(newAttr){
			for(var p in newAttr){
				newValue = newAttr[p];
				if(newValue != void 0 && newValue !== null && newValue !== false){
					if(newValue === true) newValue = '';
	 				if(typeof(newValue) != 'string') newValue = '' + newValue;

	 				if(!node.hasAttribute(p) || node.getAttribute(p) != newValue)
						node.setAttribute(p, newValue);
				}
			}			
		}
	}
}());
