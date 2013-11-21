var deps=['jquery', 'analytics/TotalMessages', 'analytics/TotalStickers'];


define(deps, function($, TotalMessages, TotalStickers) {
	var analytics = {};
	
	var AnalyticsTester = {
		register: function(name, metric) {
			analytics[name] = metric;
		},
		run: function(conversation) {
			$.each(analytics, function(name, metric) {
				metric.run(conversation, function(result) {
					console.log("Running metric: " + name + "....");
					console.log(result);
				});
			});
		}
	};
	
	// register the analytics to run here
	AnalyticsTester.register('Testing', TotalMessages);
	AnalyticsTester.register('Testing1', TotalStickers);
	
	return AnalyticsTester;
})