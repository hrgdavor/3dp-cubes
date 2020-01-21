mi2JS.addCompClass('base/Picker', 'base/InputBase', '',


// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){
 
  var mi2 = mi2JS;
  var configId = 1;

  proto.initChildren = function(){
    superProto.initChildren.call(this);
    this.value = 1;
    this.config = [];
    this.configId = ++configId;
    this.mode = this.attrDef('mode','click');

    this.listen(this.el, 'touchstart',this.on_mousedown);
    this.listen(this.el, 'mousedown');      
    this.listen(this.el, 'mousemove');      
    this.listen(this.el, 'mouseout', this.on_mousemove);

    if(this.mode == 'click'){
      this.listen(this.el, 'click',this.on_mousedown);
    }//else if(this.mode == 'mousedown'){
    //}
  };
 
  proto.on_mousemove = function(evt){
    if(this.isReadOnly()) return;
    if(this.mouseIsDown && (evt.type=='mouseout' || Math.abs(evt.clientX - this.clientX) > 3 || Math.abs(evt.clientY - this.clientY) > 3)){
      this.moveActivated = true;
      this.showPopup();
    }
  };

  proto.on_mousedown = function(evt){
    this.moveActivated = false;
    evt.stop();
    if(this.isReadOnly()) return;
    
    this.mouseIsDown = evt.type == 'mousedown';

    if(this.mouseIsDown){
      this.clientX = evt.clientX;
      this.clientY = evt.clientY;
    }
    if(this.mode == evt.type){
      this.showPopup();
    }
  };

  proto.setRawValue = function(value){
    this.selected = null;
    var self = this;
    this.config.forEach(function(item,i){
      if(value == item.id){
        self.selected = item;
      } 
    });

    this.updateText(this, this.selected);
  };

  proto.on_click = function(evt){
    this.mouseIsDown = false;
    var target = evt.target;
    while(target && !target.data) target = target.parentNode;
    if(!target.data) return;
    this.selected = target.data;
    this.updateText(this, this.selected);
    this.hidePopup();
    this.fireIfChanged();
  };

  proto.updateText = function(item, value){
    if(value){
      if(value.html)
        item.setHtml(value.html);
      else
        item.setText(value.name || value.text);    
    }else{
      item.setText('');
    }
  };
  
  proto.setConfig = function(conf){
    this.config = conf;
    this.configId = ++configId;
  };

  proto.cancelPopup = function(){
    this.hidePopup();
  };

  proto.hidePopup = function(){
    proto.ctrl.currentComp = null; 
    proto.ctrl.setVisible(false); 
  }

  proto.showPopup = function(){
    var self = this;
    if(!this.ctrl){
      proto.items = [];
      proto.ctrl = new mi2(mi2.insertHtml(document.body,new mi2JS.TagDef('DIV')));
      this.view = new mi2(proto.ctrl.el);

      //proto.ctrl.el
      mi2.listen(document,'mouseup', function(evt){
        var currentComp = proto.ctrl.currentComp;
        if(!currentComp) return;
        if(!currentComp || (currentComp.mode != 'mousedown' && !currentComp.moveActivated )) return;

        var i=0, parent = evt.target.parentNode;
        while(i< 5 && parent && parent != proto.ctrl.el){
          parent = parent.parentNode;
          i++;
        }

        if(parent != proto.ctrl.el){
           currentComp.cancelPopup();
        }else{
          currentComp.on_click(evt);
        }
        currentComp.mouseIsDown = false;
      });

      mi2.listen(proto.ctrl.el,'click', function(evt){
          if(proto.ctrl.currentComp){
            if(proto.ctrl.currentComp.mode == 'mousedown') return;
            proto.ctrl.currentComp.on_click(evt);
          } 
      });

    }
    if(this.configId != proto.ctrl.configId){
      proto.ctrl.configId = this.configId;
      var config = this.config;
      proto.items = [];
      this.ctrl.el.innerHTML = '';

      for(var i=0; i<config.length; i++){
        var data = config[i];
        if(typeof data == 'string' || typeof data == 'number') data = {id:data, name:data};
        var el = mi2.insertHtml(this.ctrl.el,new mi2JS.TagDef('DIV'));
        el.data = data;

        el = new mi2(el);
        this.updateText(el, data);
        this.items.push(el);
      }
    }

    var value = this.selected ? this.selected.id : null;
    this.items.forEach(function(item,i){
      item.setSelected(value == item.el.data.id);
    });

    proto.ctrl.currentComp = this;

    var offsetTop = 0;
    var value = this.selected ? this.selected.id : void 0;
    proto.ctrl.setVisible(true);
    this.items.forEach(function(item){
      if(item.el.data.id == value) offsetTop = item.el.offsetTop * -1;
    });
    proto.ctrl.el.className = 'picker-click-ctrl '+this.attrDef('ctrl-class');

    mi2.popupControl(this,this.ctrl, {alignTop:'top', offsetTop:offsetTop} );
  };

  proto.getRawValue = function(){
    return this.selected ? this.selected.id : void 0;
  };
  
});