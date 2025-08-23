const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Send a message
 * @param {Object} data - Message data
 * @param {string} data.sender - Sender user ID
 * @param {string} data.recipient - Recipient user ID
 * @param {string} data.content - Message content (optional if attachments provided)
 * @param {Array<Object>} [data.attachments] - Attachments (optional)
 * @returns {Promise<Object>} Created message with conversation
 */
exports.sendMessage = async (data) => {
  try {
    // Validate required fields
    if (!data.sender) {
      throw new Error('Sender ID is required');
    }
    if (!data.recipient) {
      throw new Error('Recipient ID is required');
    }
    if (!data.content && (!data.attachments || data.attachments.length === 0)) {
      throw new Error('Either message content or attachments are required');
    }
    
    console.log('Creating message with data:', {
      sender: data.sender,
      recipient: data.recipient,
      contentLength: data.content ? data.content.length : 0,
      attachments: data.attachments ? data.attachments.length : 0,
      isEncrypted: data.isEncrypted || false
    });
    
    // Validate content length against schema limits
    if (data.content && data.content.length > 2000) {
      console.warn('Message content exceeds maximum length, truncating');
      data.content = data.content.substring(0, 2000);
    }
    
    // Create the message without transaction
    const message = await Message.create({
      sender: data.sender,
      recipient: data.recipient,
      content: data.content || '',
      isEncrypted: data.isEncrypted || false,
      attachments: data.attachments || []
    });

    console.log('Message created:', message._id);

    // Find or create conversation without transaction
    let conversation = await Conversation.findOne({
      participants: { $all: [data.sender, data.recipient] }
    });

    if (!conversation) {
      console.log('Creating new conversation');
      conversation = await Conversation.create({
        participants: [data.sender, data.recipient],
        lastMessage: message._id,
        unreadCounts: [
          { user: data.recipient, count: 1 },
          { user: data.sender, count: 0 }
        ]
      });
      console.log('New conversation created:', conversation._id);
    } else {
      console.log('Updating existing conversation:', conversation._id);
      // Update conversation with new message
      const recipientIndex = conversation.unreadCounts.findIndex(
        item => item.user.toString() === data.recipient.toString()
      );

      if (recipientIndex !== -1) {
        conversation.unreadCounts[recipientIndex].count += 1;
      } else {
        conversation.unreadCounts.push({ user: data.recipient, count: 1 });
      }

      conversation.lastMessage = message._id;
      conversation.updatedAt = Date.now();
      await conversation.save();
    }

    // Return populated message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username profilePicture')
      .populate('recipient', 'name username profilePicture');

    console.log('Returning populated message and conversation');
    
    return {
      message: populatedMessage,
      conversation: conversation
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Messages with pagination info
 */
exports.getMessages = async (userId1, userId2, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username profilePicture')
      .populate('recipient', 'name username profilePicture');

    const total = await Message.countDocuments({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      { sender: userId2, recipient: userId1, read: false },
      { $set: { read: true } }
    );

    // Update unread count in conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] }
    });

    if (conversation) {
      const userIndex = conversation.unreadCounts.findIndex(
        item => item.user.toString() === userId1.toString()
      );

      if (userIndex !== -1) {
        conversation.unreadCounts[userIndex].count = 0;
        await conversation.save();
      }
    }

    return {
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Get conversations for a user
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Conversations with pagination info
 */
exports.getConversations = async (userId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      participants: userId
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name username profilePicture')
      .populate('lastMessage');

    const total = await Conversation.countDocuments({
      participants: userId
    });

    // Process conversations to include other participant and unread count
    const processedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      const userUnreadCount = conv.unreadCounts.find(
        item => item.user.toString() === userId.toString()
      );

      return {
        _id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: userUnreadCount ? userUnreadCount.count : 0,
        updatedAt: conv.updatedAt
      };
    });

    return {
      conversations: processedConversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

/**
 * Get total unread messages count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
exports.getTotalUnreadCount = async (userId) => {
  try {
    const conversations = await Conversation.find({
      participants: userId
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const userUnreadCount = conv.unreadCounts.find(
        item => item.user.toString() === userId.toString()
      );
      if (userUnreadCount) {
        totalUnread += userUnreadCount.count;
      }
    });

    return totalUnread;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    throw error;
  }
};

/**
 * Delete a conversation and all its messages
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID requesting deletion
 * @returns {Promise<Object>} Result of deletion
 */
exports.deleteConversation = async (conversationId, userId) => {
  try {
    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    
    // Check if conversation exists
    if (!conversation) {
      return {
        success: false,
        message: 'Conversation not found'
      };
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId.toString())) {
      return {
        success: false,
        message: 'You are not a participant in this conversation'
      };
    }
    
    // Get the other participant
    const otherParticipants = conversation.participants.filter(
      p => p.toString() !== userId.toString()
    );
    
    console.log('Deleting messages for conversation:', conversationId);
    console.log('User:', userId);
    console.log('Other participants:', otherParticipants);
    
    if (otherParticipants.length > 0) {
      // Create an array of conditions for each participant
      const deleteConditions = otherParticipants.flatMap(otherUserId => [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]);
      
      // Delete all messages between these users
      await Message.deleteMany({
        $or: deleteConditions
      });
    } else {
      // If no other participants found (should not happen), delete all messages involving this user
      console.log('No other participants found, deleting all messages involving user');
      await Message.deleteMany({
        $or: [
          { sender: userId },
          { recipient: userId }
        ]
      });
    }
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);
    
    return {
      success: true,
      message: 'Conversation and messages deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
