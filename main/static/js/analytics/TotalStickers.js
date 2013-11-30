define(['jquery', 'visualization/ColumnChart'], function($, DatabaseUtil) {
	var Analytic = {
		name: "Total Stickers",
		shortDescription: "Calculates the total stickers sent by each conversation member.",
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					var opts = {
						userID: user.uid,
						stickers: 'only' 
					};
					promises.push(
						msgSDK.getMessages(opts).then(function(messages) {
							list[user.name] = messages.length;
						})
					); 
				});
				
				$.when.apply($, promises).then(function() {
					callback(list);
				});
			});	
		},
		render: function(msgSDK, callback) {
			Analytic.run(msgSDK, function(data) {
				var card = $('<div />');
				
				ColumnChart.create(card, {
					data: data,
					xLabel: "Conversation Member",
					yLabel: "Total Stickers Sent",
					title: "Total Stickers Sent per Person",
					width: 500
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});