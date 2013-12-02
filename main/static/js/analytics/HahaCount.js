define(['jquery', 'analytics/Util', 'jChartFX'], function($, Util, jChartFX) {
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
				var card = $('<div />').height(300);
				
				var chart = new jChartFX.Chart();
	            chart.getData().setSeries(1);
	            
	            var series = chart.getSeries().getItem(0);
	            series.setGallery(jChartFX.Gallery.Bar);
	            
	            chart.getAxisX().getTitle().setText("Conversation Member");
	            chart.getAxisX().setLabelAngle(20);
	            chart.getAxisY().getTitle().setText("Total Stickers Sent");
	            chart.getAllSeries().setMultipleColors(true);
	            chart.getLegendBox().setVisible(false);
	            chart.getAnimations().getLoad().setEnabled(true);
	            
	            var cData = [];
	            $.each(data, function(name, val) {
	            	cData.push({
	            		"Name" : name,
	            		"Value": val
	            	});
	            });
	            
	            chart.setDataSource(cData);
				$(card).on('card.rendered', function() {
					chart.create(card[0]);
				});
				
				callback(card, 3); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});