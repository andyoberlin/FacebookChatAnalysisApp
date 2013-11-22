var deps = ['jquery', 'underscore', 'analytics/TotalMessages'];

define(deps, function($, _, TotalMessages) {
	var analytics = [];
	
	var AnalyticsPlatform = {
		register: function(analytic) {
			analytics.push(analytic);
		},
		renderResults: function(conversation, ids, parent) {
			$.each(ids, function(index, id) {
				analytics[id].render(conversation, function(card) {
					parent.append(card);
				});
			});
		},
		renderMenu: function() {
			var analyticMenu = $();
			
			var AnalyticTemplate = _.template($('#analyticTemplate').html());
			
			$.each(analytics, function(index, analytic) {
				var menuItem = AnalyticTemplate({
					id: index,
					name: analytic.name,
					shortDescription: analytic.shortDescription
				});
				
				analyticMenu = analyticMenu.add($(menuItem));
			});
			
			return analyticMenu;
		}
	};
	
	// register Analytics here
	AnalyticsPlatform.register(TotalMessages);
	
	return AnalyticsPlatform;
});