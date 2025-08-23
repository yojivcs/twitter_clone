const Post = require('../models/Post');
const User = require('../models/User');


// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    // Handle media files if they exist
    if (req.files && req.files.length > 0) {
      req.body.media = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        filename: file.filename
      }));
    }

    // Handle poll data if it exists
    if (req.body.poll) {
      const pollData = JSON.parse(req.body.poll);
      req.body.poll = {
        options: pollData.options,
        endsAt: new Date(pollData.endsAt)
      };
    }
    
    const post = await Post.create(req.body);

    // If this is a reply, update the parent post's replies array
    if (req.body.replyTo) {
      const parentPost = await Post.findById(req.body.replyTo);
      if (parentPost) {
        parentPost.replies.push(post._id);
        await parentPost.save();
        

      }
    }

    // Populate the created post with user info
    await post.populate('user', 'name username profilePicture');



    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    // If there's an error and files were uploaded, we should delete them
    if (req.files) {
      const fs = require('fs');
      req.files.forEach(file => {
        fs.unlink(`public${file.path}`, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(err);
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePicture')
      .populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      });

    // Add vote percentages to posts with polls
    const postsWithPollData = posts.map(post => {
      if (post.poll) {
        const totalVotes = post.getTotalVotes();
        const votePercentages = post.getVotePercentages();
        const hasVoted = req.user ? post.hasUserVoted(req.user.id) : false;
        
        return {
          ...post.toObject(),
          poll: {
            ...post.poll.toObject(),
            totalVotes,
            votePercentages,
            hasVoted
          }
        };
      }
      return post;
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: postsWithPollData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post with replies
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name username profilePicture')
      .populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      })
      .populate({
        path: 'replies',
        populate: { 
          path: 'user',
          select: 'name username profilePicture'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add poll data if post has a poll
    if (post.poll) {
      const totalVotes = post.getTotalVotes();
      const votePercentages = post.getVotePercentages();
      const hasVoted = req.user ? post.hasUserVoted(req.user.id) : false;
      
      post.poll = {
        ...post.poll.toObject(),
        totalVotes,
        votePercentages,
        hasVoted
      };
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get post replies
// @route   GET /api/posts/:id/replies
// @access  Public
exports.getPostReplies = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'replies',
        populate: [
          { 
            path: 'user',
            select: 'name username profilePicture'
          },
          {
            path: 'replies',
            populate: { path: 'user', select: 'name username profilePicture' }
          }
        ],
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      count: post.replies.length,
      data: post.replies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Vote on a poll
// @route   POST /api/posts/:id/vote/:optionIndex
// @access  Private
exports.votePoll = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.poll) {
      return res.status(400).json({
        success: false,
        message: 'This post does not have a poll'
      });
    }

    if (post.poll.closed || new Date() > post.poll.endsAt) {
      return res.status(400).json({
        success: false,
        message: 'This poll is closed'
      });
    }

    const optionIndex = parseInt(req.params.optionIndex);
    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option index'
      });
    }

    // Check if user has already voted
    if (post.hasUserVoted(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this poll'
      });
    }

    // Add vote
    post.poll.options[optionIndex].votes.push(req.user.id);
    await post.save();

    // Return updated poll data
    const totalVotes = post.getTotalVotes();
    const votePercentages = post.getVotePercentages();

    res.status(200).json({
      success: true,
      data: {
        totalVotes,
        votePercentages,
        hasVoted: true
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // Handle media files if they exist
    if (req.files && req.files.length > 0) {
      const newMedia = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        filename: file.filename
      }));
      
      // Get existing media from request
      let existingMedia = [];
      if (req.body.existingMedia) {
        try {
          existingMedia = JSON.parse(req.body.existingMedia);
        } catch (e) {
          existingMedia = [];
        }
      }
      
      // Combine existing and new media
      updateData.media = [...existingMedia, ...newMedia];
    } else if (req.body.existingMedia) {
      // Only existing media, no new files
      try {
        const existingMedia = JSON.parse(req.body.existingMedia);
        updateData.media = existingMedia;
      } catch (e) {
        updateData.media = [];
      }
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Make sure user is post owner
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Remove this post from parent's replies if it's a reply
    if (post.replyTo) {
      const parentPost = await Post.findById(post.replyTo);
      if (parentPost) {
        parentPost.replies = parentPost.replies.filter(
          reply => reply.toString() !== post._id.toString()
        );
        await parentPost.save();
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Like/unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if the post has already been liked by this user
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      // Like the post
      post.likes.push(req.user.id);
      

    }

    await post.save();
    
    // Populate user data before returning
    await post.populate('user', 'name username profilePicture');
    
    // Also populate retweet data if it exists
    if (post.retweetData) {
      await post.populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      });
    }
    
    // Populate reply data if it exists
    if (post.replyTo) {
      await post.populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Retweet/un-retweet post
// @route   PUT /api/posts/:id/retweet
// @access  Private
exports.retweetPost = async (req, res, next) => {
  try {
    console.log('Retweet request received:', {
      postId: req.params.id,
      userId: req.user?.id,
      user: req.user
    });

    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('Post not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    console.log('Post found:', {
      postId: post._id,
      postUserId: post.user,
      retweets: post.retweets
    });

    // Check if the post has already been retweeted by this user
    const isRetweeted = post.retweets.includes(req.user.id);

    console.log('Retweet status:', {
      isRetweeted,
      userId: req.user.id,
      retweets: post.retweets
    });

    if (isRetweeted) {
      // Un-retweet the post
      post.retweets = post.retweets.filter(
        retweet => retweet.toString() !== req.user.id
      );
      console.log('Un-retweeting post');
      
      // Remove the retweet post from user's profile
      try {
        await Post.findOneAndDelete({
          user: req.user.id,
          retweetData: post._id
        });
        console.log('Retweet post removed from user profile');
      } catch (error) {
        console.error('Error removing retweet post:', error);
      }
    } else {
      // Retweet the post
      post.retweets.push(req.user.id);
      console.log('Retweeting post');
      
      // Create a new retweet post (Twitter-like behavior)
      try {
        const retweetPost = new Post({
          user: req.user.id,
          retweetData: post._id,
          createdAt: new Date()
        });
        
        await retweetPost.save();
        console.log('New retweet post created:', retweetPost._id);
        
        // Populate the retweet post data
        await retweetPost.populate('user', 'name username profilePicture');
        await retweetPost.populate({
          path: 'retweetData',
          populate: { path: 'user', select: 'name username profilePicture' }
        });
        
        // Emit socket event for new retweet post
        const io = req.app.get('io');
        if (io) {
          io.emit('new_post', retweetPost);
          console.log('Socket event emitted for new retweet');
        }
      } catch (error) {
        console.error('Error creating retweet post:', error);
      }
      

    }

    console.log('Saving post...');
    await post.save();
    console.log('Post saved successfully');
    
    // Populate user data before returning
    await post.populate('user', 'name username profilePicture');
    
    // Also populate retweet data if it exists
    if (post.retweetData) {
      await post.populate({
        path: 'retweetData',
        populate: { path: 'user', select: 'name username profilePicture' }
      });
    }
    
    // Populate reply data if it exists
    if (post.replyTo) {
      await post.populate({
        path: 'replyTo',
        populate: { path: 'user', select: 'name username profilePicture' }
      });
    }

    console.log('Sending success response');
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error('Error in retweetPost:', err);
    console.error('Error stack:', err.stack);
    console.error('Request params:', req.params);
    console.error('Request user:', req.user);
    next(err);
  }
};