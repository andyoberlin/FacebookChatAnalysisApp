define([], function() {
	var Util = {};

	Util.scopeCallback = function(scope, fn) {
		return function() {
			fn.apply(scope, arguments);
		};
	};

	return Util;
});