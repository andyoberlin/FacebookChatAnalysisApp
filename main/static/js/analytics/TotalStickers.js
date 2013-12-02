define(['jquery', 'visualization/ColumnChart'], function($, ColumnChart) {
	var Analytic = {
		name: "Total Stickers",
		shortDescription: "Calculates the total stickers sent by each conversation member.",
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					var opts = {
						user: user,
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
				var card = $('<div />').height(350);
				
				var chart = ColumnChart.create({
					title: 'Total Stickers Sent',
					xLabel: 'Conversation Member',
					yLabel: 'Total Stickers Sent',
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