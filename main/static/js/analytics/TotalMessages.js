define(['jquery', 'jChartFX'], function($, jChartFX) {
	var Analytic = {
		name: 'Total Messages',
		shortDescription: 'Calculates the total messages sent by each conversation member.',
		run: function(msgSDK, callback) {
			$.when(msgSDK.getUsers()).then(function(users) {
				var promises = [];
				var list = {};
		
				$.each(users, function(index, user) {
					promises.push(
						msgSDK.getMessages({ user : user }).then(
							function(messages) {
								list[user.name] = messages.length;
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
				
				var chart = new jChartFX.Chart();
	            chart.getData().setSeries(1);
	            
	            var series = chart.getSeries().getItem(0);
	            series.setGallery(jChartFX.Gallery.Bar);
	            
	            chart.getAxisX().getTitle().setText("Conversation Member");
	            chart.getAxisY().getTitle().setText("Total Messages Sent");
	            chart.getAllSeries().setMultipleColors(true);
	            chart.getLegendBox().setVisible(false);
	            chart.getAnimations().getLoad().setEnabled(true);
	            
	            var titles = chart.getTitles();
	            var title = new cfx.TitleDockable(); 
                title.setText("Total Messages Sent");
                titles.add(title);
	            
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