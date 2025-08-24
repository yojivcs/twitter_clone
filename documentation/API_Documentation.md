# Nighter-Twitter Clone API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [User Routes](#user-routes)
  - [Post Routes](#post-routes)
  - [Search Routes](#search-routes)
  - [Message Routes](#message-routes)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [WebSocket Events](#websocket-events)
- [File Upload](#file-upload)
- [Examples](#examples)

## Overview

The Nighter-Twitter Clone API is a RESTful API built with Node.js, Express, and MongoDB. It provides endpoints for user authentication, social media functionality, real-time messaging, and content management. The API supports JWT authentication, file uploads, and real-time communication via WebSocket.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected routes require a valid JWT token in the Authorization header.

### JWT Token Format
```
Authorization: Bearer <your_jwt_token>
```

### Getting a JWT Token
1. Register or login using the authentication endpoints
2. The response will include a JWT token
3. Include this token in subsequent requests

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePicture": "/images/default-profile.png",
    "coverPicture": "/images/default-cover.png",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "bio": "Software Developer",
  "location": "San Francisco",
  "website": "https://johndoe.com",
  "profilePicture": "/images/profile-123.jpg",
  "coverPicture": "/images/cover-123.jpg",
  "followers": [],
  "following": [],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### GET `/api/auth/logout`
Logout current user (token invalidation).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Routes

#### GET `/api/users`
Get all users (public endpoint).

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 20)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "profilePicture": "/images/profile-123.jpg",
    "coverPicture": "/images/cover-123.jpg"
  }
]
```

#### GET `/api/users/:username`
Get user profile by username.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Software Developer",
  "location": "San Francisco",
  "website": "https://johndoe.com",
  "profilePicture": "/images/profile-123.jpg",
  "coverPicture": "/images/cover-123.jpg",
  "followers": [],
  "following": [],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### PUT `/api/users`
Update current user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "bio": "Full Stack Developer",
  "location": "New York",
  "website": "https://johnsmith.com"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "username": "johndoe",
    "bio": "Full Stack Developer",
    "location": "New York",
    "website": "https://johnsmith.com"
  }
}
```

#### PUT `/api/users/profile-picture`
Upload profile picture.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```
FormData with 'profilePicture' field containing image file
```

**Response:**
```json
{
  "success": true,
  "profilePicture": "/uploads/profile-123.jpg"
}
```

#### PUT `/api/users/cover-picture`
Upload cover picture.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```
FormData with 'coverPicture' field containing image file
```

**Response:**
```json
{
  "success": true,
  "coverPicture": "/uploads/cover-123.jpg"
}
```

#### PUT `/api/users/:id/follow`
Follow or unfollow a user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User followed successfully"
}
```

#### GET `/api/users/:username/posts`
Get posts by a specific user.

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 20)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "content": "Hello Twitter!",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "/images/profile-123.jpg"
    },
    "likes": [],
    "retweets": [],
    "replies": [],
    "hashtags": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET `/api/users/:username/followers`
Get user's followers list.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "username": "janesmith",
    "profilePicture": "/images/profile-456.jpg"
  }
]
```

#### GET `/api/users/:username/following`
Get users that the specified user is following.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "username": "janesmith",
    "profilePicture": "/images/profile-456.jpg"
  }
]
```

#### GET `/api/users/random/suggestions`
Get random users for suggestions.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 6)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Jane Smith",
    "username": "janesmith",
    "profilePicture": "/images/profile-456.jpg"
  }
]
```

### Post Routes

#### GET `/api/posts`
Get all posts (timeline).

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 20)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "content": "Hello Twitter!",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "/images/profile-123.jpg"
    },
    "media": [],
    "likes": [],
    "retweets": [],
    "replies": [],
    "hashtags": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### POST `/api/posts`
Create a new post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```
FormData with:
- content: Post text content
- media: Array of media files (optional, max 4 files)
```

