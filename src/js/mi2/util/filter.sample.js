(function(mi2){

	mi2.addFilter('noNull',function(value, propName, data){
		return value === null ? '' : mi2.filterNext(value, arguments, 1);
	},-1);

	mi2.addFilter('ifNull',function(value, propName, data, def){
		return value === null ? def : mi2.filterNext(value, arguments, 2);
	},-1);

	mi2.addFilter('fixedStr', function(value, propName, data, decimals){
		value = mi2.num(value);
		return value.toFixed(mi2.num(decimals));
	},1);


	mi2.addFilter('trim',function(value, propName, data){
		if(!value) 
			value = '';
		else{
			value = value.trim().replace(/\s\s+/g, ' ');
		}
		return mi2.filterNext(value, arguments, 1);
	},-1);

	mi2.filters.fixedStr2 = function(value){
		value = mi2.num(value);
		return value.toFixed(2);
	};

	mi2.filters.intStr = function(value){
		value = mi2.num(value);
		return value.toFixed(0);
	}

	mi2.filters.split = function(value,propName, data, delim){
		if(value == null) return [];
		if(value.split) return value.split(delim === void 0 ? ',':delim);
		return [];
	}

	mi2.filters.join = function(value,propName, data, delim){
		if(value == null) return '';
		if(value.join) return value.join(delim === void 0 ? ',':delim);
		return '';
	}

	mi2.filters.str2json = function(value){
		if(value == null) return null;
		return JSON.parse(value);
	}

	mi2.filters.json2str = function(value){
		if(value == null) return null;
		return JSON.stringify(value);
	}


}(mi2JS));