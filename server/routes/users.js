const express = require('express');
const {
  getUsers,
  getUserByUsername,
  updateUser,
  followUser,
  getUserPosts,
  uploadProfilePicture,
  uploadCoverPicture,
  getUserFollowers,
  getUserFollowing
} = require('../controllers/users');

const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const User = require('../models/User');

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.route('/')
  .get(getUsers)
  .put(protect, updateUser);

router.route('/profile-picture')
  .put(protect, upload.single('profilePicture'), uploadProfilePicture);

router.route('/cover-picture')
  .put(protect, upload.single('coverPicture'), uploadCoverPicture);

router.route('/:id/follow')
  .put(protect, followUser);

router.route('/:username')
  .get(getUserByUsername);

router.route('/:username/posts')
  .get(getUserPosts);

router.route('/:username/followers')
  .get(getUserFollowers);

router.route('/:username/following')
  .get(getUserFollowing);

// Get random users for suggestions
router.get('/random/suggestions', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Get random users
    const users = await User.aggregate([
      { $sample: { size: parseInt(limit) } },
      { $project: { name: 1, username: 1, profilePicture: 1 } }
    ]);

    res.json(users);
  } catch (error) {
    console.error('Error fetching random users:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 