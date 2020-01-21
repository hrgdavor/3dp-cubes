mi2JS.addCompClass('base/Group', 'Base', '',
/**  <b>Extends:</b> {@link mi2JS(comp).Base}<br>
@class base/Group
@memberof mi2JS(comp)
*/
function(proto, superProto, comp){
	
	// we want setValue from NWGroup to be null, or the one from Base as mi2JS.mixin will not overwritten
	proto.setValue = null;

	proto.isTransitive = function(evt){ return true; };

	// add/mixin methods from NWGroup but do not override any existing methods
	// this assumes both use this.items for keeping list of items
	if(mi2JS.applyNwGroup){
		mi2JS.applyNwGroup(proto);
	}else
		mi2JS.mixin(comp,mi2JS.NWGroup);

/** Copy of original expandVars function to use if needed.

@function expandOwnVars
@instance
@memberof mi2JS(comp).base/Group
*/
	proto.expandOwnVars = proto.expandVars;

/** Group component can not expand it's own data by default, but expects 
data to be delegates. Original function is renamed to expandOwnVars for eventual use.

@function expandVars
@instance
@memberof mi2JS(comp).base/Group
*/
	proto.expandVars = function(data){
		this.forEach(function(item,p){
			if(item.expandVars) item.expandVars(data[p]);
		});
	};
});
