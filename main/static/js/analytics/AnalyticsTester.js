define(['jquery', 'analytics/AnalyticsTemplate'], function($, AnalyticsTemplate) {
	var analytics = {};
	
	var AnalyticsTester = {
		register: function(name, metric) {
			analytics[name] = metric;
		},
		run: function() {
			$.each(analytics, function(name, metric) {
				console.log("Running metric: " + name + "....");
				console.log(metric.run());
			});
		}
	};
	
	// register the analytics to run here
	AnalyticsTester.register('Testing', AnalyticsTemplate);
	
	return AnalyticsTester;
})