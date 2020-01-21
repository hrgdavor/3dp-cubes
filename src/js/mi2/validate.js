(function(mi2){

	mi2.getValidator = function(comp, defReq){
		if(comp.getValidator) return comp.getValidator();
		return new Validator({
			required: comp.attrBoolean('required', defReq),
			invalid: comp.attr('invalid'),
			min: comp.attr('min'),
			max: comp.attr('max'),
			example: comp.attr('example'),
			pattern: comp.attr('pattern')
		});		
	}

	mi2.validationMessage = function(v){
		if(!v) return '';
		return v.message;
	};

	mi2.markValidate = function(comp,data){
		data = data || new mi2.Validity();
		comp.classIf('validation-error', data.isValid && !data.isValid());
		comp.attr('validation-error', (data.isValid && data.isValid()) ? null : mi2.validationMessage(data));
	};

	mi2.patterns = {
		'email': {
			pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$',
			invalid: 'invalid_email_address'
		},
		'int':   {
			pattern: "^-*\\d+$", example:"123", 
			invalid:'must_be_integer' 
		},
		'float': { 
			pattern: "^-*((\\d+)|(\\d+\\.\\d+))$", example:"11.45", 
			invalid:'must_be_decimal'
		}
	};

	/* **************** Validity   ************************/

	var Validity = mi2.Validity = function(result){
		if(arguments.length == 0 || result === true || result === null || result === void 0){
			this.valid = true;
		}else{
			this.valid = false;
			if(typeof result == 'string'){
				result = {message: result};
			}
			this.message = result.message || 'invalid_value';
			this.type = result.type || 'custom';
			this.data = result.data || {};
		}
	}

	Validity.required = function(req){
		return new Validity(req ? {message: 'required', type:'required'}: void 0);
	}


	Validity.prototype.isValid = function(){
		return this.valid
	}




	/* **************** Validator   ************************/

	var Validator = mi2.Validator = function(rules, req){
		if(!rules) 
			rules = {required: req};
		else if(rules instanceof Function) 
			rules = {pattern:rules, required:req};
		this.rules = rules;
	}

	var RProto = Validator.prototype;

	//texts:
	// required, invalid_value, example_correct_value, min_allowed_value, max_allowed_value, must_be_between
	RProto.validate = function(v){
		var opts = this.rules;

		if(v === null || v === void 0 || v === ''){
			return Validity.required(opts.required);
		}

		if(opts.pattern && typeof(opts.pattern) == 'function'){
			return opts.pattern(v,opts) || new Validity();
		}

        if(!opts.pattern) return new Validity();

		if(mi2.patterns[opts.pattern]){
			var predef = mi2.patterns[opts.pattern];
			if(typeof(predef) == 'function'){
				return predef(v,opts) || new Validity();
			}
			opts.pattern = predef.pattern;
			if(!opts.example) opts.example = predef.example;
			if(!opts.invalid) opts.invalid = predef.invalid;
		}

		var reg = new RegExp(opts.pattern);
		if(!reg.test(v)){
			var msg = opts.invalid || 'invalid_value';
			return new Validity( {type:'pattern', message:msg, data:{example: opts.example} } );
		}

		var hasMin = opts.min !== void 0 && opts.min !== null;
		var hasMax = opts.max !== void 0 && opts.max !== null;
		if(hasMin || hasMax){
			v = mi2.num(v);
			var min = mi2.num(opts.min);
			var max = mi2.num(opts.max);
			var prep = {type:'invalid_range', data:{min:min, max:max}};
			if(hasMax && hasMin){
				if(v<min || v>max) prep.message = 'must_be_between';
			}else if(hasMax){
				if(v>max) prep.message = 'max_allowed_value';					
			}else if(hasMin){
				if(v<min) prep.message = 'min_allowed_value';					
			}
			if(prep.message) return new Validity(prep);
		}
		return new Validity();
	};



	/* **************** GroupValidator   ************************/

	var GroupValidator = mi2.GroupValidator = function(items, required){
		this.required = required;
		var tmp = this.items = items instanceof Array ? []:{};
		var item;
		for(var p in items){
			item = items[p];
			if(!item || typeof item.validate != 'function'){
				tmp[p] = new Validator(item);
			}else{
				tmp[p] = item;
			}
		}
	}
	var GProto = GroupValidator.prototype;

	GProto.validate = function(value){
		if(value === null || value === void 0) return Validity.required(this.required);
		var resp = {};
		for(var p in this.items){
			resp[p] = this.items[p].validate(value[p]);
		}
		return new GroupValidity(resp);
	}



	/* **************** GroupValidity   ************************/

	var GroupValidity = mi2.GroupValidity = function(items){
		var tmp = this.items = items instanceof Array ? []:{};
		var item;
		for(var p in items){
			item = items[p];
			if(!item || typeof item.isValid != 'function'){
				tmp[p] = new Validity(item);
			}else{
				tmp[p] = item;
			}
		}
	}

    GroupValidity.prototype.item = function(code){
        return this.items[code];
    };
    
	GroupValidity.prototype.isValid = function(code){
		var item;
		if(code !== void 0){
			 item = this.items[code];
			return !item || item.isValid();			
		}else{
			for(var p in this.items){
				if(!this.items[p].isValid()) return false;
			}			
		}
		return true;
	};

	GroupValidity.prototype.setValid = function(code,value){
		this.items[code] = (value && typeof value.isValid == 'function') ? item : new Validity(value); 
	};

})(mi2JS);
