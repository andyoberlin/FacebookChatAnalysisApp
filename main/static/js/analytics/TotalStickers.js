define(['jquery', 'jChartFX'], function($, jChartFX) {
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