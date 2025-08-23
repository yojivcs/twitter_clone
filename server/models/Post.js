const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [25, 'Poll option cannot be more than 25 characters']
  },
  votes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
});

const PollSchema = new mongoose.Schema({
  options: [PollOptionSchema],
  endsAt: {
    type: Date,
    required: true
  },
  closed: {
    type: Boolean,
    default: false
  }
});

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: function() {
      return this.retweetData === undefined && !this.poll; // Only required if not a retweet and no poll
    },
    maxlength: [280, 'Tweet cannot be more than 280 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  media: [
    {
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      filename: {
        type: String,
        required: true
      }
    }
  ],
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  retweets: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  retweetData: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  },
  replyTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post'
  },
  replies: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Post'
    }
  ],
  hashtags: [
    {
      type: String
    }
  ],
  poll: PollSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search
PostSchema.index({ content: 'text' });

// Middleware to extract hashtags from content
PostSchema.pre('save', function(next) {
  // Extract hashtags from content if content exists
  if (this.content) {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const hashtags = this.content.match(hashtagRegex);
    
    if (hashtags) {
      // Remove # symbol and store unique hashtags
      this.hashtags = [...new Set(hashtags.map(tag => tag.slice(1).toLowerCase()))];
    }
  }
  
  next();
});

// Method to check if a user has voted in a poll
PostSchema.methods.hasUserVoted = function(userId) {
  if (!this.poll) return false;
  return this.poll.options.some(option => 
    option.votes.some(vote => vote.toString() === userId.toString())
  );
};

// Method to get total votes in a poll
PostSchema.methods.getTotalVotes = function() {
  if (!this.poll) return 0;
  return this.poll.options.reduce((total, option) => total + option.votes.length, 0);
};

// Method to get vote percentages
PostSchema.methods.getVotePercentages = function() {
  if (!this.poll) return [];
  const totalVotes = this.getTotalVotes();
  return this.poll.options.map(option => ({
    text: option.text,
    percentage: totalVotes === 0 ? 0 : (option.votes.length / totalVotes) * 100,
    votes: option.votes.length
  }));
};

module.exports = mongoose.model('Post', PostSchema);