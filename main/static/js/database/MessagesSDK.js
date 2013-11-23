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
		
		persistence.debug = false;
	}
	
	/**
	 * Updates the database with the latest conversation information.
	 * 
	 * TODO: Have the SDK track the current state of the database to
	 * minimize amount needed to be downloaded.
	 */
	MessagesSDK.prototype.update = function() {
		var self = this;
		
		this.getLastMessage(
			function(lastMessage) {
				self.initializeDatabase();
				self.fetchNewMessages(lastMessage);
			},
			function() {
				self.initializeDatabase();
				persistence.reset(null, function() {
					self.initializeDatabase(true);
					self.fetchOldMessages();
				});
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
						
						self.fetchOldMessages(response.paging.next);
						self.storeMessages(response.data);
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
			FB.api('/fql', { q: 'SELECT message_count FROM thread WHERE thread_id = ' + self.conversation }, function(response) {
				if (response && response.data && response.data.length > 0) {
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
						
						self.fetchOldMessages(response.paging.next);
						self.storeMessages(response.data);
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
	
	MessagesSDK.prototype.fetchNewMessages = function(lastMessage, offset) {
		var self = this;
		self.state.message = "Loading new messages...";
		self.state.updating = true;
		self.state.totalMessages = 0;
		self.state.completeMessages = 0;
		
		if (!offset) {
			offset = 0;
		}
		
		FB.api('/fql', { q: 'SELECT message_id, author_id, body, created_time FROM message WHERE thread_id = "' + 
			self.conversation + '" AND created_time > ' + Date.parse(lastMessage.time) + ' LIMIT 25 OFFSET ' + offset},
			function(response) {
				if (response.data.length == 25) {
					self.fetchNewMessages({ time: response.data[response.data.length - 1].created_time }, offset + 25);
				}
				else {
					self.state.message = "Completed downloading new messages.";
					$(self).trigger('sdk.complete');
				}
				
				self.state.completeMessages += response.data.length;
				self.state.totalMessages = 1;
				
				$(self).trigger('sdk.update');
				
				self.storeMessages(response.data);
			}
		);
	};
	
	MessagesSDK.prototype.getLastMessage = function(success, error) {
		this.initializeDatabase();
		
		this.MessageModel.all().order('time', false).one(function(result) {
			if (result) {
				success(result);
			}
			else {
				error();
			}
		});
	};
	
	MessagesSDK.prototype.initializeDatabase = function(force) {
		if (!this.initialized || force) {
			try {
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
				
				this.MessageModel.hasOne('friend', this.FriendModel);
				
				persistence.schemaSync();
			}
			catch(e) {
				persistence.store.memory.config(persistence);
			}
			
			this.initialized = true;
		}
	};
	
	MessagesSDK.prototype.storeMessages = function(messages, fql) {
		console.log("Storing messages...");
		
		var self = this;
		
		$.each(messages, function(index, message) {
			var friendID = message.from.id ? !fql : message.author_id;
			
			self.FriendModel.all().filter('uid', '=', message.from.id).one(null, function(friend) {
				if (!friend) {
					friend = new self.FriendModel({
						uid: message.from.id,
						name: message.from.name ? !fql : 'Unknown'
					});
					
					persistence.add(friend);
				}
				
				var body = (message.message ? message.message : "") ? !fql : message.body;
				
				var msg = new self.MessageModel({
					uid: message.id ? !fql : message.message_id,
					message: body,
					friend: friend,
					time: Date.parse(message.created_time) ? !fql : message.created_time
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
	 * 		user: The user whose messages are desired
	 * 		time:   The time range for the desired messages
	 * 		stickers: Whether to include stickers ("only", "with", "without")
	 */
	MessagesSDK.prototype.getMessages = function(opts) {
		var self = this;
		
		return $.Deferred(function(deferredObj) {
			var query = self.MessageModel.all();
			
			if (opts) {
				// deal with user queries
				if (opts.user) {
					query = query.filter('friend', '=', opts.user.id);
				}
				
				// deal with sticker queries
				if (opts.stickers == 'only') {
					query = query.filter('message', '=', '');
				}
				else if (opts.stickers == 'without') {
					query = query.filter('message', '!=', '');
				}
			}
			
			query.list(null, function(results) {
				var messages = [];
				
				$.each(results, function (index, r) {
			        messages.push(r);
			    });
				
				deferredObj.resolve(messages);
			});
		}).promise();
	};
	
	MessagesSDK.prototype.getUsers = function() {
		var self = this;
		
		return $.Deferred(function(deferredObj) {
			self.FriendModel.all().list(null, function(results) {
				var friends = [];
				
				$.each(results, function (index, r) {
			        friends.push(r);
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