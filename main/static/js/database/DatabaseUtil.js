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
	DatabaseUtil.prototype.getMessages = function(filter, opts) {
		return $.Deferred(function(deferred_obj) {
			deferred_obj.resolve([
				{
					message: 'This is a message',
					from: {
						uid: '98128163723',
						name: 'Test user 1'
					},
					time: 'TestDate'
				},
				{
					message: 'This is a message 2',
					from: {
						uid: '73287328764',
						name: 'Test user 2'
					},
					time: 'TestDate2'
				}
			]);
		}).promise();
	};
	
	DatabaseUtil.prototype.getUsers = function() {
		return $.Deferred(function(deferred_obj) {
			deferred_obj.resolve([
				{
					uid: '98128163723',
					name: 'Test user 1'
				},
				{
					uid: '73287328764',
					name: 'Test user 2'
				}
			]);
		}).promise();
	};
	
	/**
	 * Given a messages this will find the next n messages temporally.
	 * 
	 * @param msg: The original message
	 * @param n: The number of messages to get after the original message
	 */
	DatabaseUtil.prototype.getNextMessages = function(msg, n, callback) {
		
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