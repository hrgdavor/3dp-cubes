mi2JS.addCompClass('base/MultiInput', 'base/Loop', '',

// component initializer function that defines constructor and adds methods to the prototype
    function(proto, superProto, comp, superComp) {

        var mi2 = mi2JS;

        proto.initTemplate = function(){
            superProto.initTemplate.apply(this,arguments);
            this.setValue([]);
        };

        proto.defaultNewValue = function(){
            return null;
        }

        proto.isEmptyValue = function(value){
            return value === null;
        }

        proto.itemCreated = function(item, i){
            superProto.itemCreated.apply(this,arguments);
            this.listen(item,'change', this.on_itemChange);
        };

        proto.on_itemChange = function(evt){
            var items = this.getItems();
            var len = items.length;
            if(this.isEmptyValue(evt.value)){
                if(len > 1 && evt.target == items[len-2] && this.isEmptyValue(items[len-1].getValue()) ){
                    this.pop();
                }
            }else{
                if(evt.target == items[len-1]){
                    this.push(this.defaultNewValue());
                }
            }
        };

        proto.getRawValue = function(){
            var ret = superProto.getRawValue.call(this);
            while (ret.length && this.isEmptyValue(ret[ret.length -1])) ret.pop();

            if (this.attrBoolean('remove-empty')) {
                var tmp = [];
                for (var i=0; i<ret.length ; i++) {
                    if ( !this.isEmptyValue(ret[i]) ) tmp.push(ret[i]);
                }

                ret = tmp;
            }
            return ret;
        };
        
        proto.setValue = function(cval) {
            superProto.setValue.call(this,cval);
            this.push(this.defaultNewValue());
        };

});