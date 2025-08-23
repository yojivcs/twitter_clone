require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get Mark Zuckerberg's user account
      const zuckerberg = await User.findOne({ username: 'zuck' });
      
      if (!zuckerberg) {
        console.log('Mark Zuckerberg account not found.');
        return;
      }
      
      console.log(`Found Mark Zuckerberg's account with ${zuckerberg.followers.length} followers.`);
      
      // Get other tech personalities
      const techUsers = await User.find({ 
        username: { 
          $in: ['elonmusk', 'jeffbezos', 'tim_cook', 'sundarpichai'] 
        } 
      });
      
      // Add followers to Mark Zuckerberg
      let addedCount = 0;
      
      for (const user of techUsers) {
        // Check if user is already following Zuckerberg
        if (!zuckerberg.followers.includes(user._id)) {
          // Add user as follower
          zuckerberg.followers.push(user._id);
          
          // Add Zuckerberg to user's following list
          if (!user.following.includes(zuckerberg._id)) {
            user.following.push(zuckerberg._id);
            await user.save();
          }
          
          addedCount++;
          console.log(`Added ${user.name} (@${user.username}) as a follower of Mark Zuckerberg.`);
        }
      }
      
      await zuckerberg.save();
      
      console.log(`Added ${addedCount} new followers to Mark Zuckerberg's account.`);
      console.log(`Mark Zuckerberg now has ${zuckerberg.followers.length} followers.`);
      
    } catch (err) {
      console.error('Error fixing Zuckerberg followers:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });


