define(['jquery', 'database/MessagesSDK', 'visualization/ColumnChart'], function($, MessagesSDK, ColumnChart) {
	var Analytic = {
		name: 'Total Messages',
		shortDescription: 'Calculates the total messages sent by each conversation member.',
		run: function(conversation, callback) {
			var dbUtil = MessagesSDK.createInstance(conversation);
		
			$.when(dbUtil.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					promises.push(
						dbUtil.getMessages(user).then(
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
		},
		render: function(callback) {
			Analytic.run(function(data) {
				var card = $('<div />');
				
				ColumnChart.create(card, {
					data: data,
					xLabel: "Conversation Member",
					yLabel: "Total Messages Sent",
					title: "Total Messages Sent per Person"
				});
				
				callback(card);
			});
		}
	};
	
	return Analytic;
});