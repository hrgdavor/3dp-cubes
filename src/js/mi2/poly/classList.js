(function(mi2){
/**
Polyfill for browsers that do not have classList support

@namespace polyClassList
*/

	var mi2Proto = mi2.prototype; // allow minimizer to shorten prototype assignments

/**
@function classIf
@memberof polyClassList
*/
	mi2Proto.classIf = function(toAdd, condition){
		if(condition)
			this.addClass(toAdd);
		else
			this.removeClass(toAdd);
	};

/**
@function classUnless
@memberof polyClassList
*/
	mi2Proto.classUnless = function(toAdd, condition){ 
		this.classIf(toAdd, !condition); 
	};

/**
@function addClass
@memberof polyClassList
*/
	mi2Proto.addClass = function(toAdd) {
		if( !this.el.className ) 
			this.el.className = toAdd;
		else if(!this.hasClass(toAdd))
			this.el.className += ' ' + toAdd;
	};

/**
@function hasClass
@memberof polyClassList
*/
	mi2Proto.hasClass = function(name) {
			if(this.el.className == name) return true;
			var a = this.el.className.split(' ');
			for (var i = 0; i < a.length; i++) { if (a[i] == name) return true; }
			return false;
	};

/**
@function removeClass
@memberof polyClassList
*/
	mi2Proto.removeClass = function(toRemove) {
		var newC = '';
		var a = this.el.className.split(' ');
		for (var i = 0; i < a.length; i++) {
			if (a[i] != toRemove) {
				if (i > 0)
					newC += ' ';
				newC += a[i];
			}
		}
		this.el.className = newC;
	};

})(mi2JS);