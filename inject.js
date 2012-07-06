$(document).ready(function(){
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

	//capitalize string's first letter
	String.prototype.capitalize = function(){
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
	//short cut string
	String.prototype.shortcut = function(len,end){
		len = len === undefined ? 10 : len;
		end = end === undefined ? '...' : end;
		return this.length >= len ? this.slice(0,len) + end : this;
	}


	var bookseeker;
	var storage = chrome.storage.local;
	storage.get(null,function(items){
		var site_list = [
		];
		//===========================
		defaultSite = items.defaultSite || 'iask';
		maxNum = items.maxNum || 5;

		var ul_template =  '<ul style="margin-bottom:10px;"></ul>';
		var li_template =  '<li class="{0}" onclick="change{1}({2})" style="display:inline;margin-right:10px;"><a>{3}</a></li>';
		bookseeker = {
			name : '豆瓣书虫',
			css : 'bookseeker',
			ul_template : ul_template,
			li_template : li_template,
			maxNum : maxNum,
			defaultSite : defaultSite,
			sites : [
				{
					name : '新浪爱问',
					css : 'iask',
					types : [
						{name:'全部',key:'',css:'all'},
						{name:'TXT',key:'txt',css:'txt'},
						{name:'DOC',key:'doc',css:'doc'},
						{name:'PDF',key:'pdf',css:'pdf'},
						{name:'PPT',key:'ppt',css:'ppt'},
						{name:'HTM',key:'htm',css:'htm'},
						{name:'RAR',key:'rar',css:'rar'},
						{name:'EXE',key:'exe',css:'exe'},
					],
					getResource : getIask,
				},
				{
					name : '百度文库',
					css : 'wenku',
					types : [
						{name:'全部',key:'0',css:'all'},
						{name:'DOC',key:'1',css:'doc'},
						{name:'PDF',key:'2',css:'pdf'},
						{name:'PPT',key:'3',css:'ppt'},
						{name:'XLS',key:'4',css:'xls'},
						{name:'TXT',key:'5',css:'txt'},
					],
					getResource : getWenku,
				},

			],
		};

		initialize();
	});

	function initialize(){
		var css = bookseeker.css;
		var div = $('<div></div>').addClass('gray_ad').append( $('<h2></h2>').html(bookseeker.name) );
		var ul = $(bookseeker.ul_template);
		$('.aside').prepend( div.append( ul ) );

		bookseeker.sites.forEach(function(site){
			//site specific css class
			var css_site = [ css,site.css ].join(' ');
			//create site <li>
			ul.append( $(bookseeker.li_template.format( css_site,'Site',"'"+site.css+"'",site.name )) );

			var div_site = $('<div></div>').addClass(css_site).css('display','none');
			var ul_site = $(bookseeker.ul_template);
			div.append( div_site.append( ul_site ) );

			//create type
			site.types.forEach(function(type){
				//type specific css class
				var css_type = [ css_site.replace(' ','-'),type.css].join(' ');
				//create type <li>
				ul_site.append(
					$(bookseeker.li_template.format(
						css_type,'Type',"'"+site.css+"'"+","+"'"+type.css+"'",type.name
					))
				);

				var div_type = $('<div></div>').addClass(css_type).css('display','none');
				div_site.append( div_type );

				//get resource list
				site.getResource( type,div_type );
			});

			//show default
			changeSite(bookseeker.defaultSite);
			bookseeker.sites.forEach(function(site){
				changeType(site.css,'all');
			});
		});
	}

	//get resoure list
	//return 
	function getIask(type,div){
		var key = $('html head title').html().split('(')[0];
		//DOM string
		var ul = $('<ul class="bs"></ul>');
		var li_str = '<li><a href="{0}" target="_blank" title="{1}">{2}</a><span style="float:right;">{3}</span></li>';
		var more_str = '<div style="float:right;margin-top:10px;"><a href="http://api.iask.sina.com.cn/api/search2.php?key={0}&from=douban&format={1}" target="_blank">更多</a></div><div style="clear:both;"></div>';
		//urls
		var search = 'http://api.iask.sina.com.cn/api/isharesearch.php?key={0}&format={1}&start=0&num={2}&datatype=json&keycharset=utf8';

		//get book list
		$.ajax({
			url : search.format(key,type.key,bookseeker.maxNum),
			success : function(data){
				data = eval(data);
				data.sp.result.forEach(function(element,index){
					//insert resource list
					var title , desc , url , size;
					title = element.title.shortcut(20);
					desc = element.desc;
					url = element.url;
					size = calSize(element.filesize);
					ul.append( $( li_str.format(url,desc,title,size) ) );
				});
				//insert more
				div.append( ul , $(more_str.format(key,type.key)) );
			},
		});
	}

	function getWenku(type,div){
		var ul = $('<ul class="bs"></ul>');
		var li_str = '<li><a href="{0}" target="_blank" title="{1}">{2}</a><span style="float:right;">{4}</span><span style="margin-right:50px;float:right">{3}</span></li>';
		var more_str = '<div style="float:right;margin-top:10px;"><a href="{0}" target="_blank">更多</a></div><div style="clear:both;"></div>';

		var word = $('html head title').html().split('(')[0];
		var lm = type === undefined ? '' : type.key;//file type
		urlencode(word,function(word){
			var search = "http://wenku.baidu.com/search?word={0}&lm={1}&od={2}&pn={3}".format(word,lm,0,0);

			$.ajax({
				url : search,
				success : function(data){
					var lis = '';
					$('.search-result dl',data).each(function(index,item){
						//show desired number of book
						if( index >= bookseeker.maxNum )
							return;
						var name = $('dt a',item).text().shortcut();
						var url = $('dt a',item).attr('href');
						var desc = $('dd p.summary',item).text();
						var score = $('dd p.detail span',item).attr('title').match(/\d+/)[0] + '分';
						var date = $('dt span',item).text();
						lis += li_str.format(url,desc,name,score,date);
					});
					ul.append( $(lis) );
					//insert more link
					div.append( ul , $(more_str.format(search)) );
				},
			});
		})
	}

	function changeSite(site){
		$('li.bookseeker').css({
			"color" : "black",
			"background-color" : "transparent",
			"border" : "none",
		});
		$('li.bookseeker.'+site).css({
			"color" : "white",
			"background-color" : "#733",
			"border-left" : "1px solid #F99",
			"border-top" : "1px solid #F99",
			"border-right" : "1px solid #F33",
			"border-bottom" : "1px solid #F33",
		});

		$('div.bookseeker').css('display','none');
		$('div.bookseeker.'+site).css('display','block');
	}
	function changeType(site,type){
		$('li.bookseeker-'+site).css({
			"color" : "black",
			"background-color" : "transparent",
			"border" : "none",
		});
		$('li.bookseeker-'+site+'.'+type).css({
			"color" : "white",
			"background-color" : "#733",
			"border-left" : "1px solid #F99",
			"border-top" : "1px solid #F99",
			"border-right" : "1px solid #F33",
			"border-bottom" : "1px solid #F33",
		});

		$('div.bookseeker-'+site).css('display','none');
		$('div.bookseeker-'+site+'.'+type).css('display','block');
	}
	contentEval(changeSite);
	contentEval(changeType);

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
					alert("Due to the baidu API changes,encoding convertion from UTF8 to GB2312 failed,contact cattail2012@gmail.com");
				}
				callback(result);
			},
		});
	}
	//translate byte to appropriote file size
	function calSize(byteSize){
		var UNITS = ['B','K','M','G','T'];
		var scale = 0 , result = byteSize , quotient;
		for( quotient = result/1024 ; quotient >= 1 ; scale++ ){
			result = quotient;
			quotient = result/1024;
		}
		return parseInt(result) + UNITS[scale];
	}
	//add additional javascript source in page
	function contentEval( source ) {
		var script = document.createElement('script');
		script.setAttribute("type", "application/javascript");
		script.textContent = source;
		document.body.appendChild(script);
	}
});
console.log('test');
