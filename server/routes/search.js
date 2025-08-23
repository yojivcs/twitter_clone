const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Get trending topics
router.get('/trending', async (req, res) => {
  try {
    // Define time windows for different trending periods
    const timeWindows = {
      recent: 6 * 60 * 60 * 1000, // Last 6 hours
      daily: 24 * 60 * 60 * 1000, // Last 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000 // Last 7 days
    };
    
    // Categories we want to detect and their associated keywords
    const categories = {
      Technology: ['tech', 'programming', 'code', 'developer', 'software', 'ai', 'data', 'web', 'app', 'cloud', 'crypto', 'blockchain', 'nft', 'mongodb', 'react', 'node'],
      Sports: ['sports', 'football', 'basketball', 'soccer', 'nba', 'nfl', 'mlb', 'tennis', 'golf', 'game', 'match', 'player', 'team', 'league', 'championship', 'mufc'],
      Entertainment: ['movie', 'film', 'tv', 'show', 'music', 'celebrity', 'actor', 'actress', 'director', 'singer', 'band', 'concert', 'release', 'premiere', 'award'],
      Politics: ['politics', 'government', 'election', 'president', 'vote', 'campaign', 'policy', 'law', 'democrat', 'republican', 'congress', 'senate', 'bill', 'reactjs'],
      Business: ['business', 'company', 'startup', 'entrepreneur', 'market', 'stock', 'investment', 'economy', 'finance', 'trade', 'industry', 'product', 'service', 'mern'],
      World: ['world', 'global', 'international', 'country', 'nation', 'foreign', 'travel', 'culture', 'language', 'tradition', 'history', 'event']
    };
    
    // Get all posts from the last week
    const allRecentPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - timeWindows.weekly) }
    }).populate('user', 'name username');
    
    // Process hashtags by time window
    const trendingByTime = {};
    
    // Process each time window
    for (const [windowName, timeMs] of Object.entries(timeWindows)) {
      const windowPosts = allRecentPosts.filter(post => 
        new Date(post.createdAt) >= new Date(Date.now() - timeMs)
      );
      
      // Count hashtags in this time window
      const hashtagCounts = {};
      const hashtagUsers = {}; // Track unique users per hashtag
      const hashtagContent = {}; // Store content associated with hashtags
      
      windowPosts.forEach(post => {
        post.hashtags.forEach(hashtag => {
          // Count occurrences
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
          
          // Track unique users
          if (!hashtagUsers[hashtag]) hashtagUsers[hashtag] = new Set();
          hashtagUsers[hashtag].add(post.user._id.toString());
          
          // Store content for category detection
          if (!hashtagContent[hashtag]) hashtagContent[hashtag] = [];
          hashtagContent[hashtag].push(post.content.toLowerCase());
        });
      });
      
      // Calculate velocity (growth rate) if we have data from previous time windows
      const hashtagVelocity = {};
      if (windowName === 'daily' && trendingByTime.recent) {
        Object.keys(hashtagCounts).forEach(hashtag => {
          const recentCount = trendingByTime.recent.counts[hashtag] || 0;
          const dailyCount = hashtagCounts[hashtag];
          // Calculate growth factor
          hashtagVelocity[hashtag] = recentCount > 0 ? dailyCount / recentCount : 1;
        });
      }
      
      // Determine category for each hashtag
      const hashtagCategories = {};
      Object.keys(hashtagCounts).forEach(hashtag => {
        // Default category
        let bestCategory = 'Trending';
        let highestScore = 0;
        
        // Check content associated with hashtag for category keywords
        const combinedContent = (hashtagContent[hashtag] || []).join(' ');
        
        // Score each category
        Object.entries(categories).forEach(([category, keywords]) => {
          const score = keywords.reduce((acc, keyword) => {
            return acc + (combinedContent.includes(keyword.toLowerCase()) ? 1 : 0);
          }, 0);
          
          if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
          }
        });
        
        // If the hashtag itself matches a category keyword, prioritize that
        Object.entries(categories).forEach(([category, keywords]) => {
          if (keywords.some(keyword => hashtag.toLowerCase().includes(keyword.toLowerCase()))) {
            bestCategory = category;
          }
        });
        
        hashtagCategories[hashtag] = bestCategory;
      });
      
      trendingByTime[windowName] = {
        counts: hashtagCounts,
        users: hashtagUsers,
        velocity: hashtagVelocity,
        categories: hashtagCategories
      };
    }
    
    // Calculate trending score based on counts, unique users, and velocity
    const trendingScores = {};
    Object.keys(trendingByTime.daily.counts).forEach(hashtag => {
      const count = trendingByTime.daily.counts[hashtag] || 0;
      const uniqueUsers = trendingByTime.daily.users[hashtag]?.size || 0;
      const velocity = trendingByTime.daily.velocity[hashtag] || 1;
      
      // Score formula: count * unique users ratio * velocity
      trendingScores[hashtag] = count * (uniqueUsers / Math.max(1, count)) * velocity;
    });
    
    // Convert to array and sort by score
    const trending = Object.entries(trendingScores)
      .map(([hashtag, score]) => ({
        category: trendingByTime.daily.categories[hashtag],
        title: `#${hashtag}`,
        tweets: trendingByTime.daily.counts[hashtag],
        score: score.toFixed(2)
      }))
      .sort((a, b) => b.score - a.score);
    
    // Group by category and take top 3 from each
    const trendingByCategory = {};
    trending.forEach(item => {
      if (!trendingByCategory[item.category]) {
        trendingByCategory[item.category] = [];
      }
      if (trendingByCategory[item.category].length < 3) {
        trendingByCategory[item.category].push(item);
      }
    });
    
    // Flatten and limit to top 15 overall
    const result = Object.values(trendingByCategory)
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    
    res.json(result);
  } catch (error) {
    console.error('Error in trending algorithm:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search posts
router.get('/posts', async (req, res) => {
  try {
    const { q } = req.query;
    
    // Remove # if present at the beginning of the query
    const cleanQuery = q.startsWith('#') ? q.substring(1) : q;
    
    const posts = await Post.find({
      $or: [
        { content: { $regex: q, $options: 'i' } },
        { hashtags: { $in: [cleanQuery.toLowerCase()] } }
      ]
    })
    .populate('user', 'name username profilePicture')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/users', async (req, res) => {
  try {
    const { q } = req.query;
    console.log('Search users request received with query:', q);
    
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name username profilePicture')
    .limit(20);

    console.log('Found users:', users.length);
    console.log('Users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all hashtags with counts
router.get('/hashtags', async (req, res) => {
  try {
    // Aggregate posts to get hashtag counts
    const hashtagStats = await Post.aggregate([
      { $unwind: '$hashtags' },
      { 
        $group: { 
          _id: '$hashtags', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Format the response
    const hashtags = hashtagStats.map(stat => ({
      name: stat._id,
      count: stat.count
    }));

    res.json(hashtags);
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get random users for suggestions
router.get('/random-users', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Get random users, excluding the requesting user if authenticated
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

// Get random users for discovery
router.get('/users/random', async (req, res) => {
  try {
    const { limit = 3, excludeCurrentUser } = req.query;
    
    let query = {};
    
    // If excludeCurrentUser is provided, exclude that user from results
    if (excludeCurrentUser) {
      query._id = { $ne: excludeCurrentUser };
    }
    
    // Get random users with proper profile information
    const randomUsers = await User.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          profilePicture: 1,
          coverPicture: 1,
          bio: 1,
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } },
          postsCount: { $size: { $ifNull: ['$posts', []] } }
        }
      }
    ]);

    // If we don't have enough users, get some default ones
    if (randomUsers.length < parseInt(limit)) {
      const additionalUsers = await User.find(query)
        .select('_id name username profilePicture coverPicture bio')
        .limit(parseInt(limit) - randomUsers.length);
      
      randomUsers.push(...additionalUsers);
    }

    // Ensure we have profile pictures
    const usersWithDefaults = randomUsers.map(user => ({
      ...user,
      profilePicture: user.profilePicture || '/images/default-profile.png',
      coverPicture: user.coverPicture || '/images/default-cover.png'
    }));

    res.json(usersWithDefaults);
  } catch (error) {
    console.error('Error fetching random users:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
