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
	    underscore : {
	    	exports : '_'
	    },
	    bootstrap: ['jquery'],
	    jquery_indexeddb: ['jquery'],
	    persistence: {
	    	init: function() {
	    		return persistence;
	    	}
	    },
	    persistence_store_sql: {
	    	deps: ['persistence'],
	    	init: function() {
	    		return persistence;
	    	}
	    },
	    persistence_store_web_sql: {
	    	deps: ['persistence', 'persistence_store_sql'],
	    	init: function() {
	    		return persistence;
	    	}
	    },
	    persistence_store_memory_backup: {
	    	deps: ['persistence', 'persistence_store_web_sql'],
	    	init: function() {
	    		return persistence;
	    	}
	    }
	},
	paths: {
		facebook: '//connect.facebook.net/en_US/all',
		jquery: '/static/js/lib/jquery-1.10.2.min',
		jquery_indexeddb: '/static/js/lib/jquery.indexeddb',
		underscore: '/static/js/lib/underscore.min',
		bootstrap: '/static/js/lib/bootstrap.min',
		persistence: '/static/js/lib/persistence/persistence',
		persistence_store_sql: '/static/js/lib/persistence/persistence.store.sql',
		persistence_store_web_sql: '/static/js/lib/persistence/persistence.store.websql',
		persistence_store_memory_backup: '/static/js/lib/persistence/persistence.store.memory',
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
				
				$(msgSDK).on('sdk.update', function() {
					if (loadingMsg.text() != msgSDK.state.message) {
						loadingMsg.text(msgSDK.state.message);
					}
					if (msgSDK.state.totalMessages) {
						var value = 100 * (msgSDK.state.completeMessages + 0.0) / msgSDK.state.totalMessages;
						progressBar.css('width', "" + value + "%").attr('aria-valuenow', value);
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