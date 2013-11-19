define(['FB'], function(FB) {
	
	/**
	 * Object for tracking progress in downloading the conversations of
	 * a user.
	 */
	function ConversationSDK() {
		this.nextURL = '/inbox';
		this.useAjax = false;
	}
	
	/**
	 * Gets the next set of conversations in the list. Either uses a tracked
	 * pagination system or an original FB API call. Requires that the FB.init
	 * has already completed.
	 */
	ConversationSDK.prototype.next() {
		if (this.useAjax) {
			// we are already paginating data at this point
			// so we can use pure ajax calls
		}
		else {
			// we have not made our initial call to the Facebook API to get the
			// conversations yet
		}
	};
	
	var ConversationSDKFactory = {
		createInstance: function() {
			return new ConversationSDK();
		}
	};
	
	return ConversationSDKFactory;
});
