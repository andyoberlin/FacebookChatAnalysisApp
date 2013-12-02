define(['jquery', 'analytics/Util', 'jChartFX'], function($, Util, jChartFX) {
	var isLol = function(word) {
		if (word.length < 3) {
            return false;
		}
        
		word = word.toLowerCase();
        var missingLO = Util.stringToSet(word);
        delete missingLO['l'];
        delete missingLO['o'];
        var empty = $.isEmptyObject(missingLO);
        if (empty) {
            return true;
        }
        else {
        	var lSet = Util.stringToSet(word.slice(0, -1));
        	delete lSet['l'];
        	delete lSet['o'];
            return word[word.length - 1] == 'z' && $.isEmptyObject(lSet.length);
        }
	};
	
	var Analytic = {
		name: 'Lol Count',
		shortDescription: 'Calculates the number of lol\'s you use in a conversation.',
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
										if (isLol(Util.stripPunctuation(word))) {
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
	            chart.getAxisY().getTitle().setText("Total Lol's Sent");
	            chart.getAllSeries().setMultipleColors(true);
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
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});