require.config({
	shim: {
		facebook : {
			exports : 'FB'
		},
		jquery: {
	        init: function() {
	            return $; 
	        }
	    },
	    bootstrap: ['jquery'],
	    jquery_indexeddb: ['jquery'],
	    underscore : {
	    	exports : '_'
	    },
	    jChartFXSys: {
	    	init: function() {
	    		return sfx;
	    	}
	    },
	    jChartFXVector: ['jChartFXSys'],
	    jChartFXAnimation: ['jChartFXVector'],
	    jChartFX: {
	    	deps: ['jChartFXAnimation'],
	    	init: function() {
	    		return cfx;
	    	}
	    }
	},
	paths: {
		facebook: '//connect.facebook.net/en_US/all',
		jquery: '/static/js/lib/jquery-1.10.2.min',
		jquery_indexeddb: '/static/js/lib/jquery.indexeddb',
		underscore: '/static/js/lib/underscore.min',
		bootstrap: '/static/js/lib/bootstrap.min',
		jChartFXSys: '/static/js/lib/jChartFX/jchartfx.system',
		jChartFXVector: '/static/js/lib/jChartFX/jchartfx.coreVector',
		jChartFXAnimation: '/static/js/lib/jChartFX/jchartfx.animation',
		jChartFX: '/static/js/lib/jChartFX/jchartfx.advanced',
		async : '/static/js/lib/async',
        goog : '/static/js/lib/goog',
        propertyParser : '/static/js/lib/propertyParser'
	}
})

var dependencies = [
	'jquery', 'facebookLogin', 'lib/util', 'conversations/ConversationSDK',
	'conversations/ConversationView', 'database/MessagesSDK', 
	'analytics/AnalyticsPlatform'//, 'analytics/AnalyticsTester'
];

require(dependencies, function($, LoginSDK, Util, ConversationSDK, ConversationView, MessagesSDK, AnalyticsPlatform) {
	// Sets up the Facebook Login for this app with the proper permissions
	// and switches between the main application and the login prompt to
	// start
	var loginPanel = $('#loginPrompt');
	var appHub = $('#appHub');
	
	var loginSDK = LoginSDK.createInstance({
		success: function(userID) {
			loginPanel.hide();
			appHub.removeClass('hidden').fadeIn();
			
			// in here FB will be logged in
			var convoSDK = ConversationSDK.createInstance();
			var convosPanel = appHub.find('#conversations');
			
			// when the SDK next function is called we will render the conversations
			// using a ConversationView
			var nextButton = ConversationView.nextButton().on('click', function() {
				convoSDK.next();
			});
			
			$(convoSDK).on('convos.next', function(e) {
				var convoEls = ConversationView.render(e.convos, userID);
				convosPanel.append(convoEls);
				convosPanel.append(nextButton);
				convoEls.on('click', function() {
					// check to see if they are aligned vertically and scroll if so
					var analyticsTop = appHub.find('#analytics').parent().parent().offset().top;
					var convosTop = convosPanel.parent().parent().offset().top;
					if (analyticsTop > convosTop) {
						$(document).scrollTop(analyticsTop);
					}
					convosPanel.find('.conversation.selected').removeClass('selected');
					$(this).addClass('selected');
					var holder = $('.analyzeBtnContainer');
					holder.find('#analyzeBtn').removeAttr('disabled');
					holder.find('#cancelBtn').removeAttr('disabled');
				});
			});
			
			// trigger first retrieval of conversations
			convoSDK.next();
			
			// setup the analytics platform
			$('#analytics').append(AnalyticsPlatform.renderMenu());
			
			// setup the analysis runner
			$('#analyzeBtn').on('click', function() {
				$('#appDescriptionContainer').hide();
				$('#conversationProgressBarContainer').removeClass('hidden').show();
				var progressBar = $('#conversationProgressBar');
				var loadingMsg = $('#currentLoadingState');
				// download new messages for the conversation using the MessagesSDK
				// get all the analytics that have chosen to run
				var ids = [];
				$('#analytics').children('.analytic.selected').each(function() {
					ids.push($(this).data('analyticid'));
				});
				
				// get the conversation ID
				var msgSDK = MessagesSDK.createInstance(convosPanel.find('.conversation.selected').data('convoid'));
				progressBar.parent().addClass("active");
				
				$(msgSDK).on('sdk.update', function() {
					if (msgSDK.state.totalMessages) {
						var value = 100 * msgSDK.state.completeMessages / msgSDK.state.totalMessages;
						progressBar.css('width', "" + value + "%").attr('aria-valuenow', value);
						loadingMsg.text(msgSDK.state.message + " " + msgSDK.state.completeMessages + " / " + msgSDK.state.totalMessages);
					}
				});
				
				$(msgSDK).on('sdk.complete', function() {
					progressBar.css('width', "100%").attr('aria-valuenow', 100);
					loadingMsg.text(msgSDK.state.message);
					progressBar.parent().removeClass("active");
					
					AnalyticsPlatform.renderResults(msgSDK, ids, $('#analyticsPanel').empty());
				});
				
				$(msgSDK).on('sdk.error', function() {
					loadingMsg.text("You have too many messages in this conversation. Wait a small amount of time and " + 
						" the program will pick up where it left off when you click Analyze again");
					progressBar.parent().removeClass("active");
				});
				
				msgSDK.update();
			});
			
			$('#cancelBtn').on('click', function() {
				$('#appDescriptionContainer').show();
				$('#conversationProgressBarContainer').hide();
			});
		},
		error: function() {
			if (loginPanel.hasClass('hidden')) {
				loginPanel.removeClass('hidden').fadeIn();
				appHub.hide();
			}
		}
	});
	
	loginPanel.find('.facebookLoginButton').on('click', Util.scopeCallback(loginSDK, loginSDK.login));
});