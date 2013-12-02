define(['jquery', 'analytics/Util', 'visualization/ColumnChart'], function($, Util, ColumnChart) {
	var isHaha = function(word) {
		var hSet = Util.stringToSet(word.toLowerCase());
		delete hSet['h'];
		delete hSet['a'];
		return word.length > 1 && word.indexOf('ha') != -1 && $.isEmptyObject(hSet);
	};
	
	var Analytic = {
		name: 'Haha Count',
		shortDescription: 'Calculates the number of haha\'s you use in a conversation.',
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					list[user.name] = 0;
					promises.push(
						msgSDK.getMessages({ user : user, stickers: 'without' }).then(
							function(messages) {
								$.each(messages, function(index, message) {
									var words = message.message.split(/\s+/);
									$.each(words, function(index, word) {
										if (isHaha(Util.stripPunctuation(word))) {
											list[user.name]++;
										}
									});
								});
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
					title: 'Haha\'s Sent',
					xLabel: 'Conversation Member',
					yLabel: 'Total Haha\'s Sent',
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