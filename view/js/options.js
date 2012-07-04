window.onload = function(){
	document.querySelector('#save').onclick = function(){
		Array.prototype.forEach.call(document.querySelectorAll('input[name=defaultSite]'),function(input){
			input.checked ? defaultSite = input.value : 0;
		})
		var maxNum = document.querySelector('input[name=maxNum]').value;
		var storage = chrome.storage.sync;
		storage.set({defaultSite:defaultSite,maxNum:maxNum},function(){
			alert('saved');
			console.log(storage.get(null,function(items){console.log(items);}));
		});
	};
};
