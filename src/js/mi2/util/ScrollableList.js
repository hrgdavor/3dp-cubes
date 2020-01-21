
function ScrollableList(allData, limit){
  this.allData = this.data = this.chunk = allData || [];
  this.limit = 0;
  this.offset = 0;
  this.filter = null;
  this.sort = null;
  if(limit) this.setLimit();
}

var proto = ScrollableList.prototype;

proto.newData = function(allData){
    this.allData = allData || [];
    this.applySort();
    this.applyFilter();
    this.applyLimit();
};

proto.moveOffset = function(move){
  this.setOffset(this.offset + move);

};

proto.setOffset = function(offset, limit){
  this.offset = offset;
  if(limit !== void 0) this.limit = limit;
  this.applyLimit();
};

proto.setLimit = function(limit){
  this.limit = limit;
  this.applyLimit();
};

proto.setFilter = function(filter){
  this.filter = filter;
  this.applyFilter();
  this.applyLimit();
};

proto.setSort = function(sort){
  this.sort = sort;
  this.applySort();
  this.applyFilter();
  this.applyLimit();
};

proto.applySort = function(){
  if(this.sort) this.allData.sort(this.sort);
};

proto.applyFilter = function(){
    if(this.filter){
      this.data = this.data.filter(this.filter);
    }else{
      this.data = this.allData;
    }  
};

proto.applyLimit = function(){
    var data = this.data;
    if(this.limit){
      if(this.limit + this.offset > data.length) this.offset = data.length - this.limit;
      if(this.offset < 0) this.offset = 0;
      console.log('offset',this.offset, this.limit);
      this.chunk = this.data.slice(this.offset, this.offset + this.limit);
    }else{
      this.chunk = this.data;
    }
};
