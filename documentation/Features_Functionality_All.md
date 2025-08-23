# Twitter Clone

A full-featured Twitter (X) clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### User Authentication
- [x] Sign up with email
- [x] Login/Logout
- [ ] Password reset
- [x] JWT authentication

### User Profile
- [x] Profile picture
- [x] Bio and personal information
- [x] Follower/Following lists
- [x] Edit profile

### Posts (Tweets)
- [x] Create, read, update, delete posts
- [x] Like and retweet
- [x] Reply to posts
- [x] Media uploads (images & videos)
- [x] Character limit

### Timeline
- [x] Home timeline (posts from followed users)
- [x] Explore page (trending/popular posts)
- [x] User profile timeline

### Interaction
- [x] Follow/Unfollow users
- [x] Direct messaging

### UI/UX
- [x] Responsive design (mobile-first)
- [x] Light/Dark theme toggle

### Additional Features
- [x] Hashtags and trending topics
- [x] Search functionality

## Tech Stack

### Frontend
- [x] React.js
- [x] Redux for state management
- [x] React Router for navigation
- [x] Styled Components
- [x] Axios for API requests

### Backend
- [x] Node.js with Express
- [x] MongoDB with Mongoose
- [x] JWT for authentication
- [x] Socket.io for real-time features

### Security Features
- [x] Password hashing
- [x] Input validation
- [x] XSS protection
- [x] Rate limiting
- [x] CORS configuration

## Project Structure

```
twitter-clone/
├── client/               # Frontend React application
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # Reusable components
│       ├── context/      # Context API files
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       ├── redux/        # Redux store, actions, reducers
│       ├── services/     # API service calls
│       ├── styles/       # Global styles and themes
│       └── utils/        # Utility functions
├── server/               # Backend Node.js/Express application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── utils/            # Utility functions
└── .env                  # Environment variables (gitignored)
```

## Development Roadmap

### Phase 1: Setup and Basic Features
- [x] Set up project structure
- [x] Implement user authentication
- [x] Create basic post functionality
- [x] Develop user profile pages

### Phase 2: Core Twitter Features
- [x] Implement timeline functionality
- [x] Add like, retweet, and reply features
- [x] Create follow/unfollow system
- [ ] Build notification system

### Phase 3: UI/UX and Advanced Features
- [x] Implement responsive design
- [x] Add light/dark theme toggle
- [x] Develop search functionality
- [x] Add hashtags and trending topics

### Phase 4: Refinement and Deployment
- [ ] Performance optimization
- [ ] Security enhancements
- [ ] Testing
- [ ] Deployment

## MERN Stack Setup Requirements

### Required Software
- [x] Node.js (v14+) - [Download](https://nodejs.org/)
- [x] MongoDB - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- [x] npm (comes with Node.js) or yarn - [Yarn Download](https://yarnpkg.com/getting-started/install)
- [x] Git - [Download](https://git-scm.com/downloads)

### Recommended Development Tools
- [x] VS Code - [Download](https://code.visualstudio.com/)
- [ ] MongoDB Compass (GUI for MongoDB) - [Download](https://www.mongodb.com/products/compass)
- [ ] Postman (API testing) - [Download](https://www.postman.com/downloads/)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
   ```
   git clone https://github.com/yourusername/twitter-clone.git
   cd twitter-clone
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Create a config.env file in the server/config directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/twitter-clone
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ```

### Running the Application
1. Start MongoDB (if running locally)
   ```
   mongod
   ```

2. Start the server (in the server directory)
   ```
   npm run dev
   ```

3. Start the client (in the client directory)
   ```
   npm start
   ```

4. Access the application at http://localhost:3000

## Running in Development Mode
To run both the server and client concurrently, you can use the following command from the root directory (after setting up a script in a root package.json):
```
npm run dev
```

## Future Enhancements
- [ ] Voice tweets
- [ ] Spaces (audio rooms)
- [ ] Advanced analytics
- [ ] Verification system
- [ ] Monetization features

## License
MIT 