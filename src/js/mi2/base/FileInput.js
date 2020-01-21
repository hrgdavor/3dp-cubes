mi2JS.addCompClass('base/FileInput', 'Base', '',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){

	var $ = mi2JS;

	proto.initChildren = function(){
		superProto.initChildren.call(this);

        this.input = mi2JS.addTag(null,'INPUT')
        this.input.setAttribute('type', 'file');
        if(this.hasAttr('multiple')) this.input.setAttribute('multiple', this.attr('multiple'));

        this.listen(this.el, 'click');
        
        this.listen(this.input, 'change',function(evt){
            this.fireEvent({name:'change', files: this.input.files, domEvent:evt});
        });
	};

    proto.on_click = function(){
        this.input.click();
    };

    proto.reset = function(){
        this.input.value = '';
    };
});
