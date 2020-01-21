
mi2JS.joinUrl = function(pars){
	if(!pars) return "";
	// some properties can be arrays (when encoding multiple checkbox data)
	var p, val, arr = [], e=encodeURIComponent; 
	for(p in pars){
		val = pars[p];
		if(val == null) continue;
		if(val instanceof Array)
			for(var p2 in val) 
				arr.push(e(p)+"="+e(val[p2]));
		else
			arr.push(e(p)+"="+e(pars[p]));
	}
	return arr.join('&');
};
