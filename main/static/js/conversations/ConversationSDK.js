define(['facebook', 'jquery'], function(FB, $) {
	
	/**
	 * Object for tracking progress in downloading the conversations of
	 * a user.
	 */
	function ConversationSDK() {
		this.nextURL = '/me/inbox';
		this.useAjax = false;
	}
	
	/**
	 * Gets the next set of conversations in the list. Either uses a tracked
	 * pagination system or an original FB API call. Requires that the FB.init
	 * has already completed.
	 */
	ConversationSDK.prototype.next = function() {
		var self = this;
		
		if (self.useAjax) {
			// we are already paginating data at this point
			// so we can use pure ajax calls
			$.ajax({
				url: self.nextURL,
				dataType: 'json',
				success: function(response) {
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
				self.nextURL = response.paging.next;
				self.useAjax = true;
				
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
