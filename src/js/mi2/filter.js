(function(mi2){

	mi2.filters = {};
/*
@memberof mi2JS(core)
*/
	mi2.addFilter = function(fName, fc, params){
		fc.paramCount = params || 0;
		mi2.filters[fName] = fc;
	}

	mi2.getFilter = function(fName){
		if(fName instanceof Function) return fName;

		var f = mi2.filters[fName];
		if(!f) throw new Error('filter not found '+fName);

		return f;
	};

/*
@memberof mi2JS(core)
*/
	mi2.parseFilter = function(str, resolve){
		if(str === null || str === '') return null;
		var filters = str.split('|');

		if(filters.length > 1){
			return mi2.multiFilter(filters);
		}
		var filter = str.split(',');

		// resolve the filter immediatelly (early error)
		if(resolve && filter.length ){
			filter[0] = mi2.getFilter(filter[0]);
			if(filter.length == 1) return filter[0];
		} 

		return filter;
	};

/*
@memberof mi2JS(core)
*/
	mi2.filterNext = function(value, args, skip){
		return mi2.filter(value, Array.prototype.slice.call(args,skip+2), args[1], args[2]);
	};

/*
@memberof mi2JS(core)
*/
	mi2.multiFilter = function(filters){
		for(var i=0; i<filters.length; i++){
			filters[i] = mi2.parseFilter(filters[i]);
		}
		return function(value, propName, data){
			for(var i=0; i<filters.length; i++){
				value = mi2.filter(value, filters[i], propName, data);
			}
			return value;
		}
	}

/** filters: null, undefined, '', []  will return the original value without filtering 

@memberof mi2JS(core)
*/
	mi2.filter = function(value, fName, propName, data){
		if(!fName) return value;

		if(fName instanceof Function){
			return fName.apply(null,[value, propName, data]);
		}
		if(fName instanceof Array){
			if(!fName.length) return value;

			var arr = fName, f, params;
			fName = arr[0];
			f = mi2.getFilter(fName);
			params = [value, propName, data];
			if(arr.length > 1) params = params.concat(arr.slice(1));

			return f.apply(null,params);
		}

		return mi2.getFilter(fName).apply(null,[value, propName, data]);
	};

	mi2.filterConst = {'UNDEFINED': void 0, 'NULL':null, 'TRUE':true, 'FALSE':false};
    mi2.filters['const'] = function(value){
        return mi2.filterConst.hasOwnProperty(value) ? mi2.filterConst[value]: value;
    }


}(mi2JS));