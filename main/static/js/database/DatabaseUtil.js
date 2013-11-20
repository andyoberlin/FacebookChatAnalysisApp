define([], function() {
	
	function DatabaseUtil(conversation) {
		this.conversation = conversation;
	}
	
	/**
	 * Gets messages from the database with the given filter type
	 * and the object to filter.
	 * 
	 * @param filter: The type of filter to use. Should be one of the
	 * following: "time", "person", "person.time", null
	 * @param arg1: The first argument of the search. If the type is:
	 * 		"time"        : TimeRange,
	 * 		"person"      : Person ID or Name,
	 * 		"person.time" : Person ID or Name,
	 * 		null          : Ignored
	 * @param arg2: The second argument of the search. If the type is:
	 * 		"time"        : Ignored,
	 * 		"person"      : Ignored,
	 * 		"person.time" : TimeRange,
	 * 		null          : Ignored
	 */
	DatabaseUtil.prototype.getMessages = function(filter, arg1, arg2) {
		
	};
	
	/**
	 * Given a messages this will find the next n messages temporally.
	 * 
	 * @param msg: The original message
	 * @param n: The number of messages to get after the original message
	 */
	DatabaseUtil.prototype.getNextMessages = function(msg, n) {
		
	};
	
	var DatabaseUtilFactory = {
		/**
		 * Creates a new connection to the database for messages
		 * given the conversationID.
		 * 
		 * @param conversation: The id of the conversation for which this
		 * database utility will be making queries.
		 */
		createInstance: function(conversation) {
			return new DatabaseUtil(conversation);
		}
	};
	
	return DatabaseUtilFactory;
});