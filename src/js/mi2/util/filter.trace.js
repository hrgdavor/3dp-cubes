(function(mi2){

	var bkp = {};
	var idx = {};

	mi2.filterTraceSetup = function(value, fName, params){
		if(bkp.filter) return;

		bkp.filter = mi2.filter;
		mi2.filter = function(value, fName, params){
			var index = ++idx.filter;
			console.log('filter-'+index,value, fName, params);
			var ret = bkp.filter(value, fName, params);
			console.log('filter-'+index+' returned', ret);
			return ret;
		};
	};

	mi2.filterTrace = function(value, fName, params){
		mi2.filterTraceSetup();
		idx.filter = 0;

		try{
			var ret = mi2.filter(value, fName, params);
			mi2.filterTraceRestore();
			return ret;
		}catch(e){
			mi2.filterTraceRestore();
			throw e;
		}

	}

	mi2.filterTraceRestore = function(){
		mi2.filter = bkp.filter;
		bkp = {};
	}


}(mi2JS));