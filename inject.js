(function(){
	//String format function
	//just like c printf method , more likely in c# string format function
	String.prototype.format = function()
	{
		var args = arguments;
		return this.replace(/\{(\d+)\}/g,                
		function(match,index){
			return args[index];
		});
	}

	//book name
	var key = $('html head title').html().split(' ')[0];
	//add resource div in aside
	var douban_book = $('<div id="douban-book" class="gray_ad"><h2>站外资料检索<a href="mailto:cattail2012@gmail.com" target="_blank">(By CatTail)</a></h2></div>');
	var ul_template = $('<ul style="margin-bottom:10px;"></ul>');

	//site classify
	(function(){
		var ul = ul_template.clone();
		var SITES = [
			{name:'百度文库',cssClass:'bdwenku'},
			{name:'新浪爱问',cssClass:'iask'},
		];
		SITES.forEach(function(site,index){
			ul.append(
				$('<li class="douban-book-site-type {0}" onclick="changeSite(\'{1}\')" style="display:inline;margin-right:10px;"><a>{2}</a></li>'.format(
					site.cssClass,site.cssClass,site.name
				))
			);
		});
		douban_book.append( ul );
		$('.aside').prepend( douban_book );


	})();

	//wenku.baidu.com
	(function(){
		var douban_book_bdwenku = $('<div class="douban-book-site bdwenku" style="display:none;"></div>');
		douban_book.append( douban_book_bdwenku );

		//file type
		var TYPES = [
			{name:'全部',value:'0',cssClass:'all'},
			{name:'DOC',value:'1',cssClass:'doc'},
			{name:'PDF',value:'2',cssClass:'pdf'},
			{name:'PPT',value:'3',cssClass:'ppt'},
			{name:'XLS',value:'4',cssClass:'xls'},
			{name:'TXT',value:'5',cssClass:'txt'},
		];

		//generate type info
		var ul = ul_template.clone();
		TYPES.forEach(function(type){
			ul.append( $('<li class="douban-book-bdwenku-type {0}" style="display:inline;margin-right:10px;"><a onclick="changeTypeBDWenku(\'{1}\')">{2}</a></li>'.format(type.cssClass,type.cssClass,type.name)) );
		});
		douban_book_bdwenku.append( ul );

		//get badiu wenku resource lists
		TYPES.forEach(function(type){
			getBDWenku(key,type,function(div){
				douban_book_bdwenku.append( div );
				if( type.cssClass === 'all' ){
					changeTypeBDWenku(type.cssClass);
					//show default site wenku.baidu.com
					changeSite('bdwenku');
				}
			});
		});

		//get baidu wenku resource list
		function getBDWenku(key,type,callback){
			var div = $('<div class="douban-book-bdwenku-list {0}" style="display:none;"></div>'.format(type.cssClass) );
			var ul = $('<ul class="bs"></ul>');
			div.append( ul );
			var li_str = '<li><a href="{0}" target="_blank" title="{1}">{2}</a><span style="float:right;">{4}</span><span style="margin-right:50px;float:right">{3}</span></li>';
			var more_str = '<div style="float:right;margin-top:10px;"><a href="{0}" target="_blank">更多</a></div><div style="clear:both;"></div>';

			var word = key === undefined ? '' : key;//keyword
			var lm = type === undefined ? '' : type.value;//file type
			urlencode(word,function(word){
				var search = "http://wenku.baidu.com/search?word={0}&lm={1}&od={2}&pn={3}".format(word,lm,0,0);

				$.ajax({
					url : search,
					success : function(data){
						var lis = '';
						$('.search-result dl',data).each(function(index,item){
							var name = $('dt a',item).text();
							name.length >= 10 ? name = name.slice(0,9) + '...' : 0;
							var url = $('dt a',item).attr('href');
							var desc = $('dd p.summary',item).text();
							var score = $('dd p.detail span',item).attr('title').match(/\d+/)[0] + '分';
							var date = $('dt span',item).text();
							lis += li_str.format(url,desc,name,score,date);
						});
						ul.append( $(lis) );
						//insert more link
						div.append( $(more_str.format(search)) );
						callback === undefined ? 0 : callback( div );
					},
				});
			})
		}

	})();


	//iask.sina.com.cn
	(function(){
		var douban_book_iask = $('<div class="douban-book-site iask" style="display:none;"></div>');
		douban_book.append( douban_book_iask );


		//add type list
		var ul = ul_template.clone();
		var TYPES= [
			{name:'全部',value:'',cssClass:'all'},
			{name:'TXT',value:'txt',cssClass:'txt'},
			{name:'DOC',value:'doc',cssClass:'doc'},
			{name:'PDF',value:'pdf',cssClass:'pdf'},
			{name:'PPT',value:'ppt',cssClass:'ppt'},
			{name:'HTM',value:'htm',cssClass:'htm'},
			{name:'RAR',value:'rar',cssClass:'rar'},
			{name:'EXE',value:'exe',cssClass:'exe'},
		];

		//add resource lists
		TYPES.forEach(function(obj,index){
			ul.append(
				$('<li class="douban-book-iask-type {0}" style="display:inline;margin-right:10px;"><a onclick="changeTypeIask(\'{1}\')">{2}</a></li>'.format(
					obj.cssClass,obj.cssClass,obj.name
				))
			);
		});
		douban_book_iask.append( ul );

		TYPES.forEach(function(element,index){
			getIask(key,element,function(div){
				douban_book_iask.append( div );

				//show default type resource list
				if( element.cssClass === 'all' ){
					changeTypeIask('all');
				}
			});
		});


		//get iask resource list
		function getIask(key,element,callback){
			//DOM string
			var div = $('<div class="douban-book-iask-list {0}" style="display:none;"></div>'.format(element.cssClass));
			var ul = $('<ul class="bs"></ul>');
			var li_str = '<li><a href="{0}" target="_blank" title="{1}">{2}</a><span style="float:right;">{3}</span></li>';
			var more_str = '<div style="float:right;margin-top:10px;"><a href="http://api.iask.sina.com.cn/api/search2.php?key={0}&from=douban&format={1}" target="_blank">更多</a></div><div style="clear:both;"></div>';
			//urls
			var search = 'http://api.iask.sina.com.cn/api/isharesearch.php?key={0}&format={1}&start=0&num=5&datatype=json&keycharset=utf8';

			//get book list
			$.ajax({
				url : search.format(key,element.value),
				success : function(data){
					data = eval(data);
					data.sp.result.forEach(function(element,index){
						//insert resource list
						var title , desc , url , size;
						title = element.title;
						desc = element.desc;
						url = element.url;
						size = adaptSize(element.filesize);
						ul.append( $( li_str.format(url,desc,title,size) ) );
					});
					//insert more
					div.append( ul , $(more_str.format(key,element.value)) );
					callback( div );
				},
			});
		}

		//translate byte to appropriote file size
		function adaptSize(byteSize){
			var UNITS = ['B','K','M','G','T'];
			var scale = 0 , result = byteSize , quotient;
			for( quotient = result/1024 ; quotient >= 1 ; scale++ ){
				result = quotient;
				quotient = result/1024;
			}
			return parseInt(result) + UNITS[scale];
		}

	})();

	//convert UTF8 encoding to GB2312
	//a bit trick
	//using baidu serach engine , when API changes , there will be no result
	function urlencode(str,callback){
		$.ajax({
			url : 'http://www.baidu.com/s?wd={0}'.format(str),
			success : function(data){
				var result = '';
				$('div#s_tab a',data).get(0).href.split('/').slice(-1)[0].split('&').some(function(e,i){
					if( e.split('=')[0] == 'word' ){
						result = e.split('=')[1];
						return true;
					}
				});
				if( result === '' ){
					alert("由于API更改,utf8到gb2312编码无法正常解析,请联系cattail2012@gmail.com");
				}
				callback(result);
			},
		});
	}

	//add additional javascript source in page
	function contentEval( source ) {
		var script = document.createElement('script');
		script.setAttribute("type", "application/javascript");
		script.textContent = source;
		document.body.appendChild(script);
	}
	function changeSite(site){
		$('.douban-book-site-type').css({
			"color" : "black",
			"background-color" : "transparent",
			"border" : "none",
		});
		$( '.douban-book-site-type.'+site ).css({
			"color" : "white",
			"background-color" : "#733",
			"border-left" : "1px solid #F99",
			"border-top" : "1px solid #F99",
			"border-right" : "1px solid #F33",
			"border-bottom" : "1px solid #F33",
		});

		$('.douban-book-site').css('display','none');
		$('.douban-book-site.'+site).css('display','block');
	}
	contentEval( changeSite );

	//add type change listener
	function changeTypeBDWenku(type){
		//type
		$('.douban-book-bdwenku-type').css({
			"color" : "black",
			"background-color" : "transparent",
			"border" : "none",
		});
		$( '.douban-book-bdwenku-type.'+type ).css({
			"color" : "white",
			"background-color" : "#733",
			"border-left" : "1px solid #F99",
			"border-top" : "1px solid #F99",
			"border-right" : "1px solid #F33",
			"border-bottom" : "1px solid #F33",
		});

		//resource list
		$('.douban-book-bdwenku-list').css('display','none');
		$('.douban-book-bdwenku-list.'+type).css('display','block');
	}
	contentEval( changeTypeBDWenku );

	//change type
	function changeTypeIask(format){
		$('.douban-book-iask-type').css({
			"color" : "black",
			"background-color" : "transparent",
			"border" : "none",
		});
		$( '.douban-book-iask-type.'+format ).css({
			"color" : "white",
			"background-color" : "#733",
			"border-left" : "1px solid #F99",
			"border-top" : "1px solid #F99",
			"border-right" : "1px solid #F33",
			"border-bottom" : "1px solid #F33",
		});

		//resource list
		$('.douban-book-iask-list').css("display","none");
		$( '.douban-book-iask-list.'+format ).css("display","block");
	}

	contentEval( changeTypeIask );
})(window);
