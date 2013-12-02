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
				var card = $('<div />').height(350);
				
				var chart = ColumnChart.create({
					title: 'Total Messages Sent',
					xLabel: 'Conversation Member',
					yLabel: 'Total Messages Sent',
					data: data
				});
				
				$(card).on('card.rendered', function() {
					chart.create(card[0]);
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});