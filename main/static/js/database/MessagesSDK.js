define(['jquery', 'facebook', 'persistence_store_web_sql'], function($, FB, persistence) {
	
	function MessagesSDK(conversation) {
		this.conversation = conversation;
		this.initialized = false;
		this.state = {
			message: "Message database not initialized",
			updating: false,
			totalMessages: 0,
			completeMessages: 0
		};
	}
	
	/**
	 * Updates the database with the latest conversation information.
	 * 
	 * TODO: Have the SDK track the current state of the database to
	 * minimize amount needed to be downloaded.
	 */
	MessagesSDK.prototype.update = function() {
		this.initializeDatabase();
		
		var self = this;
		
		this.getLastMessage(
			function(lastMessage) {
				self.fetchNewMessages(lastMessage);
			},
			function() {
				self.fetchOldMessages();
			}
		);
	};
	
	MessagesSDK.prototype.fetchOldMessages = function(pagingURL) {
		var self = this;
		self.state.updating = true;
		self.state.message = "Loading previous messages...";
		
		if (pagingURL) {
			$.ajax({
				url: pagingURL,
				dataType: 'json',
				success: function(response) {
					if (response && response.data && response.data.length > 0) {
						if (self.state.totalMessages) {
							self.state.completeMessages += response.data.length;
						}
						
						$(self).trigger('sdk.update');
						
						self.storeMessages(response.data);
						self.fetchOldMessages(response.paging.next);
					}
					else {
						self.updating = false;
						self.state.message = "Completed downloading messages.";
					}
				},
				error: function() {
					console.log("There was an error trying to reach the server");
				}
			});
		}
		else {
			FB.api('/' + this.conversation + '/comments', function(response) {
				if (response && response.data) {
					// get the message count by analyzing the id of the most recent message
					var numMessages = parseInt(response.data[response.data.length - 1].id.split("_")[1]);
					
					if (!isNaN(numMessages)) {
						self.state.totalMessages = numMessages;
						self.state.completeMessages = response.data.length;
					}
					
					$(self).trigger('sdk.update');
					
					self.storeMessages(response.data);
					self.fetchOldMessages(response.paging.next);
				}
				else {
					self.state.updating = false;
					self.state.message = "Completed downloading messages.";
				}
			});
		}
	};
	
	MessagesSDK.prototype.fetchNewMessages = function(lastMessage) {
		var self = this;
		self.state.message = "Loading new messages...";
		self.state.updating = true;
		self.state.completedMessages = 0;
		self.state.totalMessages = 0;
		
		setTimeout(function() {
			self.state.message = "Completed message update.";
			self.state.updating = false;
			self.state.completedMessages = 1;
			self.state.totalMessages = 1;
		}, 1000);
	};
	
	MessagesSDK.prototype.getLastMessage = function(success, error) {
		error();
	};
	
	MessagesSDK.prototype.initializeDatabase = function() {
		if (!this.initialized) {
			//persistence.store.websql.config(persistence, 'conversation_' + this.conversation,
			//	'Stores the messages from Facebook for analysis purposes', 10 * 1024 * 1024);
			
			this.initialized = true;
		}
	};
	
	MessagesSDK.prototype.storeMessages = function(messages) {
		if (this.initialized) {
			console.log(messages);
		}
		else {
			console.log("Trying to store messages before database initialization.");
		}
	};
	
	var MessagesSDKFactory = {
		/**
		 * Creates a new connection to the database for messages
		 * given the conversationID.
		 * 
		 * @param conversation: The id of the conversation for which this
		 * database utility will be making queries.
		 */
		createInstance: function(conversation) {
			return new MessagesSDK(conversation);
		}
	};
	
	return MessagesSDKFactory;
});