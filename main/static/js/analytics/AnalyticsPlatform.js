var deps = ['jquery', 'underscore'];

define(deps, function($, _) {
	var analytics = [];
	
	var AnalyticsPlatform = {
		register: function(analytic) {
			analytics.push(analytic);
		},
		run: function(ids) {
			var renderedAnalytics = $();
			
			$.each(ids, function(index, id) {
				renderedAnalytics.add(analytics[id].render());
			});
			
			return renderedAnalytics;
		},
		render: function() {
			var analyticMenu = $();
			
			var AnalyticTemplate = _.template($('#analyticTemplate').html());
			
			$.each(analytics, function(index, analytic) {
				analyticMenu.add(AnalyticTemplate({
					id: index,
					name: analytic.name,
					shortDescription: analytic.shortDescription
				}));
			});
			
			return analyticMenu;
		}
	};
	
	// register Analytics here
	
	
	return AnalyticsPlatform;
});