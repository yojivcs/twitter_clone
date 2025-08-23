require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get all tech personalities
      const users = await User.find({ username: { $in: techUsernames } });
      
      if (users.length === 0) {
        console.log('No tech personalities found.');
        return;
      }
      
      console.log(`Found ${users.length} tech personalities.`);
      
      // Create a balanced follow network
      let totalNewFollows = 0;
      
      // For each user, ensure they follow and are followed by at least 5-7 other users
      for (const user of users) {
        // Get current follow counts
        const currentFollowingCount = user.following.length;
        const currentFollowersCount = user.followers.length;
        
        console.log(`\n${user.name} (@${user.username})`);
        console.log(`- Currently following: ${currentFollowingCount}`);
        console.log(`- Current followers: ${currentFollowersCount}`);
        
        // Target counts (aim for balanced network)
        const targetFollowingCount = 7;
        const targetFollowersCount = 7;
        
        // Add more following relationships if needed
        if (currentFollowingCount < targetFollowingCount) {
          const needToFollow = targetFollowingCount - currentFollowingCount;
          console.log(`- Needs to follow ${needToFollow} more users`);
          
          // Find users that this user is not yet following
          const potentialToFollow = users.filter(otherUser => 
            !otherUser._id.equals(user._id) && 
            !user.following.some(id => id.equals(otherUser._id))
          );
          
          // Shuffle the potential users
          for (let i = potentialToFollow.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialToFollow[i], potentialToFollow[j]] = [potentialToFollow[j], potentialToFollow[i]];
          }
          
          // Add new following relationships
          let addedFollowing = 0;
          for (let i = 0; i < Math.min(needToFollow, potentialToFollow.length); i++) {
            const userToFollow = potentialToFollow[i];
            
            // Add following relationship
            user.following.push(userToFollow._id);
            userToFollow.followers.push(user._id);
            
            await userToFollow.save();
            
            console.log(`  → Now following: ${userToFollow.name} (@${userToFollow.username})`);
            addedFollowing++;
            totalNewFollows++;
          }
          
          await user.save();
          console.log(`- Added ${addedFollowing} new following relationships`);
        }
        
        // Add more followers if needed (by making other users follow this user)
        if (currentFollowersCount < targetFollowersCount) {
          const needFollowers = targetFollowersCount - currentFollowersCount;
          console.log(`- Needs ${needFollowers} more followers`);
          
          // Find users that are not yet following this user
          const potentialFollowers = users.filter(otherUser => 
            !otherUser._id.equals(user._id) && 
            !user.followers.some(id => id.equals(otherUser._id))
          );
          
          // Shuffle the potential followers
          for (let i = potentialFollowers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialFollowers[i], potentialFollowers[j]] = [potentialFollowers[j], potentialFollowers[i]];
          }
          
          // Add new follower relationships
          let addedFollowers = 0;
          for (let i = 0; i < Math.min(needFollowers, potentialFollowers.length); i++) {
            const follower = potentialFollowers[i];
            
            // Add follower relationship
            user.followers.push(follower._id);
            follower.following.push(user._id);
            
            await follower.save();
            
            console.log(`  ← New follower: ${follower.name} (@${follower.username})`);
            addedFollowers++;
            totalNewFollows++;
          }
          
          await user.save();
          console.log(`- Added ${addedFollowers} new followers`);
        }
      }
      
      console.log(`\nBalanced follow relationships successfully!`);
      console.log(`Added a total of ${totalNewFollows} new follow relationships.`);
      
    } catch (err) {
      console.error('Error balancing follow relationships:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
