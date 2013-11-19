define(['jquery', 'underscore'], function($, _) {
	
	function getParticipants(people) {
		var str = [];
		$.each(people, function(index, person) {
			str.push(person.name);
		});
		return str.join(", ");
	}
	
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
				if (convo.comments && convo.to) {
					temp.add(ConversationTemplate({
						participants: getParticipants(convo.to.data),
						message: convo.comments.data[0].message
					}));
				}
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