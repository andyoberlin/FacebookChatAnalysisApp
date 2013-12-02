define(['jquery', 'jChartFX'], function($, jChartFX) {
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
				var card = $('<div />').height(300);
				
				var chart = new jChartFX.Chart();
	            chart.getData().setSeries(1);
	            
	            var series = chart.getSeries().getItem(0);
	            series.setGallery(jChartFX.Gallery.Bar);
	            
	            chart.getAxisX().getTitle().setText("Conversation Member");
	            chart.getAxisY().getTitle().setText("Sticker to Message Ratio (%)");
	            chart.getAxisY().getLabelsFormat().setFormat(jChartFX.AxisFormat.Percentage);
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