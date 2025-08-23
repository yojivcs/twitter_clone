require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
  .then(() => console.log('MongoDB connected for chat clearing'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const clearChats = async () => {
  try {
    console.log('Clearing all messages...');
    const messagesResult = await Message.deleteMany({});
    console.log(`Deleted ${messagesResult.deletedCount} messages`);
    
    console.log('Clearing all conversations...');
    const conversationsResult = await Conversation.deleteMany({});
    console.log(`Deleted ${conversationsResult.deletedCount} conversations`);
    
    console.log('All chat data has been cleared successfully');
  } catch (error) {
    console.error('Error clearing chat data:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

clearChats();
