define(['jquery', 'visualization/ColumnChart', 'jChartFX'], function($, ColumnChart, jChartFX) {
	var Analytic = {
		name: "Sticker to Message Ratio",
		shortDescription: "Calculates the ratio of stickers to total messages sent",	
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
				
				$.each(users, function(index, user) {
					var stickerOpts = {
						user: user,							
						stickers: 'only' 
					};
					
					var generalOpts = {
						user: user	
					};
					
					promises.push(
						$.Deferred(function(deferredObj) {
							return msgSDK.getMessages(stickerOpts).then(function(stickerMsgs) {
								list[user.name] = stickerMsgs.length;
							}).then(
								msgSDK.getMessages(generalOpts).then(function(messages) {
									list[user.name] = list[user.name]/messages.length;
									deferredObj.resolve();
								})
							).promise();
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
					title: 'Percentage of Messages that are Stickers',
					xLabel: 'Conversation Member',
					yLabel: 'Sticker to Message Ratio (%)',
					data: data
				});
				
	            chart.getAxisY().getLabelsFormat().setFormat(jChartFX.AxisFormat.Percentage);
	            
				$(card).on('card.rendered', function() {
					chart.create(card[0]);
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});