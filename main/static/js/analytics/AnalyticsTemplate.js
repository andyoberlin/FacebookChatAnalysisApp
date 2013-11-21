define(['jquery', 'database/DatabaseUtil'], function($, DatabaseUtil) {
	var Analytic = {
		run: function(callback) {
			$.when(DatabaseUtil.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					promises.push(
						DatabaseUtil.getMessages('person', x).then(
							function(messages) {
								list[user.name] = messages.length;
							}
						)
					); 
				});
				
				$.when.apply($, promises).then(function() {
					callback(list);
				});
			});	
		}
	};
	
	return Analytic;
});