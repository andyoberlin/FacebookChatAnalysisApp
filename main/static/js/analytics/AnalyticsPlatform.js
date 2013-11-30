var deps = [
    'jquery', 'underscore', 'analytics/TotalMessages', 'analytics/TotalStickers',
    'analytics/StickersMessageRatio', 'analytics/LolCount'
];

define(deps, function($, _, TotalMessages, TotalStickers, StickersMessageRatio, LolCount) {
	var analytics = [];
	
	var AnalyticsPlatform = {
		register: function(analytic) {
			analytics.push(analytic);
		},
		renderResults: function(msgSDK, ids, parent) {
			var CardTemplate = _.template($('#cardTemplate').html());
			
			var promises = [];
			var els = {};
			
			$.each(ids, function(index, id) {
				promises.push($.Deferred(function(deferredObj) {
					analytics[id].render(msgSDK, function(card, perRow) {
						if (!(perRow in els)) {
							els[perRow] = [];
						}
						els[perRow].push(card);
						deferredObj.resolve();
					});
				}).promise());
			});
				
			$.when.apply($, promises).then(function() {
				var keys = Object.keys(els);
				keys.sort();
				
				$.each(keys, function(index, key) {
					var elsByKey = els[key];
					
					var i = 0;
					while (i < elsByKey.length) {
						var curPanel = $('<div />').addClass('row');
						
						for (var j = 0; j < key && i < elsByKey.length; j++) {
							var card = CardTemplate({
								el: elsByKey[i].html(),
								layout: 'col-sm-' + (12.0/key)
							});
							curPanel.append($(card));
							i++;
						}
						
						parent.append(curPanel);
					}
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
	AnalyticsPlatform.register(TotalStickers);
	AnalyticsPlatform.register(StickersMessageRatio);
	AnalyticsPlatform.register(LolCount);
	
	return AnalyticsPlatform;
});