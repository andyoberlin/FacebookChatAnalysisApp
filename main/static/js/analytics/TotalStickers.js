define(['jquery', 'database/DatabaseUtil'], function($, DatabaseUtil) {
	var Analytic = {
		run: function(conversation, callback) {
			var dbUtil = DatabaseUtil.createInstance(conversation);
		
			$.when(dbUtil.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					promises.push(
						dbUtil.getMessages('person', {
							uid: user.uid,
							stickers: 'only' 
							}).then(
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