define(['jquery', 'underscore'], function($, _) {
	
	var ConversationView = {
		/**
		 * Renders a list of conversations from the Conversations SDK using
		 * a template with underscore.
		 * 
		 * @param convos The set of conversations to render
		 */
		render: function(convos) {
			var ConversationTemplate = _.template($('#conversationTemplate').html());
			
			var temp = $();
			
			$.each(convos, function(index, convo) {
				temp.add(ConversationTemplate(convo));
			});
			
			return temp;
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