**Response:**
```json
{
  "success": true,
  "post": {
    "_id": "507f1f77bcf86cd799439012",
    "content": "Hello Twitter!",
    "user": "507f1f77bcf86cd799439011",
    "media": [],
    "hashtags": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET `/api/posts/:id`
Get a specific post by ID.

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "content": "Hello Twitter!",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "profilePicture": "/images/profile-123.jpg"
  },
  "media": [],
  "likes": [],
  "retweets": [],
  "replies": [],
  "hashtags": [],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### PUT `/api/posts/:id`
Update a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```
FormData with:
- content: Updated post text content
- media: Array of media files (optional, max 4 files)
```

**Response:**
```json
{
  "success": true,
  "post": {
    "_id": "507f1f77bcf86cd799439012",
    "content": "Updated content!",
    "user": "507f1f77bcf86cd799439011",
    "media": [],
    "hashtags": [],
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

#### DELETE `/api/posts/:id`
Delete a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### GET `/api/posts/:id/replies`
Get replies to a specific post.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "content": "Great post!",
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jane Smith",
      "username": "janesmith",
      "profilePicture": "/images/profile-456.jpg"
    },
    "replyTo": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T12:30:00.000Z"
  }
]
```

#### PUT `/api/posts/:id/like`
Like or unlike a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Post liked successfully"
}
```

#### PUT `/api/posts/:id/retweet`
Retweet a post.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Post retweeted successfully"
}
```

#### POST `/api/posts/:id/vote/:optionIndex`
Vote on a poll option.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully"
}
```

### Search Routes

#### GET `/api/search/trending`
Get trending topics and hashtags.

**Response:**
```json
[
  {
    "category": "Technology",
    "title": "#ReactJS",
    "tweets": 150,
    "score": "1250.50"
  },
  {
    "category": "Sports",
    "title": "#Football",
    "tweets": 89,
    "score": "890.25"
  }
]
```

#### GET `/api/search/posts`
Search posts by content or hashtags.

**Query Parameters:**
- `q` (required): Search query

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "content": "Check out this React tutorial!",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "/images/profile-123.jpg"
    },
    "hashtags": ["react", "tutorial"],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### GET `/api/search/users`
Search users by name or username.

**Query Parameters:**
- `q` (required): Search query

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "profilePicture": "/images/profile-123.jpg"
  }
]
```

#### GET `/api/search/hashtags`
Get all hashtags with counts.

**Response:**
```json
[
  {
    "name": "react",
    "count": 150
  },
  {
    "name": "javascript",
    "count": 89
  }
]
```

#### GET `/api/search/random-users`
Get random users for discovery.

**Query Parameters:**
- `limit` (optional): Number of users to return (default: 6)
- `excludeCurrentUser` (optional): User ID to exclude from results

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe",
    "profilePicture": "/images/profile-123.jpg",
    "coverPicture": "/images/cover-123.jpg",
    "bio": "Software Developer",
    "followersCount": 150,
    "followingCount": 89,
    "postsCount": 45
  }
]
```

### Message Routes

#### POST `/api/messages`
Send a new message.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "recipient": "507f1f77bcf86cd799439013",
  "content": "Hello! How are you?",
  "isEncrypted": false
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "507f1f77bcf86cd799439015",
    "sender": "507f1f77bcf86cd799439011",
    "recipient": "507f1f77bcf86cd799439013",
    "content": "Hello! How are you?",
    "isEncrypted": false,
    "attachments": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/messages/upload`
Upload message attachments.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```
FormData with 'files' field containing up to 4 files
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "url": "/uploads/file-123.jpg",
      "type": "image",
      "filename": "file-123.jpg"
    }
  ]
}
```

#### GET `/api/messages`
Get all conversations for current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "participants": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "username": "johndoe",
        "profilePicture": "/images/profile-123.jpg"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Jane Smith",
        "username": "janesmith",
        "profilePicture": "/images/profile-456.jpg"
      }
    ],
    "lastMessage": {
      "content": "Hello! How are you?",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "unreadCount": 1
  }
]
```

