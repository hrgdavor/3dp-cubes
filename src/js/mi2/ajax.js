(function(mi2){

	var build;

	var builders = [
		function(){return new XMLHttpRequest();},
		function(){return new ActiveXObject("Msxml2.XMLHTTP");},
		function(){return new ActiveXObject("Microsoft.XMLHTTP");}
	];
	for(var i=0; i<builders.length; i++){
		try{ 
			builders[i](); 
			build = builders[i]; 
			break;
		}catch(e){}
	}


	/** ajax request <br>
		Parameters: single object with fields
		@param {string} [method=GET] - HTTP method
		@param {string|object} url - if object is provided then mi2JS.joinUrl will be called to gen url string 
		@param {function} callback - callback function when data is received
		@param {function} errback - callback if communication error occurs
		@param {boolean} [async=false] - async / sync
		@param {int} timeout - timeout in ms
		@param {object} self - The value of this provided for the call to callback and errback, check Function.prototype.call docs online

		@memberof mi2JS(core)
	*/
	mi2.ajax = function(_args){
		xhr = build();
		var args = mi2.update({ // defaults
			method:'GET', 
			self: this,
			url:"", 
			callback:function(){}, 
			async:true, 
			headers:{}
		}, _args);

		args.method = args.method.toUpperCase();

		xhr.open(args.method, args.url, args.async);
		xhr.withCredentials = args.credentials == 'same-origin';

		if (args.method == 'POST' && !args.headers['Content-Type']) args.headers['Content-Type'] = 'application/x-www-form-urlencoded';
		for(var h in args.headers) xhr.setRequestHeader(h,args.headers[h]);

		var ret = null;
		xhr.onreadystatechange = function(){
			if(this.readyState == 4){
				if(this.status == 200){
					args.callback.call(args.self,this);
					ret = this;
				}
				else if(args.errback) args.errback.call(args.self,this);
			}
		};

		if(args.timeout){
			xhr.timeout = args.timeout;		
			xhr.ontimeout = function(){
				if(args.errback) args.errback.call(args.self,this);
			}
		}

		xhr.send(args.postData);

		return ret;
	};

}(mi2JS));
