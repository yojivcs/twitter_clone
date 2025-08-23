require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

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
      const clientUploadDir = path.join(__dirname, '../../client/public/uploads');
      
      ensureDirectoryExists(serverUploadDir);
      ensureDirectoryExists(clientUploadDir);
      
      // Get all users
      const users = await User.find({});
      
      if (users.length === 0) {
        console.log('No users found.');
        return;
      }
      
      console.log(`Found ${users.length} users.`);
      
      // Update profile and cover pictures for each user
      for (const user of users) {
        // Generate unique filenames for profile and cover pictures
        const profileFilename = `profile-${user.username}-${Date.now()}.png`;
        const coverFilename = `cover-${user.username}-${Date.now()}.jpg`;
        
        // Copy default images to both server and client upload directories
        const defaultProfileSource = path.join(__dirname, '../../client/public/images/default-profile.png');
        const defaultCoverSource = path.join(__dirname, '../../client/public/images/default-cover.png');
        
        const serverProfileDest = path.join(serverUploadDir, profileFilename);
        const serverCoverDest = path.join(serverUploadDir, coverFilename);
        
        const clientProfileDest = path.join(clientUploadDir, profileFilename);
        const clientCoverDest = path.join(clientUploadDir, coverFilename);
        
        // Copy to server uploads
        const serverProfileCopied = copyFile(defaultProfileSource, serverProfileDest);
        const serverCoverCopied = copyFile(defaultCoverSource, serverCoverDest);
        
        // Copy to client uploads
        const clientProfileCopied = copyFile(defaultProfileSource, clientProfileDest);
        const clientCoverCopied = copyFile(defaultCoverSource, clientCoverDest);
        
        // Set the paths for the database
        if (serverProfileCopied && clientProfileCopied) {
          user.profilePicture = `/uploads/${profileFilename}`;
          console.log(`Updated profile picture for ${user.username}: ${user.profilePicture}`);
        }
        
        if (serverCoverCopied && clientCoverCopied) {
          user.coverPicture = `/uploads/${coverFilename}`;
          console.log(`Updated cover picture for ${user.username}: ${user.coverPicture}`);
        }
        
        await user.save();
        console.log(`Saved updated pictures for ${user.username}`);
      }
      
      console.log('Profile and cover pictures updated successfully for all users.');
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
