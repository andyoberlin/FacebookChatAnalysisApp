define(['jquery', 'visualization/ColumnChart'], function($, ColumnChart) {
	var Analytic = {
		name: 'Total Messages',
		shortDescription: 'Calculates the total messages sent by each conversation member.',
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					promises.push(
						msgSDK.getMessages({ user : user }).then(
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
		render: function(msgSDK, callback) {
			Analytic.run(msgSDK, function(data) {
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