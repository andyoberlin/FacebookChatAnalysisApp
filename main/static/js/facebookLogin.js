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
		
		var self = this;
		
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token 
				// and signed request each expire
				var uid = response.authResponse.userID;
				var accessToken = response.authResponse.accessToken;
				self.success();
			}
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