(function(mi2){


var undef = void 0;


function Agregator(){
	this.computed = [];
}

mi2.Agregator = Agregator;
var proto = Agregator.prototype;

proto.withFields = function(fields){
	this.fields = fields; 
	return this;
}

proto.withComputed = function(computed){
	this.computed = computed; 
	return this;
}

proto.forEach = function(func){
	var items = this.fields;
	for(var p in items){
		func(items[p], p, items);
	}
}

proto.map = function(func){
	var ret = {};
	this.forEach((item,i,src)=>{ ret[i] = func(item,i,src); });	
	return ret;
}

proto.filter = function(func){
	var ret = {};
	this.forEach((item,i,src)=>{ if(func(item,i,src)) ret[i] = item; });	
	return new Agregator().withFields(ret);
}

proto.getValue = function(){
	return this.map(item=>item.value);
}

proto.getInitialValue = function(){
	return this.map(item=>item.initialValue());
}

/** agregate single row into new object or an existing continuation
*/
proto.add = function(row, obj){
	obj = obj || this.getInitialValue();
	this.forEach((item,i)=>{
		if(item.filter(row)) obj[i] = item.visit( obj[i], item.column(row) );
	});
	return obj;
}

proto.groupAdd = function(row, groupKey, groups){
	groups[groupKey] = this.add(row, groups[groupKey]);
}

/** agregate rows into new object or an existing continuation
*/
proto.agregate = function(arr, obj){
	obj = obj || {};
	var val;
	this.forEach((item,i)=>{
		val = item.initialValue();
		arr.forEach(row=>{
			if(item.filter(row)) val = item.visit( val, item.column(row) );
		});
		obj[i] = val;
	});
	return obj;
}

proto.combineAdd = function(old, dataToAdd){
	this.forEach((item,i)=>{
		old[i] = item.visit(old[i], dataToAdd[i]);
	});
}

/** combine calculated results into one
*/
proto.combine = function(arr, obj){
	obj = obj || {};
	var val;
	this.forEach((item,i)=>{
		val = item.initialValue();
		arr.forEach(row=>{
			val = item.visit( val, row[i] );
		});
		obj[i] = val;
	});
	return obj;
}

proto.addComputed = function(row, conf){
	conf = conf || this.computed;
	conf.forEach(singleConf=>{
		for(var p in singleConf){
			row[p] = singleConf[p](row);
		}
	});
}


mi2.columnForCount = row=>1;

mi2.agregatorFunc = {
	sum:   (column, filter)=> mi2.makeFieldAgregator({ 
		column, filter,
		visit: (old, val) => val === undef ? old : old+val, 
		value: 0 
	}),
	count: (filter)=> mi2.makeFieldAgregator({
		filter, column: mi2.columnForCount,
		visit: (old, val) => val === undef ? old : old+val, 
		value: 0 
	}),
	min:   (column, filter)=> mi2.makeFieldAgregator({
		column,filter,
		visit: (old, val) => val === undef || (old !== undef && old <= val) ? old : val, 
	}),
	max:   (column, filter)=> mi2.makeFieldAgregator({
		column,filter, 
		visit: (old, val) => val === undef || old >= val ? old : val, 
		value: 0 
	}),
	column:(column, filter)=> mi2.makeFieldAgregator({
		column,filter,
		visit: (old, val)=>val,
	}),
};



/** utility function to help build agregator definition with plenty of handy defaults.
*/
mi2.makeFieldAgregator = function(def){

	if(def.column){
		if(typeof def.column == 'string'){
			var column = def.column;
			def.column = row=>row[column];
		} 

	}else{
		def.column = mi2.columnForCount;
	}

	if(!def.visit) def.visit = function(){};

	if(!def.filter) def.filter = row=>true;

	if(!def.initialValue){
		var _initialValue = def.value;
		def.initialValue = function(){ return _initialValue; }
	}

	if(!def.reset){
		def.reset = function(){ this.value = this.initialValue(); }
	}

	return def;
}


/** generate grouping key based on columns, by concatenating values into a string

columns example:
  ['groupId','userId']

hardcoded version that would give same key:
  row.groupId+'/'+row.userId+'/'
*/
mi2.makeGroupKeyFunction = function(columns){
	return function(row){
		ret = '';
		columns.forEach(column=>ret += row[column]+'/');
		return ret;
	}
}

mi2.groupRows = function(groupFunc, arr){
	return mi2.objToArray(mi2.mapRows(groupFunc, arr));
}

mi2.mapRow = function(groupKey, row, groups){
	groups[groupKey] = groups[groupKey] || []; 
	groups[groupKey].push(row);
	return groupKey;
}

mi2.mapRows = function(groupFunc, arr, groups){
	groups = groups || {};
	var groupKey = groupFunc(row);
	arr.forEach( row=>mi2.mapRow(groupKey, row, groups) );
	return groups;
}

mi2.average = function(total, count){
	return count == 0 ? 0: total / count;
}

mi2.objToArray = function(obj){
	var ret = [];
	for(var p in obj) ret.push(obj[p]);
	return ret;
}

})(mi2JS)