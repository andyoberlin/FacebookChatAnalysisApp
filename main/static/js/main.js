require.config({
	map: {
	    '*': {
	      'persistence': 'lib/persistence/persistence-adapter'
	    },
	    'persistence_store_sql': {
	      'persistence': 'persistence'
	    },
	    'persistence_store_web_sql': {
	      'persistence': 'persistence'
	    }
	},
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
	    persistence: {
	    	exports : 'persistence'
	    },
	    persistence_store_sql: ['persistence'],
	    persistence_store_web_sql: ['persistence', 'persistence_store_sql']
	},
	paths: {
		facebook: '//connect.facebook.net/en_US/all',
		jquery: '/static/js/lib/jquery-1.10.2.min',
		underscore: '/static/js/lib/underscore.min',
		bootstrap: '/static/js/lib/bootstrap.min',
		persistence: '/static/js/lib/persistence/persistence',
		persistence_store_sql: '/static/js/lib/persistence/persistence.store.sql',
		persistence_store_web_sql: '/static/js/lib/persistence/persistence.store.websql'
	}
})

var dependencies = [
	'jquery', 'facebookLogin', 'lib/util', 'conversations/ConversationSDK',
	'conversations/ConversationView', 'database/MessagesSDK', 'analytics/AnalyticsTester'
];

require(dependencies, function($, LoginSDK, Util, ConversationSDK, ConversationView, MessagesSDK, AnalyticsTester) {
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
			
			// setup the analysis runner
			$('#analyzeBtn').on('click', function() {
				$('#appDescriptionContainer').hide();
				$('#conversationProgressBarContainer').removeClass('hidden').show();
				
				// download new messages for the conversation using the MessagesSDK
				var msgSDK = MessagesSDK.createInstance(0);
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
	
	AnalyticsTester.run();
});