require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

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
      
      // Set up follow relationships
      let followCount = 0;
      
      for (const user of users) {
        // Each user follows 1-3 random users
        const numFollows = Math.floor(Math.random() * 3) + 1;
        const potentialFollows = users.filter(u => !u._id.equals(user._id));
        
        // Shuffle the potential follows array
        for (let i = potentialFollows.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [potentialFollows[i], potentialFollows[j]] = [potentialFollows[j], potentialFollows[i]];
        }
        
        // Follow the first numFollows users
        for (let i = 0; i < Math.min(numFollows, potentialFollows.length); i++) {
          const userToFollow = potentialFollows[i];
          
          // Check if already following
          if (!user.following.includes(userToFollow._id)) {
            user.following.push(userToFollow._id);
            userToFollow.followers.push(user._id);
            
            await userToFollow.save();
            followCount++;
            console.log(`User ${user.username} is now following ${userToFollow.username}`);
          }
        }
        
        await user.save();
      }
      
      console.log(`Follow setup complete. Created ${followCount} follow relationships.`);
    } catch (err) {
      console.error('Error setting up follows:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 