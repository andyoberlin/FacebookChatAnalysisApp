define(['jquery', 'database/DatabaseUtil'], function($, DatabaseUtil) {
	var Analytic = {
		run: function(callback) {
			DatabaseUtil.getUsers(function(users) {
				var deferred = $.Deferred();
			
				var list = {};
			
				$.each(users, function(index, user) {
					deferred = deferred.when(
						DatabaseUtil.getMessages('person', x, function(messages) {
							list[user.name] = messages.length;
						});
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