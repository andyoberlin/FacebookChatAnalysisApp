define(['jquery'], function($) {
	var Util = {
		stringToSet : function(str) {
			var set = {};
			$.each(str, function(index, c) {
				if (! (c in set)) {
					set[c] = 0;
				}
				
				set[c]++;
			});
			
			return set;
		},
		stripPunctuation : function(str) {
			return str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		}
	};
	
	return Util;
});