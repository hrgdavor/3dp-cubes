
mi2JS.parseUrl = function(query){
	if(!query || query == '') return {};
	// some properties can be arrays (when encoding multiple checkbox data)
	var ret = {}; 
	var match, name, val,
	    pl     = /\+/g,  // Regex for replacing addition symbol with a space
	    search = /([^&=]+)=?([^&]*)/g,
	    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };

	while (match = search.exec(query)){
		name = decode(match[1]);
		val = decode(match[2]);
		if(ret[name]){
			if(ret[name].push){ // already array
				ret[name].push(val);
			}else{ // second hit, not yet array
				ret[name] = [ret[name], val];
			}
		}else
			ret[name] = val;
	}
		return ret;
};
