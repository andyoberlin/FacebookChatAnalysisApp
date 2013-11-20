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
	    bootstrap: ['jquery']
	},
	paths: {
		facebook : '//connect.facebook.net/en_US/all',
		jquery : '/static/js/lib/jquery-1.10.2.min',
		underscore : '/static/js/lib/underscore.min',
		bootstrap: '/static/js/lib/bootstrap.min'
	}
})

var dependencies = [
	'jquery', 'facebookLogin', 'lib/util', 'conversations/ConversationSDK',
	'conversations/ConversationView', 'analytics/AnalyticsTester'
];

require(dependencies, function($, LoginSDK, Util, ConversationSDK, ConversationView, AnalyticsTester) {
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
				});
			});
			
			// trigger first retrieval of conversations
			convoSDK.next();
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