define(['jquery', 'database/DatabaseUtil'], function($, DatabaseUtil) {
	var Analytic = {
		run: function(callback) {
			DatabasUtil.getUsers(function(users) {
				var deferred = $.deferredObject();
			
				var list = {};
			
				$.each(users, function(index, user) {
					deferred.when(
						DatabaseUtil.getMessages('person', x, function(messages) {
							list[user.name] = messages.length;
						})
					); 
				}
				
				deferred.then(function() {
					callback(list);
				});
			});	
		}
	};
	
	return Analytic;
});