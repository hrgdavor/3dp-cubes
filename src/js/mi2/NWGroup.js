(function(){

/*
forEach
required
getItem
toggleParams
callFunc
visibleIs
enabledIs
selectedIs
getValue
setValue
forSome
setConfig
forEachGet
setReadOnly
validate
getValidator
markValidate
*/

  var mi2 = mi2JS;
/**
@class NWGroup
@memberof mi2JS(core)
*/
  var DEF = mi2.NWGroup = function NWGroup(group){

    // better we fix the case when called without "new" operator than confusing developer with err later
    if(!(this instanceof DEF)){
      return new DEF(group);
    } 
    Object.defineProperty(this,'required', {value: false,   writable:true});
    Object.defineProperty(this,'inFilter', {value: void 0,  writable:true});
    Object.defineProperty(this,'outFilter',{value: void 0,  writable:true});
    Object.defineProperty(this,'items',{value: group || this, writable:true});
  }

  function makeMap(arr, val){
    // TODO in j6x use Map
    var obj = {};
    if(typeof arr == 'string'){
            obj[arr] = val;
        }else if(arr instanceof Array || arr.length){
          // if came from single argument array parameter like: visibleIs(['a','b']);
          if(arr.length == 1 && arr[0] instanceof Array ) arr = arr[0]; 
            for(var i=0; i<arr.length; i++){
                obj[arr[i]] = val;
            }          
    }else{
      return arr; // already a map
    }
    return obj;
  }

  DEF.nwDefs = {};

  mi2.addToNwGroup = function(prop, val){
    Object.defineProperty(DEF.prototype, prop, DEF.nwDefs[prop] = {value:val, writable:true});
  }
  
  mi2.applyNwGroup = function(obj, skip){
    skip = skip || {}; 
    for(var p in DEF.nwDefs){
      if(!skip[p])
        Object.defineProperty(obj, p, DEF.nwDefs[p]);
    } 
//    Object.defineProperty(obj,'required',{value:false, writable:true});
    return obj;
  }
  mi2.applyNwGroupEx = function(proto, skip){
    skip = skip || {};
    // NW gorup uses this to store keys, and that does not fit our case
    function makeProxy(p, func){
      proto[p] = function(){ 
        return func.apply(this.items, arguments); 
      }
    }
    var defs = DEF.nwDefs;
    for(var p in defs){
      if(typeof defs[p].value == 'function' && !skip[p]){
        makeProxy(p, defs[p].value);
      }
    }
  }

  /** 
  like array for each, but also supports object (string keys)

  @method forEach
  @instance
  @memberof mi2JS(core).NWGroup
  */
  mi2.addToNwGroup('forEach', function(func){
    for(var p in this.items){
      func(this.items[p], p, this.items);
    }
  });

/**
@method item
@instance
@memberof mi2JS(core).NWGroup
*/
  mi2.addToNwGroup('getItem', function(code){
    if(code && code.tagName){
      for(var p in this.items) if(this.items[p].el == code) return this.items[p];
    }
    return this.items[code];
  });

  mi2.addToNwGroup('toggleParams', function(funcName, arr, on, off){
    var what = makeMap(arr, true), items = this.items, item;
    for(var p in items){
      item = items[p];
      if(!item[funcName]) console.log('item '+p+' does not have function '+funcName, item);
      item[funcName].apply( item, what.hasOwnProperty(p) ? on : off );
    }
  });

  mi2.addToNwGroup('callFunc',  function(funcName, params){
    var func;
    for(var p in this.items){
      func = this.items[p][funcName];
      if(func) func.apply(this.items[p],params);
    }
  });


  function addToggle(funcName, prop){
    // new Name
    mi2.addToNwGroup(funcName+'Ex', function(){
      this.toggleParams(funcName,  arguments, [true], [false]);
    });
    mi2.addToNwGroup(prop, function(){
      if(!this.toggleParams) console.log('this',Object.keys(this.items), typeof this.items, this.items);
      this.toggleParams(funcName,  arguments, [true], [false]);
    });
  }
  // TODO in j6x remove visibleIs..., leave *Ex
  addToggle('setVisible', 'visibleIs');// + setVisibleEx
  addToggle('setEnabled', 'enabledIs');// + setEnabledEx
  addToggle('setSelected', 'selectedIs');// + setSelectedEx


  mi2.addToNwGroup('getValue', function(){
    var ret = (this.items instanceof Array) ? []:{};
    for(var p in this.items){
      if(this.items[p].getValue){       
        var val = this.items[p].getValue();
        if(val !== void 0) ret[p] = val;
      }else{
        mi2.logError('getValue not defined for '+p,new Error(p),{key:p, obj:this.items[p]});
      }
    }
    return mi2.filter( ret, this.outFilter );
  });

  mi2.addToNwGroup('setValue', function(value){
    value = mi2.filter( value, this.inFilter ) || {};
    for(var p in this.items){
      if(this.items[p].setValue){       
        this.items[p].setValue(value[p]);
      }else{
        mi2.logError('setValue not defined for '+p,new Error(p),{key:p, obj:this.items[p]});
      }
    }
  });

  mi2.addToNwGroup('forSome', function(arr, func){
    var what = makeMap(arr, true), items = this.items;
    for(var p in items){
        if(what.hasOwnProperty(p)) 
            func(items[p],p,items);
    }
  });
  mi2.addToNwGroup('setConfig', function(config){
    config = config || {};
    for(var p in this.items){
      if(this.items[p].setConfig){
        this.items[p].setConfig(config[p]);
      }else{
        mi2.logError('setConfig not defined for '+p,new Error(p),{key:p, obj:this.items[p]});
      }
    }
  });

  mi2.addToNwGroup('forEachGet', function(func){
    if(this.items instanceof Array){
      var ret = [];
      for(var p in this.items){
          var val = func(this.items[p], p, this.items);
          if(val !== void 0) ret.push(val);
      }
    }else{
      var ret = {};
      for(var p in this.items){
          var val = func(this.items[p], p, this.items);
          if(val !== void 0) ret[p] = val;
      }
    }
    return ret;
  });

  mi2.addToNwGroup('setReadOnly', function(readOnly){
    this.callFunc('setReadOnly',[readOnly]);
  });

  mi2.addToNwGroup('validate', function(){
      var validator = this.getValidator();
      var result = validator.validate(this.getRawValue ? this.getRawValue():this.getValue());
      this.markValidate(result);
      return result;
  });

  mi2.addToNwGroup('getValidator', function(){
    var defReq = this.required;
    var rules = this.forEachGet(function(item,code){
      return mi2.getValidator(item, defReq);
    });
    return new mi2.GroupValidator(rules, defReq);
  });

  mi2.addToNwGroup('markValidate', function(data){
    data = data || new mi2.GroupValidity({});
    if(data.item && data.item instanceof Function){
            this.forEach(function(item,p){
          if(item.markValidate)
            item.markValidate(data.item(p));
          else
            mi2.markValidate(item, data.item(p));     
        });            
        }else{
            console.error('GroupValidity expected');
            console.log('Validity provided', data, 'for',this.items);
        }
  });

  mi2.addToNwGroup('focus', function(){
    var item, toFocus;
    for(var p in this.items){
      item = this.items[p];
      if( ( !toFocus || item.hasAttr('firstInput') )
          && item.focus 
          && !(item.isReadOnly && item.isReadOnly()) ){

        toFocus = item;
      }
    }
    if(toFocus) toFocus.focus();
  });

}());