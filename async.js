/*
 * idea came from async : https://github.com/caolan/async
 */
var async = (new function(){
	this.series = (function(){
		var results = {};
		var callback = (function(){
			var index = 0;
			return function(){
			};
		})();
		var series = function(tasks,callback){
		}
	})();
	this.parallel;
});
