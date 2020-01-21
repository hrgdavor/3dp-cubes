// @flow
let itsAsEasyAs = 'abc';
itsAsEasyAs = 123; // Error: Type '123' is not assignable to type 'string'


function mi2JS_genCode(elem, view){
  var parent = document.getElementById('view');

  var el = mi2JS.addTag;

  function genTag(parent /* : ?Element */, elem /* : ?Element */){
    var x /* : number */ = 1;
    //x={};
    //x=false;
    
    var elTag = el(parent, {tag:'TAG', attr:{name:elem.tagName}});

    var elOpenTag = el(elTag, 'OPEN-TAG');

    var elTagContent = el(elTag, 'CONTENT');

    var elCloseTag = el(elTag, {tag:'CLOSE-TAG', html:elem.tagName});

    el(elOpenTag, {tag:'TAG-NAME',html:elem.tagName});

    var at = elem.attributes || [];
    var elAttr;
    for(var a=0; a<at.length; a++){
      elAttr = el(elOpenTag, {tag:'ATTR',attr:{name:at[a].name}});
      el(elAttr, {tag:'NAME', html:at[a].name});
      el(elAttr, {tag:'VALUE', html:at[a].value});
    }

    var it /* : ?Element */ = elem.firstElementChild;
    var count = 0;
    var countText = 0;
    while(it){
      if(it.tagName){
        genTag(elTagContent, it);
      }else{
        var elText = el(elTagContent, 'TEXT-NODE');
        elText.textContent = it.nodeValue;
        countText++;
      }
      it = it.nextElementSibling;
      count++;
    }
    if(count == 0 || (count ==1 && countText == 1)){
      elTag.setAttribute('text-only','');
    }
  }

  genTag(view,elem);

}