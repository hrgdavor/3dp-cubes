(function(mi2JS){
/** Check if any of the the values are null and throw an Error. 
	Use where fail-fast is needed so invalid parameters don't cause errors later.
	
@function isEmpty
@memberof mi2JS(core)

@param name
@param list
*/
$.nn = function(name,list){
	for(var p in list){
		if(list[p] === null || typeof(list[p]) == "undefined"){
			console.error(name," parameter ",p," is null but should not be ");
		}
	}
};

}(mi2JS));
