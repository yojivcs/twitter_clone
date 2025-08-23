require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

// Tech personalities usernames
const techUsernames = [
  'elonmusk',
  'satyanadella',
  'sundarpichai',
  'tim_cook',
  'zuck',
  'jeffbezos',
  'lisasu',
  'jensenhuang'
];

// Humorous and clean replies for different contexts
const humorousReplies = {
  tech: [
    "Have you tried turning it off and on again? Works 60% of the time, every time! 😂",
    "My code works on my machine, so I'm obviously shipping my machine to production.",
    "I don't always test my code, but when I do, I do it in production.",
    "Why do programmers prefer dark mode? Because light attracts bugs!",
    "Two bytes meet. The first byte asks, 'Are you ill?' The second byte replies, 'No, just feeling a bit off.'",
    "I would make a UDP joke, but you might not get it.",
    "I told my wife she should embrace her mistakes. She gave me a hug.",
    "My AI assistant just asked for a raise. I told it that was artificially ambitious.",
    "I'm not saying we should build Skynet, but has anyone actually given it a fair chance?",
    "My coffee needs an API. It's not responding to my requests this morning."
  ],
  business: [
    "The best time to invest was 20 years ago. The second best time is after my morning coffee.",
    "My ROI on sleep has been disappointing lately. Considering a hostile takeover of my alarm clock.",
    "Just had a four-hour meeting about how to reduce meeting times. Very productive!",
    "My five-year plan is to come up with a five-year plan. So far, it's going according to plan.",
    "I've discovered the key to success: making PowerPoint slides that your boss can understand.",
    "I'm not saying I'm Batman, but have you ever seen me and profitable Q3 earnings in the same room?",
    "Just pivoted my breakfast from cereal to toast. Investors are cautiously optimistic.",
    "The market is volatile, but my coffee consumption remains bullish.",
    "My weekend strategy involves significant downtime allocation and strategic napping initiatives.",
    "Just disrupted the traditional alarm clock industry by hitting snooze nine times."
  ],
  innovation: [
    "My smartwatch just told me to stand up. I told my smart speaker to tell my smartwatch I'm already standing. We're at an impasse.",
    "I've invented a new programming language where all syntax errors are actually the computer's fault.",
    "Just patented a mind-reading device. You're thinking it won't work, aren't you?",
    "My smart fridge just judged my midnight snack choices. This is not the future I was promised.",
    "Innovation is simple: just create something that makes people say 'why didn't I think of that?' and then patent it quickly.",
    "My new startup idea: an app that tells you when you've been using apps too much. It's very meta.",
    "I've developed an AI that can predict when I'll need coffee. It just runs continuously.",
    "Just invented a quantum computer that both works and doesn't work at the same time. Or did I?",
    "My latest invention: a solar-powered flashlight. Still working out some kinks.",
    "I'm developing a teleportation device, but it only works when nobody is looking."
  ],
  competition: [
    "Our competitors think they're playing chess. We're playing 3D chess. They're playing checkers. We're... you get the idea.",
    "I don't consider it competition unless they can also recite Pi to 100 digits while coding.",
    "Our biggest competitor just launched a new product. Coincidentally, I just launched my stress ball across the room.",
    "I'm not worried about the competition. My code compiles at least 30% of the time.",
    "Our competitor's new feature is impressive, but can it run Crysis?",
    "Just saw our competitor's latest product. Reminds me of ours, just with more bugs and less style.",
    "Competition is healthy. It's like having someone chase you while you're running - very motivating!",
    "I respect our competitors. They've made all the mistakes we're trying to avoid.",
    "Our competitor just raised another round of funding. I just raised my coffee mug. We're both lifting things!",
    "I studied our competition so thoroughly that LinkedIn thinks I work there now."
  ],
  general: [
    "Just achieved inbox zero! And by zero, I mean I created a new folder called 'To Deal With Later.'",
    "My weekend plans include debugging my life and implementing new coffee-based algorithms.",
    "Weather forecast: Cloudy with a chance of cloud computing.",
    "I don't always make dad jokes, but when I do, they're fully patented and proprietary.",
    "Just set my out-of-office reply to 'I'm currently out of clever out-of-office replies.'",
    "My fitness tracker says I've taken 10,000 steps today, most of them towards the coffee machine.",
    "I'm not procrastinating, I'm giving my problems time to solve themselves.",
    "Just upgraded to Human 2.0. Still experiencing some bugs in the sleep module.",
    "I'm on a seafood diet. I see food, and then I calculate its nutritional API.",
    "My life has a great user interface but the documentation is lacking."
  ]
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get tech personalities
      const users = await User.find({ username: { $in: techUsernames } });
      
      if (users.length === 0) {
        console.log('No tech personalities found.');
        return;
      }
      
      console.log(`Found ${users.length} tech personalities.`);
      
      // Get all posts from tech personalities
      const posts = await Post.find({ 
        user: { $in: users.map(u => u._id) },
        replyTo: { $exists: false } // Only get original posts, not replies
      }).populate('user', 'name username');
      
      if (posts.length === 0) {
        console.log('No posts found from tech personalities.');
        return;
      }
      
      console.log(`Found ${posts.length} posts from tech personalities.`);
      
      // 1. Create follow relationships
      console.log('Creating follow relationships...');
      let followCount = 0;
      
      // Define specific follow relationships that make sense for tech personalities
      const specificFollows = [
        { follower: 'elonmusk', following: ['jeffbezos', 'tim_cook'] }, // Elon follows Jeff and Tim
        { follower: 'tim_cook', following: ['satyanadella', 'sundarpichai'] }, // Tim follows Satya and Sundar
        { follower: 'satyanadella', following: ['sundarpichai', 'jensenhuang'] }, // Satya follows Sundar and Jensen
        { follower: 'sundarpichai', following: ['tim_cook', 'zuck'] }, // Sundar follows Tim and Mark
        { follower: 'zuck', following: ['elonmusk', 'jeffbezos'] }, // Mark follows Elon and Jeff
        { follower: 'jeffbezos', following: ['elonmusk', 'satyanadella'] }, // Jeff follows Elon and Satya
        { follower: 'lisasu', following: ['jensenhuang', 'satyanadella'] }, // Lisa follows Jensen and Satya
        { follower: 'jensenhuang', following: ['lisasu', 'sundarpichai'] }, // Jensen follows Lisa and Sundar
      ];
      
      for (const relationship of specificFollows) {
        const follower = users.find(u => u.username === relationship.follower);
        
        if (!follower) {
          console.log(`User ${relationship.follower} not found.`);
          continue;
        }
        
        for (const followingUsername of relationship.following) {
          const userToFollow = users.find(u => u.username === followingUsername);
          
          if (!userToFollow) {
            console.log(`User ${followingUsername} not found.`);
            continue;
          }
          
          // Check if already following
          if (!follower.following.includes(userToFollow._id)) {
            follower.following.push(userToFollow._id);
            userToFollow.followers.push(follower._id);
            
            await userToFollow.save();
            followCount++;
            console.log(`${follower.name} (@${follower.username}) is now following ${userToFollow.name} (@${userToFollow.username})`);
          }
        }
        
        await follower.save();
      }
      
      console.log(`Created ${followCount} new follow relationships.`);
      
      // 2. Add humorous replies to posts
      console.log('Adding humorous replies to posts...');
      let replyCount = 0;
      
      // For each post, add 1-2 replies from random users
      for (const post of posts) {
        // Skip posts that already have many replies
        if (post.replies && post.replies.length >= 3) {
          continue;
        }
        
        // Determine how many replies to add (1-2)
        const numReplies = Math.floor(Math.random() * 2) + 1;
        
        // Get potential repliers (excluding the post author)
        const potentialRepliers = users.filter(u => !u._id.equals(post.user._id));
        
        // Shuffle the potential repliers
        for (let i = potentialRepliers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [potentialRepliers[i], potentialRepliers[j]] = [potentialRepliers[j], potentialRepliers[i]];
        }
        
        // Add replies
        for (let i = 0; i < Math.min(numReplies, potentialRepliers.length); i++) {
          const replier = potentialRepliers[i];
          
          // Choose reply category based on post content
          let category = 'general';
          const postContent = post.content ? post.content.toLowerCase() : '';
          
          if (postContent.includes('ai') || postContent.includes('technology') || postContent.includes('code') || 
              postContent.includes('software') || postContent.includes('programming') || postContent.includes('developer')) {
            category = 'tech';
          } else if (postContent.includes('market') || postContent.includes('business') || 
                    postContent.includes('company') || postContent.includes('investment')) {
            category = 'business';
          } else if (postContent.includes('innovation') || postContent.includes('future') || 
                    postContent.includes('new') || postContent.includes('launch')) {
            category = 'innovation';
          } else if (postContent.includes('competitor') || postContent.includes('competition') || 
                    postContent.includes('vs') || postContent.includes('better')) {
            category = 'competition';
          }
          
          // Get random reply from the appropriate category
          const replies = humorousReplies[category];
          const replyIndex = Math.floor(Math.random() * replies.length);
          const replyContent = replies[replyIndex];
          
          // Create the reply
          const reply = await Post.create({
            content: replyContent,
            user: replier._id,
            replyTo: post._id
          });
          
          // Update the original post's replies array
          post.replies.push(reply._id);
          await post.save();
          
          replyCount++;
          console.log(`${replier.name} (@${replier.username}) replied to ${post.user.name}'s post: "${replyContent.substring(0, 30)}..."`);
        }
      }
      
      console.log(`Added ${replyCount} humorous replies.`);
      
      // 3. Add likes to posts and replies
      console.log('Adding likes to posts and replies...');
      let likeCount = 0;
      
      // Get all posts and replies
      const allPosts = await Post.find({
        user: { $in: users.map(u => u._id) }
      });
      
      for (const post of allPosts) {
        // Each user has a 40% chance of liking each post (unless they wrote it)
        for (const user of users) {
          // Skip if user is the author
          if (post.user.equals(user._id)) {
            continue;
          }
          
          // 40% chance of liking
          if (Math.random() < 0.4) {
            // Check if not already liked
            if (!post.likes.includes(user._id)) {
              post.likes.push(user._id);
              likeCount++;
            }
          }
        }
        
        await post.save();
      }
      
      console.log(`Added ${likeCount} likes to posts and replies.`);
      
      console.log('Realistic interactions created successfully!');
    } catch (err) {
      console.error('Error creating realistic interactions:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
