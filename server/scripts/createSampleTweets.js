require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

// Sample tweets with hashtags
const sampleTweets = [
  {
    content: "Just started learning the MERN stack! Excited about this journey. #webdev #coding #mongodb #express #react #nodejs",
    hashtags: ['webdev', 'coding', 'mongodb', 'express', 'react', 'nodejs']
  },
  {
    content: "Beautiful day for a hike in the mountains! #nature #outdoors #hiking",
    hashtags: ['nature', 'outdoors', 'hiking']
  },
  {
    content: "Working on a new project using React and Redux. The state management is so clean! #react #redux #javascript",
    hashtags: ['react', 'redux', 'javascript']
  },
  {
    content: "Just finished reading an amazing book on AI and its future implications. Highly recommend! #AI #machinelearning #books",
    hashtags: ['AI', 'machinelearning', 'books']
  },
  {
    content: "Made a delicious pasta dish for dinner tonight. Recipe coming soon! #cooking #food #homemade",
    hashtags: ['cooking', 'food', 'homemade']
  },
  {
    content: "Watching the sunset at the beach. Perfect end to a perfect day. #sunset #beach #relax",
    hashtags: ['sunset', 'beach', 'relax']
  },
  {
    content: "Just released my new portfolio website! Check it out and let me know what you think. #webdesign #portfolio #freelance",
    hashtags: ['webdesign', 'portfolio', 'freelance']
  },
  {
    content: "Attended an inspiring tech conference today. Met so many talented developers! #conference #networking #tech",
    hashtags: ['conference', 'networking', 'tech']
  },
  {
    content: "Morning workout done! Starting the day with energy and focus. #fitness #health #motivation",
    hashtags: ['fitness', 'health', 'motivation']
  },
  {
    content: "Excited to announce I'll be speaking at the upcoming JavaScript conference! #javascript #speaking #conference",
    hashtags: ['javascript', 'speaking', 'conference']
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get all users
      const users = await User.find();
      
      if (users.length === 0) {
        console.log('No users found. Please run the bulkRegister script first.');
        return;
      }
      
      // Create tweets for each user
      let tweetCount = 0;
      
      for (const user of users) {
        // Each user gets 1-3 random tweets
        const numTweets = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numTweets; i++) {
          // Select a random tweet template
          const tweetIndex = Math.floor(Math.random() * sampleTweets.length);
          const tweetTemplate = sampleTweets[tweetIndex];
          
          // Create the tweet
          await Post.create({
            content: tweetTemplate.content,
            user: user._id,
            hashtags: tweetTemplate.hashtags
          });
          
          tweetCount++;
          console.log(`Created tweet for user ${user.username}`);
        }
      }
      
      // Create some interactions (likes and retweets)
      const allPosts = await Post.find();
      
      for (const post of allPosts) {
        // Random users like the post (30% chance per user)
        for (const user of users) {
          if (Math.random() < 0.3 && !post.user.equals(user._id)) {
            if (!post.likes.includes(user._id)) {
              post.likes.push(user._id);
            }
          }
        }
        
        // Random users retweet the post (15% chance per user)
        for (const user of users) {
          if (Math.random() < 0.15 && !post.user.equals(user._id)) {
            if (!post.retweets.includes(user._id)) {
              post.retweets.push(user._id);
              
              // Create a retweet post
              await Post.create({
                retweetData: post._id,
                user: user._id
              });
              
              tweetCount++;
              console.log(`Created retweet for user ${user.username}`);
            }
          }
        }
        
        await post.save();
      }
      
      // Create some replies
      for (const post of allPosts) {
        // 20% chance of getting replies
        if (Math.random() < 0.2) {
          // 1-3 random replies
          const numReplies = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < numReplies; i++) {
            // Random user makes the reply
            const userIndex = Math.floor(Math.random() * users.length);
            const user = users[userIndex];
            
            // Don't reply to your own post
            if (post.user.equals(user._id)) {
              continue;
            }
            
            // Create reply content
            const replyContents = [
              "Great post! I totally agree.",
              "Interesting perspective. Thanks for sharing!",
              "I've been thinking about this too!",
              "This is so cool!",
              "Love this content!",
              "Thanks for sharing your thoughts.",
              "I have a different view on this, but appreciate your perspective.",
              "100% agree with you on this one!",
              "This made my day!",
              "Can you share more details about this?"
            ];
            
            const replyIndex = Math.floor(Math.random() * replyContents.length);
            
            // Create the reply post
            const reply = await Post.create({
              content: replyContents[replyIndex],
              user: user._id,
              replyTo: post._id
            });
            
            // Update the original post's replies array
            post.replies.push(reply._id);
            await post.save();
            
            tweetCount++;
            console.log(`Created reply for post by ${user.username}`);
          }
        }
      }
      
      console.log(`Sample data creation complete. Created ${tweetCount} tweets/retweets/replies.`);
    } catch (err) {
      console.error('Error creating sample data:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 