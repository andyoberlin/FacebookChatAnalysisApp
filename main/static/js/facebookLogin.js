define(['facebook'], function(FB) {
	
	function LoginSDK(success, error) {
		this.success = success;
		this.error = error;
		FB.init({
		    appId: '219252401586622',
		    channelUrl: 'http://localhost:8000/static/js/facebook/channel.html',
		    status: true, // check login status
		    cookie: true, // enable cookies to allow the server to access the session
		    xfbml: true  // parse XFBML
		});
	}
	
	LoginSDK.prototype.login = function() {
		var self = this;
		FB.login(function(response) {
		    if (response.authResponse) {
		        // The person logged into your app
		    	self.success();
		    }
		    else {
		        // The person cancelled the login dialog
		    	self.error();
		    }
		}, {scope: 'user_friends,read_mailbox', display: 'touch'});
	};
	
	var LoginSDKFactory = {
		createInstance: function(opts) {
			return new LoginSDK(opts.success, opts.error);
		}	
	};
	
	return LoginSDKFactory;
  
});