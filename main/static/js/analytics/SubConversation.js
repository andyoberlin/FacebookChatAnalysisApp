define(['jquery'], function($) {
	var Analytic = {
		name: 'Sub Conversation Timeline',
		shortDescription: 'Uses statistics to try to find sub conversations and subsequently runs metrics on those.',
		run: function(msgSDK, callback) {
			var opts = {
				time: {
					order: 'ascending',
					range: 'all'
				}
			};
			
			$.when(msgSDK.getMessages(opts)).then(function(messages) {
				var data = {};
				
				var curMsg = messages[0];
				messages.shift();
				
				$.each(messages, function(index, msg) {
					var responseTime = msg.time - curTime;
					
					curMsg = msg;
				});
				
				callback(data);
			});	
		},
		render: function(msgSDK, callback) {
			Analytic.run(msgSDK, function(data) {
				var card = $('<div />');
				
				ColumnChart.create(card, {
					data: data,
					xLabel: "Conversation Member",
					yLabel: "Total Messages Sent",
					title: "Total Messages Sent per Person",
					width: 500
				});
				
				callback(card, 2); // 2 means that this will take up half of the given space
			});
		}
	};
	
	return Analytic;
});