define(['jquery', 'visualization/ColumnChart'], function($, ColumnChart) {
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
						msgSDK.getMessages(stickerOpts).then(function(stickerMsgs) {
							list[user.name] = stickerMsgs.length;
						}).then(
							msgSDK.getMessages(generalOpts).then(function(messages) {
								list[user.name] = 100 * list[user.name]/messages.length;
							})
						).promise()
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
					yLabel: "Sticker to Message Ratio (%)",
					title: "Sticker to Message Ratio per Person",
					width: 500
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});