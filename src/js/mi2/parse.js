(function(){

var mi2 = mi2JS;
/* 
@memberof mi2JS(core)
*/
mi2.parse = function(elem, obj){
	var compData = mi2.compData;
	if(!elem) mi2.nn({elem:elem});

	if(typeof(elem) == "string") elem = mi2.addHtml(elem);

	if(!obj){
		if(compData){
			var compName = elem.getAttribute('as') || compData.tags[elem.tagName];
			if(compName)
				obj = mi2.makeComp(elem, compName, obj);
			else
				obj = new mi2(elem);
		}
	}  

//	mi2.parseChildren(elem, obj);

	return obj;
};

// mi2.addGroupToComp = function(comp, group, isArray){
// 	if(isArray){
// 		comp[group] = [];
// 		comp['$'+group] = new mi2.NWGroup(obj[group]);
// 	}else{
// 		comp[group] = {};
// 		comp['$'+group] = new mi2.NWGroup(obj[group]);		
// 	}
// }

mi2.addGroupToComp = function(comp, group, isArray){
	if(isArray){
		comp[group] = comp['$'+group] = mi2.applyNwGroup([]);
	}else{
		comp[group] = comp['$'+group] = new mi2.NWGroup();
	}
}

/** 
p       access by
value        calling
--------------------------
info      |  obj.info
img.      |  obj.img[0]
img.      |  obj.img[1]
bt.edit   |  obj.bt.edit
bt.save   |  obj.bt.save

@function setRef
@memberof mi2JS(core)
*/
mi2.setRef = function(obj, comp, prop, group){

	var idx = -1;
	if(prop || group){

		if( (idx=prop.indexOf('.')) != -1){
			group = prop.substring(0,idx);
			prop = prop.substring(idx+1);
			// TODO allow multiple levels
			mi2.setRef(obj, comp, prop, group);
		}else if(group){
			comp.__propGroup = group;
			if(prop){
				//example: p="bt.edit"
				if(!obj[group]){
					mi2.addGroupToComp(obj,group);
				} 
				comp.__propName  = prop;
                if(obj[group][prop]) logPropTaken(group+'.'+prop, obj, obj[group][prop]);
                obj[group][prop] = comp;
            }else{
                //example: p="bt."
				if(!obj[group]){
					mi2.addGroupToComp(obj,group, true);
				} 
                comp.__propName = obj[group].length;
				obj[group].push(comp);
			}
		}else{
			//example p="edit"
            if(obj[prop]) logPropTaken(prop, obj, obj[prop]);
			comp.__propName = prop;
			obj[prop] = comp;
		}
	}
};

function logPropTaken(prop, obj, by){
    // console.log('WARNING! property: '+prop+' is already filled on ', obj, ' by ', by);
}

/**

 if as=".." attribute is present, component will be instantiated with that node as root 
  - reference wil now point to component object
    (for components made correctly html element ref will be moved to .node property under that object)
  - assign will not go into recursion here, so component can choose the initialization itself

@function parseChildren
@memberof mi2JS(core)
*/
 mi2.parseChildren = function(elem, obj){
	var compData = mi2.compData;
	var el = elem.firstElementChild,next,templateAttr;
	while(el){
		next = el.nextElementSibling;
		templateAttr = el.getAttribute('template');
		if(el.getAttribute && el.tagName != 'TEMPLATE' && (templateAttr === null || templateAttr === 'inline') ){
			var comp = null, compName;
			if(compData){
				compName = el.getAttribute('as') || compData.tags[el.tagName];
				if(compName && templateAttr !== ''){
					comp = mi2.constructComp(el, compName, obj);
				}
			}

			var prop = el.getAttribute('p');
			if(prop){
				if(!comp) comp = new mi2(el);
				mi2.setRef(obj, comp, prop);
				// if property id "group." the part after dot is based on index, 
				// we put the index into html for consistency.
				// for example "group.3" for fourth time such element is found
				if(prop.charAt(prop.length-1) == '.') el.setAttribute('p',prop+comp.__propName);

				if(!compName && obj.addRef) obj.addRef(comp); // list of referenced nodes
			}

			prop = el.getAttribute('name');
			if(prop){
				if(!comp) comp = new mi2(el);
				mi2.setRef(obj, comp, prop, 'items');
			}

			// recursion is stopped for components with inline template, as the component will decide how to initialize
			if(templateAttr === null)
				mi2.parseChildren(el, obj);
		}


		el = next;
	}
};

})();