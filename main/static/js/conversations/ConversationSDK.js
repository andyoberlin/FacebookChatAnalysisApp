define(['facebook', 'jquery'], function(FB, $) {
	
	/**
	 * Object for tracking progress in downloading the conversations of
	 * a user.
	 */
	function ConversationSDK() {
		this.nextURL = '/me/inbox';
		this.accessToken = null;
	}
	
	/**
	 * Gets the next set of conversations in the list. Either uses a tracked
	 * pagination system or an original FB API call. Requires that the FB.init
	 * has already completed.
	 */
	ConversationSDK.prototype.next = function() {
		var self = this;
		
		if (self.accessToken) {
			// we are already paginating data at this point
			// so we can use pure ajax calls
			$.ajax({
				url: self.nextURL,
				dataType: 'json',
				data: {
					access_token: self.accessToken
				},
				success: function(response) {
					self.accessToken = response.session.access_token;
					self.nextURL = response.paging.next;
					
					$(self).trigger({
						type: "convos.next",
						convos: response.data
					});
				}
			});
		}
		else {
			// we have not made our initial call to the Facebook API to get the
			// conversations yet
			FB.api(self.nextURL, function(response) {
				self.accessToken = response.session.access_token;
				self.nextURL = response.paging.next;
				
				$(self).trigger({
					type: "convos.next",
					convos: response.data
				});
			});
		}
	};
	
	var ConversationSDKFactory = {
		createInstance: function() {
			return new ConversationSDK();
		}
	};
	
	return ConversationSDKFactory;
});