#### GET `/api/messages/unread/count`
Get count of unread messages.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "unreadCount": 5
}
```

#### GET `/api/messages/:userId`
Get messages between current user and specified user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "sender": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "/images/profile-123.jpg"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "username": "janesmith",
      "profilePicture": "/images/profile-456.jpg"
    },
    "content": "Hello! How are you?",
    "isEncrypted": false,
    "attachments": [],
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### DELETE `/api/messages/:conversationId`
Delete a conversation.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required, max 50 chars),
  username: String (required, unique, max 15 chars),
  email: String (required, unique, email format),
  password: String (required, min 6 chars, hashed),
  bio: String (max 160 chars),
  location: String (max 30 chars),
  website: String (max 100 chars),
  profilePicture: String (default: default image),
  coverPicture: String (default: default image),
  followers: [ObjectId references to User],
  following: [ObjectId references to User],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### Post Model
```javascript
{
  _id: ObjectId,
  content: String (max 280 chars, required if not retweet),
  user: ObjectId reference to User (required),
  media: [{
    url: String (required),
    type: String (enum: 'image', 'video', required),
    filename: String (required)
  }],
  likes: [ObjectId references to User],
  retweets: [ObjectId references to User],
  retweetData: ObjectId reference to Post,
  replyTo: ObjectId reference to Post,
  replies: [ObjectId references to Post],
  hashtags: [String],
  poll: {
    options: [{
      text: String (max 25 chars),
      votes: [ObjectId references to User]
    }],
    endsAt: Date (required),
    closed: Boolean (default: false)
  },
  createdAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  sender: ObjectId reference to User (required),
  recipient: ObjectId reference to User (required),
  content: String,
  isEncrypted: Boolean (default: false),
  attachments: [{
    url: String,
    type: String,
    filename: String
  }],
  createdAt: Date
}
```

### Conversation Model
```javascript
{
  _id: ObjectId,
  participants: [ObjectId references to User],
  lastMessage: {
    content: String,
    createdAt: Date
  },
  unreadCount: Number
}
```

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes.

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 status code with appropriate message

## WebSocket Events

The API supports real-time communication via Socket.IO:

### Connection Events
- `authenticate(userId)` - Authenticate user and join user room
- `join_chat(chatId)` - Join a specific chat room
- `leave_chat(chatId)` - Leave a specific chat room

### Message Events
- `send_message(messageData, callback)` - Send a new message
- `new_message` - Receive new message notification
- `new_message_notification` - Receive message notification for UI updates
- `message_update` - Receive updated message in chat room
- `conversation_update` - Receive conversation list updates

## File Upload

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, MOV, AVI
- **Maximum Size**: 5MB per file
- **Maximum Files**: 4 files per request

### Upload Endpoints
- Profile Picture: `/api/users/profile-picture`
- Cover Picture: `/api/users/cover-picture`
- Post Media: `/api/posts`
- Message Attachments: `/api/messages/upload`

### File Storage
- Files are stored in the `/uploads` directory
- Unique filenames are generated to prevent conflicts
- File URLs are returned for client access

## Examples

### Complete Authentication Flow
```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token } = await registerResponse.json();

// 2. Use token for authenticated requests
const profileResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Creating a Post with Media
```javascript
const formData = new FormData();
formData.append('content', 'Check out this amazing photo!');
formData.append('media', imageFile);

const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Real-time Messaging
```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', userId);

// Join chat room
socket.emit('join_chat', conversationId);

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message received:', message);
});

// Send message
socket.emit('send_message', {
  sender: userId,
  recipient: recipientId,
  content: 'Hello!',
  isEncrypted: false
}, (response) => {
  console.log('Message sent:', response);
});
```

### Search Implementation
```javascript
// Search posts
const searchPosts = async (query) => {
  const response = await fetch(`/api/search/posts?q=${encodeURIComponent(query)}`);
  const posts = await response.json();
  return posts;
};

// Get trending topics
const getTrending = async () => {
  const response = await fetch('/api/search/trending');
  const trending = await response.json();
  return trending;
};
```

This comprehensive API documentation covers all endpoints, data models, authentication, and usage examples for the Nighter-Twitter Clone API. The API provides a robust foundation for building social media applications with real-time features, file uploads, and comprehensive search functionality.
