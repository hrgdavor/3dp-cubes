document.addEventListener('keydown', function(event){
  if(event.keyCode == 116 && !event.ctrlKey){
    event.keyCode = 0;
    event.preventDefault();
    setTimeout(function(){
      var params = mi2JS.parseUrl(document.location.search.substring(1));
      params['__refresh__'] = Math.random();
      document.location = '?' + mi2JS.joinUrl(params) + document.location.hash;
    },10);
    return false;
  }
});
