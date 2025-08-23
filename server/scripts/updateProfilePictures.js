require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

// Function to copy a file
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    console.error(`Error copying file from ${source} to ${destination}:`, error.message);
    return false;
  }
}

// Function to ensure upload directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Ensure upload directories exist
      const serverUploadDir = path.join(__dirname, '../public/uploads');
      ensureDirectoryExists(serverUploadDir);
      
      // Get users by username
      const users = await User.find({ username: { $in: techUsernames } });
      
      if (users.length === 0) {
        console.log('No tech personalities found.');
        return;
      }
      
      console.log(`Found ${users.length} tech personalities.`);
      
      // Update profile and cover pictures for each user
      for (const user of users) {
        // Generate unique filenames for profile and cover pictures
        const profileFilename = `profile-${user.username}-${Date.now()}.png`;
        const coverFilename = `cover-${user.username}-${Date.now()}.jpg`;
        
        // Copy default images to the uploads directory with new names
        const defaultProfileSource = path.join(__dirname, '../../client/public/images/default-profile.png');
        const defaultCoverSource = path.join(__dirname, '../../client/public/images/default-cover.png');
        
        const profileDestination = path.join(serverUploadDir, profileFilename);
        const coverDestination = path.join(serverUploadDir, coverFilename);
        
        const profileCopied = copyFile(defaultProfileSource, profileDestination);
        const coverCopied = copyFile(defaultCoverSource, coverDestination);
        
        // Set the paths for the database
        if (profileCopied) {
          user.profilePicture = `/uploads/${profileFilename}`;
          console.log(`Updated profile picture for ${user.username}: ${user.profilePicture}`);
        }
        
        if (coverCopied) {
          user.coverPicture = `/uploads/${coverFilename}`;
          console.log(`Updated cover picture for ${user.username}: ${user.coverPicture}`);
        }
        
        await user.save();
        console.log(`Saved updated pictures for ${user.username}`);
      }
      
      console.log('Profile and cover pictures updated successfully.');
    } catch (err) {
      console.error('Error updating profile pictures:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
