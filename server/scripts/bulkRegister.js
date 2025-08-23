require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

// Sample users data
const users = [
  {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Software developer passionate about JavaScript',
    location: 'New York, USA',
    website: 'https://johndoe.com'
  },
  {
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'UX/UI Designer | Traveler | Coffee lover',
    location: 'San Francisco, USA',
    website: 'https://janesmith.com'
  },
  {
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@example.com',
    password: 'password123',
    bio: 'Tech enthusiast and gamer',
    location: 'London, UK',
    website: 'https://alexjohnson.com'
  },
  {
    name: 'Maria Garcia',
    username: 'mariag',
    email: 'maria@example.com',
    password: 'password123',
    bio: 'Digital marketer and content creator',
    location: 'Madrid, Spain',
    website: 'https://mariagarcia.com'
  },
  {
    name: 'David Kim',
    username: 'davidk',
    email: 'david@example.com',
    password: 'password123',
    bio: 'Photographer | Nature lover | Tech geek',
    location: 'Seoul, South Korea',
    website: 'https://davidkim.com'
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Clear existing users (optional)
      // await User.deleteMany({});
      // console.log('Existing users cleared');
      
      // Register users
      let successCount = 0;
      for (const userData of users) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ 
            $or: [{ email: userData.email }, { username: userData.username }] 
          });
          
          if (existingUser) {
            console.log(`User ${userData.username} or email ${userData.email} already exists. Skipping...`);
            continue;
          }
          
          // Create user
          await User.create(userData);
          successCount++;
          console.log(`User ${userData.username} registered successfully`);
        } catch (err) {
          console.error(`Error registering user ${userData.username}:`, err.message);
        }
      }
      
      console.log(`Bulk registration complete. ${successCount} users registered.`);
    } catch (err) {
      console.error('Error during bulk registration:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 