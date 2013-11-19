define(['jquery', 'underscore'], function($, _) {
	
	var ConversationView = {
		/**
		 * Renders a list of conversations from the Conversations SDK using
		 * a template with underscore.
		 * 
		 * @param convos The set of conversations to render
		 */
		render: function(convos) {
			
			var str = [];
			$.each(convos, function(index, val) {
				str.push(val.id);
			})
			return $('<div />').text(str.join());
		},
		/**
		 * Returns a correctly rendered button to be used for indicating a
		 * user's intent to move to the next set of conversations.
		 */
		nextButton: function() {
			return $('<button />').text('Button');
		}
	};
	
	return ConversationView;
});