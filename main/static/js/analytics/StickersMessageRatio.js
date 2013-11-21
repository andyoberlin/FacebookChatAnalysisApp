define(['jquery', 'database/DatabaseUtil'], function($, DatabaseUtil) {
	var Analytic = {
		run: function(conversation, callback) {
			var dbUtil = DatabaseUtil.createInstance(conversation);
		
			$.when(dbUtil.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
				
				$.each(users, function(index, user) {
					var stickers;
					promises.push(dbUtil.getMessages({
						userID: user.uid,							
						stickers: 'only' 
					}).then(function(Smessages) {
						stickers= Smessages.length;
					}).then(dbUtil.getMessages(user).then(
						function(messages) {
							list[user.name] = stickers/messages.length;
					});
				});
				
				$.when.apply($, promises).then(function() {
					callback(list);
				});
		}
	};
	
	return Analytic;
});