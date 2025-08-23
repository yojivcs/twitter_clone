const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadCount,
  deleteConversation,
  uploadAttachments
} = require('../controllers/messages');

// Protected routes
router.use(protect);

router.post('/', sendMessage);
router.post('/upload', upload.array('files', 4), uploadAttachments);
router.get('/', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/:userId', getMessages);
router.delete('/:conversationId', deleteConversation);

module.exports = router;
