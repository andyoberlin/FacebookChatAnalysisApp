define(['jquery'], function($) {
	var Util = {
		stringToSet : function(str) {
			var set = {};
			for (var i = 0; i < str.length; i++) {
				if (! (str[i] in set)) {
					set[str[i]] = 0;
				}
				
				set[str[i]]++;
			};
			
			return set;
		},
		stripPunctuation : function(str) {
			return str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		}
	};
	
	return Util;
});