const {
  sendMessage,
  getMessages,
  getConversations,
  getTotalUnreadCount,
  deleteConversation
} = require('../services/message');
const path = require('path');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipient, content, attachments } = req.body;

    if (!recipient || (!content && (!attachments || attachments.length === 0))) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and either content or attachments are required'
      });
    }

    const result = await sendMessage({
      sender: req.user.id,
      recipient,
      content,
      attachments,
      isEncrypted: req.body.isEncrypted || false
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({
      success: false,
      message: `Error sending message: ${error.message || 'Unknown error'}`,
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// @desc    Get messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getMessages(req.user.id, userId, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getMessages controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting messages'
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await getConversations(req.user.id, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getConversations controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting conversations'
    });
  }
};

// @desc    Get total unread messages count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await getTotalUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error in getUnreadCount controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting unread count'
    });
  }
};

// @desc    Delete a conversation and its messages
// @route   DELETE /api/messages/:conversationId
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required'
      });
    }

    const result = await deleteConversation(conversationId, req.user.id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message || 'Conversation not found or you do not have permission'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteConversation controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation'
    });
  }
};

// @desc    Upload message attachments
// @route   POST /api/messages/upload
// @access  Private
exports.uploadAttachments = async (req, res) => {
  try {
    console.log('Upload request received');
    
    // Check if request contains files
    if (!req.files) {
      console.log('No files object in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded - missing files in request'
      });
    }
    
    console.log('Request files count:', req.files.length);
    
    if (req.files.length === 0) {
      console.log('Empty files array in request');
      return res.status(400).json({
        success: false,
        message: 'No files uploaded - empty files array'
      });
    }

    // Process uploaded files
    const files = req.files.map(file => {
      console.log('Processing file:', file.filename, 'Size:', file.size, 'Type:', file.mimetype);
      return {
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size
      };
    });

    console.log('Processed files:', files.length);
    
    res.status(201).json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Error in uploadAttachments controller:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Unknown error';
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size exceeds the limit (15MB)';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      errorMessage = 'Too many files or incorrect field name';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: `Error uploading attachments: ${errorMessage}`,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
};