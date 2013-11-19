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

require(['jquery', 'facebookLogin', 'lib/util'], function($, LoginSDK, Util) {
	// Sets up the Facebook Login for this app with the proper permissions
	// and switches between the main application and the login prompt to
	// start
	var loginPanel = $('#loginPrompt');
	
	var appHub = $('#appHub');
	
	var loginSDK = LoginSDK.createInstance({
		success: function() {
			loginPanel.removeClass('show').hide();
			appHub.removeClass('hidden').fadeIn();
		},
		error: function() {
			alert("Fuck it didn't work.");
		}
	});
	
	loginPanel.find('.facebookLoginButton').on('click', Util.scopeCallback(loginSDK, loginSDK.login));
});