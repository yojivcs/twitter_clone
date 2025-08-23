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

// Function to format the output in a nice table
function formatTable(data) {
  // Find the longest username for proper spacing
  let maxUsernameLength = 0;
  for (const row of data) {
    if (row.username.length > maxUsernameLength) {
      maxUsernameLength = row.username.length;
    }
  }
  
  // Add some padding
  maxUsernameLength += 2;
  
  // Print header
  console.log('\n' + '='.repeat(80));
  console.log(`${'Username'.padEnd(maxUsernameLength)} | ${'Name'.padEnd(20)} | ${'Followers'.padEnd(10)} | Following`);
  console.log('-'.repeat(80));
  
  // Print data rows
  for (const row of data) {
    console.log(`${row.username.padEnd(maxUsernameLength)} | ${row.name.padEnd(20)} | ${String(row.followers).padEnd(10)} | ${row.following}`);
  }
  
  console.log('='.repeat(80) + '\n');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get tech personalities with populated followers and following
      const users = await User.find({ username: { $in: techUsernames } })
        .populate({
          path: 'followers',
          select: 'name username',
          options: { limit: 20 } // Ensure we get all followers
        })
        .populate({
          path: 'following',
          select: 'name username',
          options: { limit: 20 } // Ensure we get all following
        });
      
      if (users.length === 0) {
        console.log('No tech personalities found.');
        return;
      }
      
      console.log(`\n===== TECH PERSONALITIES SOCIAL CONNECTIONS =====\n`);
      
      // Create a summary table
      const summaryData = users.map(user => ({
        username: '@' + user.username,
        name: user.name,
        followers: user.followers.length,
        following: user.following.length
      }));
      
      formatTable(summaryData);
      
      // For each user, show detailed followers and following
      for (const user of users) {
        console.log(`\n===== ${user.name} (@${user.username}) =====`);
        
        // Show followers
        console.log('\nFOLLOWERS:');
        if (user.followers.length === 0) {
          console.log('  No followers yet.');
        } else {
          user.followers.forEach((follower, index) => {
            console.log(`  ${index + 1}. ${follower.name} (@${follower.username})`);
          });
        }
        
        // Show following
        console.log('\nFOLLOWING:');
        if (user.following.length === 0) {
          console.log('  Not following anyone yet.');
        } else {
          user.following.forEach((followed, index) => {
            console.log(`  ${index + 1}. ${followed.name} (@${followed.username})`);
          });
        }
        
        console.log('\n' + '-'.repeat(50));
      }
      
      console.log('\nSocial connections displayed successfully!');
    } catch (err) {
      console.error('Error displaying social connections:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
