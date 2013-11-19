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
	'conversations/ConversationView'
];

require(dependencies, function($, LoginSDK, Util) {
	// Sets up the Facebook Login for this app with the proper permissions
	// and switches between the main application and the login prompt to
	// start
	var loginPanel = $('#loginPrompt');
	
	var appHub = $('#appHub');
	
	var loginSDK = LoginSDK.createInstance({
		success: function() {
			loginPanel.hide();
			appHub.removeClass('hidden').fadeIn();
			
			// in here FB will be logged in
			var convoSDK = ConversationSDK.createInstance();
			var convos = appHub.find('#conversations');
			var nextButton = ConversationView.nextButton().on('click', function() {
				convos.append(ConversationView.render(convoSDK.next()));
				if (convoSDK.hasNext()) {
					convos.append($(this));
				}
				else {
					$(this).remove();
				}
			});
			convos.append(ConversationView.render(convoSDK.next()));
			convos.append(nextButton);
			
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