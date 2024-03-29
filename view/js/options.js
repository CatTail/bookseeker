window.onload = function(){
	var sites = document.querySelectorAll('input[name=defaultSite]');
	var max = document.querySelector('input[name=maxNum]');
	//init input
	var storage = chrome.storage.local;
	storage.get(null,function(items){
		var tmp = document.querySelector('input[value='+items.defaultSite+']');
		tmp != undefined ? (tmp.checked = true) : (sites[0].checked=true);

		max.value = items.maxNum || 5;
	});
	
	document.querySelector('#save').onclick = function(){
		var defaultSite , maxNum;
		Array.prototype.forEach.call(sites,function(input){
			input.checked ? defaultSite = input.value : 0;
		})
		maxNum = max.value;
		storage.set({defaultSite:defaultSite,maxNum:maxNum},function(){
			alert('成功保存');
			storage.get(null,function(items){console.log(items);});
		});
	};

	//self definition page preview
	document.querySelector('#preview').onclick = function(){
		var windowref = window.open(document.querySelector('input[name=preview]').value);
		debugger;
	};

};
