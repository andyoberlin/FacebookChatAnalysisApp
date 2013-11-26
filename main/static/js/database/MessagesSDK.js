define(['jquery', 'facebook', 'jquery_indexeddb'], function($, FB) {
	
	function MessagesSDK(conversation) {
		this.conversation = conversation;
		this.initialized = false;
		this.state = {
			message: "Message database not initialized",
			updating: false,
			totalMessages: 0,
			completeMessages: 0
		};
		
		//persistence.debug = false;
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
				self.initializeDatabase(function() {
					self.fetchNewMessages(lastMessage);
				});
			},
			function() {
				$.indexedDB('conversation_' + self.conversation).deleteDatabase().done(function() {
					self.initializeDatabase(function() {
						self.fetchOldMessages();
					});
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
			self.conversation + '" AND created_time > ' + (Date.parse(lastMessage.time) / 1000) + ' LIMIT 25 OFFSET ' + offset},
			function(response) {
				if (response.data.length == 25) {
					self.state.completeMessages += response.data.length;
					self.state.totalMessages = 1;
					$(self).trigger('sdk.update');
					
					self.fetchNewMessages({ time: response.data[response.data.length - 1].created_time }, offset + 25);
				}
				else {
					self.state.message = "Completed downloading new messages.";
					$(self).trigger('sdk.complete');
				}
				
				self.storeMessages(response.data, true);
			}
		);
	};
	
	MessagesSDK.prototype.getLastMessage = function(success, error) {
		var self = this;
		self.initializeDatabase(function() {
			error();
			/*
			self.MessageModel.all().order('time', false).one(function(result) {
				if (result) {
					success(result);
				}
				else {
					error();
				}
			});*/
		});
	};
	
	MessagesSDK.prototype.initializeDatabase = function(callback, force) {
		var self = this;
		if (!self.initialized || force) {
			$.indexedDB('conversation_' + this.conversation, {
				schema : {
					"1" : function(tx) {
						tx.createObjectStore("Friends", {
							"keyPath" : "uid"
						});
						
						var messagesStore = tx.createObjectStore("Messages", {
							"keyPath" : "uid"
						});
						
						messagesStore.createIndex("friend_uid");
						messagesStore.createIndex("is_sticker");
						
						self.initialized = true;
					}
				}
			}).then(function() {
				callback();
			});
		}
		else {
			callback();
		}
	};
	
	MessagesSDK.prototype.storeMessages = function(messages, fql) {
		console.log("Storing messages...");
		
		var self = this;
		
		$.each(messages, function(index, message) {
			var friendID = !fql ? message.from.id : message.author_id;
			
			// Check if the friend has been created yet. If not, add the friend then add the
			// new message
			$.indexedDB('conversation_' + self.conversation).objectStore("Friends").get(friendID)
				.done(function(result, event) {
					if (!result) {
						$.indexedDB('conversation_' + self.conversation).objectStore("Friends").add({
							uid: friendID,
							name: !fql ? message.from.name : 'Unknown'
						});
					}
					
					var body = !fql ? (message.message ? message.message : "") : message.body;
					
					$.indexedDB('conversation_' + self.conversation).objectStore("Messages").add({
						uid: !fql ? message.id : message.message_id,
						message: body,
						friend_uid: friendID,
						time: !fql ? Date.parse(message.created_time) : message.created_time,
						is_sticker: body == '' ? 1 : 0 
					});
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
			// function for getting all the messages
			var defaultMessages = function() {
				var messages = [];
				$.indexedDB('conversation_' + self.conversation).objectStore("Messages").each(function(message) {
					messages.push(message);
				}).done(function() {
					deferredObj.resolve(messages);
				});
			};
			
			if (opts) {
				if (opts.user) {
					// deal with user queries first
					var userMessages = {
						"sticker" : [],
						"no-sticker" : []
					};
					
					// filters by user and automatically puts the user's messages into an array that separates
					// the stickers from the normal text messages for easy separation later
					$.indexedDB('conversation_' + self.conversation).objectStore("Messages").index("friend_uid")
						.each(function(message) {
							userMessages[message.value.is_sticker ? "sticker" : "no-sticker"].push(message.value);
						}, opts.user.uid).done(function() {
							// filter further by is_sticker
							if (opts.stickers == 'only') {
								deferredObj.resolve(userMessages['stickers']);
							}
							else if (opts.stickers == 'without') {
								deferredObj.resolve(userMessages['no-stickers']);
							}
							else {
								deferredObj.resolve(userMessages['stickers'].concat(userMessages['no-stickers']));
							}
						});
				}
				else if (opts.stickers && (opts.stickers == 'only' || opts.stickers == 'without')) {
					// no user query, but there is a sticker query
					var messages = [];
					$.indexedDB('conversation_' + self.conversation).objectStore("Messages").index("is_sticker")
						.each(function(message) {
							messages.push(message.value);
						}, opts.stickers == 'only' ? 1 : 0).done(function() {
							deferredObj.resolve(messages);
						});
				}
				else {
					defaultMessages();
				}
			}
			else {
				defaultMessages();
			}
		}).promise();
	};
	
	MessagesSDK.prototype.getUsers = function() {
		var self = this;
		
		return $.Deferred(function(deferredObj) {
			var friends = [];
			$.indexedDB('conversation_' + self.conversation).objectStore("Friends").each(function(friend) {
				friends.push(friend.value);
			}).done(function() {
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