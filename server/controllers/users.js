const User = require('../models/User');
const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');


// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
exports.getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    const { name, bio, location, website } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (website) user.website = website;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file with unique name
    const fileName = `profile-${user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);

    // Delete old profile picture if it's not the default
    if (user.profilePicture && !user.profilePicture.includes('default-profile') && fs.existsSync(path.join(__dirname, '../../client/public', user.profilePicture))) {
      fs.unlinkSync(path.join(__dirname, '../../client/public', user.profilePicture));
    }

    // Update user profile picture path
    user.profilePicture = `/uploads/${fileName}`;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload cover picture
// @route   PUT /api/users/cover-picture
// @access  Private
exports.uploadCoverPicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../client/public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save file with unique name
    const fileName = `cover-${user._id}-${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);

    // Delete old cover picture if it's not the default
    if (user.coverPicture && !user.coverPicture.includes('default-cover') && fs.existsSync(path.join(__dirname, '../../client/public', user.coverPicture))) {
      fs.unlinkSync(path.join(__dirname, '../../client/public', user.coverPicture));
    }

    // Update user cover picture path
    user.coverPicture = `/uploads/${fileName}`;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user followers
// @route   GET /api/users/:username/followers
// @access  Public
exports.getUserFollowers = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('followers')
      .populate('followers', 'name username profilePicture');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.followers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user following
// @route   GET /api/users/:username/following
// @access  Public
exports.getUserFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('following')
      .populate('following', 'name username profilePicture');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.following
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    // Check if user is trying to follow themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }
    
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User to follow not found'
      });
    }
    
    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id
      );
      
      await currentUser.save();
      await userToFollow.save();
      
      return res.status(200).json({
        success: true,
        message: 'User unfollowed'
      });
    }
    
    // Follow
    currentUser.following.push(req.params.id);
    userToFollow.followers.push(req.user.id);
    
    await currentUser.save();
    await userToFollow.save();
    

    
    res.status(200).json({
      success: true,
      message: 'User followed'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user posts
// @route   GET /api/users/:username/posts
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const posts = await Post.find({
      $or: [
        { user: user._id }, // Posts created by the user
        { user: user._id, retweetData: { $exists: true } } // Retweets by the user
      ]
    })
      .populate('user', 'name username profilePicture')
      .populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .sort({ createdAt: -1 });
    
    // No need for additional filtering since the query already handles it
    const userPosts = posts;
    
    res.status(200).json({
      success: true,
      data: userPosts
    });
  } catch (err) {
    next(err);
  }
};