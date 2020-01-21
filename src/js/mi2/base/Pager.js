
mi2JS.addCompClass('base/Pager', 'Base', '<-TEMPLATE->',

// component initializer function that defines constructor and adds methods to the prototype 
function(proto, superProto, comp, superComp){

	var mi2 = mi2JS;

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		this.pages = [];
		this.opts = {pagesAbout: 5};		
		this.setup({});
	};

	proto.setup = function(opts){
		this.opts = mi2.update({pagesAbout: 5},opts);
		var num = this.opts.pagesAbout * 2+1;
		for(var i=0; i<num; i++){
			if(i>=this.pages.length){
				this.pages[i] = mi2.addComp(this,{tag:'B', attr:{as:"base/Button", event:'page'}}, this.pagesArea.el);
				this.pages[i].setText(i+1);
			}
		}
		for(var i=num; i<this.pages.length; i++){
			this.pages[i].setVisible(false);
		}
	};

	proto.update = function(table){
		this.limit = table.limit || 0;
		this.offset = table.offset || 0;
		this.rowCount = table.rowcount || 0;
		this.pagesCount = table.limit ? Math.ceil(table.rowcount / table.limit) : 0;
		this.attr('pages-count',this.pagesCount);
		this.curPage = table.limit ? Math.ceil(table.offset / table.limit) : 0;
		var offset = this.curPage - this.opts.pagesAbout;
		if((offset + this.opts.pagesAbout * 2) > this.pageCount) offset = this.pagesCount - this.opts.pagesAbout * 2;
		if(offset < 0) offset = 0;

		var count = this.pages.length >>>0;
		var num = this.opts.pagesAbout * 2+1;
		for(var i=0; i<count; i++){
			this.pages[i].setVisible(i<num && i+offset<this.pagesCount);
			this.pages[i].classIf("current", i+offset == this.curPage);
			this.pages[i].setText(i+offset+1);
			this.pages[i].attr('action', i+offset);
			this.pages[i].event = "page";
		}
		this.prev.setEnabled(this.curPage > 0);
		this.prev.attr('action', this.curPage-1);
		this.next.setEnabled(this.curPage < this.pagesCount-1);
		this.next.attr('action', this.curPage+1);
	};

	proto.on_page = function(evt){
		this.fireEvent({name:'page', page:evt.action, offset: mi2.num(evt.action)*this.limit, fireTo:'parent'});
	};

});


