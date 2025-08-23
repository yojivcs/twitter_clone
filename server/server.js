require('dotenv').config({ path: './server/config/config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const net = require('net');
const updateClientProxy = require('./scripts/updateClientProxy');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const searchRoutes = require('./routes/search');

const messageRoutes = require('./routes/messages');

// Check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        resolve(true); // Port is in use
      })
      .once('listening', () => {
        server.close();
        resolve(false); // Port is free
      })
      .listen(port);
  });
};

// Find available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
  let port = startPort;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      return port;
    }
    console.log(`Port ${port} is in use, trying ${port + 1}...`);
    port++;
    attempts++;
  }

  console.warn(`Could not find an available port after ${maxAttempts} attempts. Using ${port}.`);
  return port;
};

// Initialize Express app
const app = express();
const createServer = async () => {
  const PORT = parseInt(process.env.PORT || '5000', 10);
  // Force use of the configured port instead of finding available port
  const availablePort = PORT;
  
  const server = http.createServer(app);
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000'
  }));
  app.use(helmet());
  app.use(morgan('dev'));

  // Fix for rate limit error
  app.set('trust proxy', 1);

  // Serve static files from the client/public directory
  app.use(express.static(path.join(__dirname, '../client/public')));
  
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use('/api', limiter);

  // Routes
  app.get('/', (req, res) => {
    res.send('Twitter Clone API is running');
  });

  // Setup routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/search', searchRoutes);
  
  app.use('/api/messages', messageRoutes);

  // Make io available to the request object
  app.set('io', io);
  
  // Socket.io connection
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join a room with the user's ID when they authenticate
    socket.on('authenticate', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} authenticated and joined their room`);
      }
    });
    
    // Handle joining a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`Socket joined chat: ${chatId}`);
    });
    
    // Handle leaving a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`Socket left chat: ${chatId}`);
    });
    
    // Handle sending a message
    socket.on('send_message', async (messageData, callback) => {
      try {
        const { sender, recipient, content, isEncrypted, media } = messageData;
        
        // Validate required fields
        if (!sender) {
          throw new Error('Sender ID is required');
        }
        if (!recipient) {
          throw new Error('Recipient ID is required');
        }
        if (!content && (!media || media.length === 0)) {
          throw new Error('Either message content or attachments are required');
        }
        
        console.log('Sending message with data:', { 
          sender, 
          recipient, 
          contentLength: content ? content.length : 0,
          hasAttachments: media && media.length > 0,
          isEncrypted: isEncrypted || false
        });
        
        try {
          // Save message to database using the service
          const { sendMessage } = require('./services/message');
          const result = await sendMessage({
            sender,
            recipient,
            content: content || '',
            isEncrypted: isEncrypted || false,
            attachments: media || []
          });
          
          console.log('Message saved successfully:', result.message._id);
          
          // Emit to recipient
          io.to(`user:${recipient}`).emit('new_message', result.message);
          
          // Emit message notification for red dot indicator
          io.to(`user:${recipient}`).emit('new_message_notification', {
            type: 'new_message',
            sender: {
              _id: result.message.sender._id,
              name: result.message.sender.name,
              username: result.message.sender.username,
              profilePicture: result.message.sender.profilePicture
            },
            conversationId: result.conversation._id
          });
          
          // Emit to conversation room if anyone is listening
          const conversationId = result.conversation._id.toString();
          io.to(`chat:${conversationId}`).emit('message_update', result.message);
          
          // Emit updated conversation list to both users
          io.to(`user:${sender}`).emit('conversation_update');
          io.to(`user:${recipient}`).emit('conversation_update');
          
          // Acknowledge receipt - using both callback and event for compatibility
          const response = { 
            success: true, 
            messageId: result.message._id,
            conversationId: result.conversation._id 
          };
          
          // Send via callback if provided
          if (typeof callback === 'function') {
            callback(response);
          }
          
          // Also emit for clients that don't use callbacks
          socket.emit('message_sent', response);
        } catch (serviceError) {
          console.error('Error in message service:', serviceError);
          const errorResponse = { 
            success: false, 
            error: `Message service error: ${serviceError.message || 'Unknown error'}` 
          };
          
          // Send via callback if provided
          if (typeof callback === 'function') {
            callback(errorResponse);
          }
          
          // Also emit for clients that don't use callbacks
          socket.emit('message_sent', errorResponse);
        }
      } catch (error) {
        console.error('Error handling send_message:', error);
        const errorResponse = {
          success: false, 
          error: `Failed to send message: ${error.message || 'Unknown error'}` 
        };
        
        // Send via callback if provided
        if (typeof callback === 'function') {
          callback(errorResponse);
        }
        
        // Also emit for clients that don't use callbacks
        socket.emit('message_sent', errorResponse);
      }
    });
    
    // Handle notification events
    socket.on('notification', async (notificationData) => {
      try {
        const { createNotification } = require('./services/notification');
        const notification = await createNotification(notificationData);
        
        if (notification) {
          // Emit to recipient
          io.to(`user:${notification.recipient}`).emit('new_notification', notification);
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    });

    // Handle message notifications (for red dot indicator)
    socket.on('message_notification', async (messageData) => {
      try {
        // Emit to recipient to show red dot in messages section
        io.to(`user:${messageData.recipient}`).emit('new_message_notification', {
          type: 'new_message',
          sender: messageData.sender,
          conversationId: messageData.conversationId
        });
      } catch (error) {
        console.error('Error handling message notification:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // MongoDB connection
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

  // Print environment variables for debugging (remove in production)
  console.log('Environment variables loaded:');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });

  // Start server
  server.listen(availablePort, () => {
    console.log(`Server running on port ${availablePort}`);
    
    // If we're using a different port than the default, update client proxy
    if (availablePort !== PORT) {
      console.log(`\nNOTE: Server is using port ${availablePort} instead of default ${PORT}.`);
      
      // Try to automatically update the client's proxy setting
      try {
        const updated = updateClientProxy(availablePort);
        if (updated) {
          console.log('Client proxy has been automatically updated.');
          console.log('Please restart the application with: npm run restart');
        } else {
          console.log('If you\'re using the React development server, you may need to update the proxy in client/package.json to:');
          console.log(`"proxy": "http://localhost:${availablePort}"\n`);
          console.log('Then restart the application with: npm run restart');
        }
      } catch (error) {
        console.log('Could not automatically update client proxy.');
        console.log('If you\'re using the React development server, you may need to update the proxy in client/package.json to:');
        console.log(`"proxy": "http://localhost:${availablePort}"\n`);
        console.log('Then restart the application with: npm run restart');
      }
    }
  });

  return { server, availablePort };
};

// Start the server
createServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 