const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  retweetPost,
  getPostReplies,
  votePoll
} = require('../controllers/posts');

const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getPosts)
  .post(protect, upload.array('media', 4), createPost);

router
  .route('/:id')
  .get(getPost)
  .put(protect, upload.array('media', 4), updatePost)
  .delete(protect, deletePost);

router.route('/:id/replies').get(getPostReplies);
router.route('/:id/like').put(protect, likePost);
router.route('/:id/retweet').put(protect, retweetPost);
router.route('/:id/vote/:optionIndex').post(protect, votePoll);

module.exports = router;