mi2JS.listen(window,'load',function(evt){
	mi2JS.listen(document.body,'mousedown',function(evt){
		if(evt.ctrlKey){
			var p = evt.target;

			console.log('...........');
			console.log('dump component path from ', p);
			console.log('...........');
			
			var hasComp, idx;
			var lines = [];
			var path = '';
			// collect components from child clicked to MAIN_APP
			while(p){
				var comp = p.getAttribute('as');
				var prop = p.__propPath || p.getAttribute('p');
				if(comp == 'MainApp') prop = "MAIN_APP"; // the top

				// compose path to access the component via global MAIN_APP
				if(prop && (comp || !hasComp)){
					// simple binding is allowed only once and only as top level
					if(!comp && ! hasComp) path = '';
					
					idx = prop.indexOf('.');// conver aa.1 to aa[1]

					if(path) path = '.'+path;
					if(idx != -1){
						var left = prop.substring(0,idx);
						var right = prop.substring(idx+1);
						prop = left;
						if(mi2JS.num(right)) 
							prop +='['+right+']';
						else
							prop += '.'+right;
					} 
					path = prop+path;
					hasComp = hasComp || comp;
				}

				if(comp || prop){
					if(!comp) prop = '    '+prop;
					lines.push([prop ||'', comp || '', p]);
				}


				if(p.tagName == 'BODY' || prop == 'MAIN_APP') break;
				p=p.parentNode;
			}
			var max = [0,0];
			var len = 0, i,c;
			for(i=0; i<lines.length; i++){
				for(c=0; c<2; c++){
					max[c] = Math.max(max[c], lines[i][c].length);
				}
			}

			for(i=0; i<lines.length; i++){
				for(c=0; c<2; c++){
					len = lines[i][c].length;
					if(len < max[c]){
						for(var fill=len; fill<max[c]; fill ++) lines[i][c] +=' ';
					}
				}
				console.log(lines[i][0], lines[i][1], lines[i][2]);
			}
			console.log(path);
			console.log('...........');
		}
	});
});
