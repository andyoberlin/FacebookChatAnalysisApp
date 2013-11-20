define(['jquery'], function($) {
	var analytics = {};
	
	var AnalyticsTester = {
		register: function(name, metric) {
			analytics[name] = metric;
		},
		run: function() {
			$.each(anlytics, function(name, metric) {
				console.log("Running metric: " + name + "....");
				console.log(metric.run());
			});
		}
	};
	
	// register the analytics to run here
	
	return AnalyticsTester;
})