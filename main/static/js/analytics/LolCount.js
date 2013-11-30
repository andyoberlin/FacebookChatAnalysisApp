define(['jquery', 'analytics/Util', 'visualization/ColumnChart'], function($, Util, ColumnChart) {
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
						msgSDK.getMessages({ user : user }).then(
							function(messages) {
								$.each(messages, function(index, messages) {
									var words = messages.split(/s+/);
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
				var card = $('<div />');
				
				ColumnChart.create(card, {
					data: data,
					xLabel: "Conversation Member",
					yLabel: "Number of Lol's",
					title: "Total Lol's per Person",
					width: 500
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});