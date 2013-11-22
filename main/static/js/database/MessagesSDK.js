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
						self.state.updating = false;
						self.state.message = "Completed downloading messages.";
						$(self).trigger('sdk.complete');
					}
				},
				error: function() {
					console.log("There was an error trying to reach the server");
					$(self).trigger('sdk.error');
				}
			});
		}
		else {
			FB.api('/fql', { q: 'SELECT message FROM thread WHERE thread_id = ' + self.conversation }, function(response) {
				if (response && response.data && response.data.lemgth > 0) {
					self.state.totalMessages = response.data[0].message_count;
				}
				
				FB.api('/' + self.conversation + '/comments', function(response) {
					if (response && response.data) {
						// get the message count by analyzing the id of the most recent message
						if (!self.state.totalMessages) {
							var numMessages = parseInt(response.data[response.data.length - 1].id.split("_")[1]);
							
							if (!isNaN(numMessages)) {
								self.state.totalMessages = numMessages;
							}
						}
						
						self.state.completeMessages = response.data.length;
						
						$(self).trigger('sdk.update');
						
						self.storeMessages(response.data);
						self.fetchOldMessages(response.paging.next);
					}
					else {
						self.state.updating = false;
						self.state.message = "Completed downloading messages.";
						$(self).trigger('sdk.complete');
					}
				});
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
			persistence.store.websql.config(persistence, 'conversation_' + this.conversation,
				'Stores the messages from Facebook for analysis purposes', 10 * 1024 * 1024);
			
			this.MessageModel = persistence.define('Message', {
				uid: "TEXT",
				message: "TEXT",
				time: "DATE"
			});
			
			this.FriendModel = persistence.define('Friend', {
				uid: "TEXT",
				name: "TEXT"
			});
			
			this.MessageModel.hasOne('from', this.FriendModel);
			
			persistence.schemaSync();
			
			this.initialized = true;
		}
	};
	
	MessagesSDK.prototype.storeMessages = function(messages) {
		console.log("Storing messages...");
		
		var self = this;
		
		self.initializeDatabase();
		
		$.each(messages, function(index, message) {
			self.FriendModel.findBy('uid', message.from.id, function(friend) {
				if (!friend) {
					friend = new self.FriendModel({
						uid: message.from.id,
						name: message.from.name
					});
					
					persistence.add(friend);
				}
				
				var msg = new self.MessageModel({
					uid: message.id,
					message: message.message ? message.message : "NULL",
					from: friend,
					time: Date.parse(message.created_time)
				});
				
				persistence.add(msg);
			});
		});
		
		console.log("Finished storing messages.");
	};
	
	/**
	 * Gets messages from the database with the given filter type
	 * and the object to filter.
	 * 
	 * @param opts: The options to get the messages desired with the
	 * following possible properties:
	 * 		userID: The uid of the user whose messages are desired
	 * 		time:   The time range for the desired messages
	 * 		stickers: Whether to include stickers ("only", "with", "without")
	 */
	MessagesSDK.prototype.getMessages = function(opts) {
		var self = this;
		
		self.initializeDatabase();
		
		return $.Deferred(function(deferredObj) {
			var query = self.MessageModel.all();
			
			if (opts) {
				// deal with user queries
				if (opts.userID) {
					query = query.filter('from', '=', self.FriendModel({ uid : userID }));
				}
				
				// deal with sticker queries
				if (opts.stickers == 'only') {
					query = query.filter('message', '=', 'NULL');
				}
				else if (opts.stickers == 'without') {
					query = query.filter('message', '!=', 'NULL');
				}
			}
			
			query.list(null, function(results) {
				var messages = [];
				
				$.each(results, function (index, r) {
			        messages.push({
			        	uid: r.uid,
			        	message: r.message,
			        	time: r.time
			        });
			    });
				
				deferredObj.resolve(messages);
			});
		}).promise();
	};
	
	MessagesSDK.prototype.getUsers = function() {
		var self = this;
		
		self.initializeDatabase();
		
		return $.Deferred(function(deferredObj) {
			self.FriendModel.all().list(null, function(results) {
				var friends = [];
				
				$.each(results, function (index, r) {
			        friends.push({
			        	uid: r.uid,
			        	name: r.name
			        });
			    });
				
				deferredObj.resolve(friends);
			});
		}).promise();
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