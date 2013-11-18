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
		jquery : 'js/lib/jquery-1.10.2.min',
		underscore : 'js/lib/underscore.min',
		bootstrap: 'js/lib/bootstrap.min'
	}
})

require(['jquery'], function($) {
	$('#loginPrompt').removeClass('show').fadeOut();
	$('#appHub').removeClass('hidden').fadeIn();
});