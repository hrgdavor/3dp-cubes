(function(){

	var mi2 = mi2JS;
	var mi2Proto = mi2.prototype;

	mi2.hiddenAttribute = 'hidden';
	mi2.disabledAttribute = 'disabled';

	mi2Proto.isVisible = function(){
		return !this.el.hasAttribute(mi2.hiddenAttribute);
	};

	mi2Proto.setVisible = function(visible){
		this.attr(mi2.hiddenAttribute, visible ? null:'');
	};

	mi2Proto.isEnabled = function(){
		return !this.el.hasAttribute(mi2.disabledAttribute);
	};

	mi2Proto.setEnabled = function(enabled){
		this.attr(mi2.disabledAttribute, enabled ? null:'');
	};

	mi2Proto.isSelected = function(){
		return this.hasClass('selected');
	};
	mi2Proto.setSelected = function(selected){
		this.classIf('selected', selected);
	};

}(mi2JS));
