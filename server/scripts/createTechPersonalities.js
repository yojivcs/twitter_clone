require('dotenv').config({ path: '../config/config.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const User = require('../models/User');
const Post = require('../models/Post');

// Tech personalities data
const techPersonalities = [
  {
    name: 'Elon Musk',
    username: 'elonmusk',
    email: 'elon@example.com',
    password: 'password123',
    bio: 'CEO of Tesla, SpaceX, and X | Building a multiplanetary future',
    location: 'Mars & Earth',
    website: 'https://x.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/44196397/1576183471/1500x500',
    tweets: [
      {
        content: "The future of sustainable energy is electric! #Tesla #Sustainability #CleanEnergy",
        hashtags: ['Tesla', 'Sustainability', 'CleanEnergy']
      },
      {
        content: "Mars, here we come!! #SpaceX #Mars #Starship",
        hashtags: ['SpaceX', 'Mars', 'Starship']
      },
      {
        content: "AI is the future, but we need to ensure it's safe for humanity. #AI #AGI #MachineLearning",
        hashtags: ['AI', 'AGI', 'MachineLearning']
      }
    ]
  },
  {
    name: 'Satya Nadella',
    username: 'satyanadella',
    email: 'satya@example.com',
    password: 'password123',
    bio: 'CEO of Microsoft | Cloud, AI, and the future of technology',
    location: 'Redmond, WA',
    website: 'https://microsoft.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/1221837516816306177/_Ld4un5A_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/20571756/1600481842/1500x500',
    tweets: [
      {
        content: "Cloud computing is transforming every industry. Microsoft Azure leads the way in innovation. #Azure #Cloud #Innovation",
        hashtags: ['Azure', 'Cloud', 'Innovation']
      },
      {
        content: "AI and ML are creating new possibilities for businesses worldwide. #AI #MachineLearning #DigitalTransformation",
        hashtags: ['AI', 'MachineLearning', 'DigitalTransformation']
      },
      {
        content: "Excited about the future of Windows and the Microsoft ecosystem! #Windows #Microsoft #Tech",
        hashtags: ['Windows', 'Microsoft', 'Tech']
      }
    ]
  },
  {
    name: 'Sundar Pichai',
    username: 'sundarpichai',
    email: 'sundar@example.com',
    password: 'password123',
    bio: 'CEO of Google and Alphabet | AI, Search, and Android',
    location: 'Mountain View, CA',
    website: 'https://google.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/864282616597405701/M-FEJMZ0_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/14273474/1557175246/1500x500',
    tweets: [
      {
        content: "Google Search is evolving with AI to provide better results for everyone. #Google #Search #AI",
        hashtags: ['Google', 'Search', 'AI']
      },
      {
        content: "Android continues to connect billions of people worldwide. #Android #Mobile #Technology",
        hashtags: ['Android', 'Mobile', 'Technology']
      },
      {
        content: "Quantum computing will revolutionize how we solve complex problems. #Quantum #Computing #Innovation",
        hashtags: ['Quantum', 'Computing', 'Innovation']
      }
    ]
  },
  {
    name: 'Tim Cook',
    username: 'tim_cook',
    email: 'tim@example.com',
    password: 'password123',
    bio: 'CEO of Apple | Innovation, Privacy, and Sustainability',
    location: 'Cupertino, CA',
    website: 'https://apple.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/1535420431766671360/Pwq-1eJc_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/1636590253/1671204972/1500x500',
    tweets: [
      {
        content: "Privacy is a fundamental human right. Apple will always protect your data. #Privacy #Apple #Security",
        hashtags: ['Privacy', 'Apple', 'Security']
      },
      {
        content: "The new iPhone is our most advanced device ever. Can't wait for you to experience it! #iPhone #Apple #Innovation",
        hashtags: ['iPhone', 'Apple', 'Innovation']
      },
      {
        content: "Sustainability is at the core of everything we do at Apple. #Environment #ClimateChange #Sustainability",
        hashtags: ['Environment', 'ClimateChange', 'Sustainability']
      }
    ]
  },
  {
    name: 'Mark Zuckerberg',
    username: 'zuck',
    email: 'mark@example.com',
    password: 'password123',
    bio: 'CEO of Meta | Connecting people through social media and the metaverse',
    location: 'Menlo Park, CA',
    website: 'https://meta.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/486929358120964097/gNLINY67_400x400.png',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/20/1587591677/1500x500',
    tweets: [
      {
        content: "The metaverse is the next frontier in social connection. #Metaverse #VR #AR",
        hashtags: ['Metaverse', 'VR', 'AR']
      },
      {
        content: "Facebook continues to bring people together across the globe. #Facebook #Social #Community",
        hashtags: ['Facebook', 'Social', 'Community']
      },
      {
        content: "AI is transforming how we interact with technology. #AI #MachineLearning #Innovation",
        hashtags: ['AI', 'MachineLearning', 'Innovation']
      }
    ]
  },
  {
    name: 'Jeff Bezos',
    username: 'jeffbezos',
    email: 'jeff@example.com',
    password: 'password123',
    bio: 'Founder of Amazon | Space exploration with Blue Origin',
    location: 'Seattle, WA',
    website: 'https://amazon.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/669103856106668033/UF3cgUk4_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/15506669/1534528920/1500x500',
    tweets: [
      {
        content: "Space is the final frontier. Blue Origin is making space travel accessible for everyone. #BlueOrigin #Space #Exploration",
        hashtags: ['BlueOrigin', 'Space', 'Exploration']
      },
      {
        content: "Amazon continues to innovate for customers worldwide. #Amazon #Ecommerce #Innovation",
        hashtags: ['Amazon', 'Ecommerce', 'Innovation']
      },
      {
        content: "Cloud computing has transformed how businesses operate. #AWS #Cloud #Technology",
        hashtags: ['AWS', 'Cloud', 'Technology']
      }
    ]
  },
  {
    name: 'Lisa Su',
    username: 'lisasu',
    email: 'lisa@example.com',
    password: 'password123',
    bio: 'CEO of AMD | Semiconductors and high-performance computing',
    location: 'Santa Clara, CA',
    website: 'https://amd.com',
    profilePicUrl: 'https://pbs.twimg.com/profile_images/1229440405442420736/BIa-8zmE_400x400.jpg',
    coverPicUrl: 'https://pbs.twimg.com/profile_banners/249085057/1581798393/1500x500',
    tweets: [
      {
        content: "AMD's processors are powering the next generation of computing. #AMD #Ryzen #Computing",
        hashtags: ['AMD', 'Ryzen', 'Computing']
      },
      {
        content: "High-performance computing is essential for solving the world's most complex problems. #HPC #Technology #Innovation",
        hashtags: ['HPC', 'Technology', 'Innovation']
      },
      {
        content: "Gaming technology continues to advance with our latest GPUs. #Gaming #Radeon #Graphics",
        hashtags: ['Gaming', 'Radeon', 'Graphics']
      }
    ]
  },
  {
    name: 'Jensen Huang',
    username: 'jensenhuang',
    email: 'jensen@example.com',
    password: 'password123',
    bio: 'CEO of NVIDIA | AI, Gaming, and GPU acceleration',
    location: 'Santa Clara, CA',
    website: 'https://nvidia.com',
    profilePicUrl: 'https://media.licdn.com/dms/image/D5603AQH_L2NzNfYNEw/profile-displayphoto-shrink_800_800/0/1689359858198?e=2147483647&v=beta&t=JZw9YZTvdyOQ1U8Jn-RNBkCgbKFT3uuO0rh5nrNsCZo',
    coverPicUrl: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/logo-and-brand/01-nvidia-logo-horiz-500x200-2c50-d@2x.png',
    tweets: [
      {
        content: "GPUs are revolutionizing AI and deep learning. #NVIDIA #GPU #AI",
        hashtags: ['NVIDIA', 'GPU', 'AI']
      },
      {
        content: "Gaming graphics continue to reach new levels of realism. #RTX #Gaming #Graphics",
        hashtags: ['RTX', 'Gaming', 'Graphics']
      },
      {
        content: "Accelerated computing is transforming scientific research. #HPC #Science #Computing",
        hashtags: ['HPC', 'Science', 'Computing']
      }
    ]
  }
];

// Function to download an image
async function downloadImage(url, filepath) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
    return null;
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
      const uploadDir = path.join(__dirname, '../public/uploads');
      ensureDirectoryExists(uploadDir);
      
      // Create tech personalities
      let userCount = 0;
      let tweetCount = 0;
      
      for (const person of techPersonalities) {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ 
            $or: [{ email: person.email }, { username: person.username }] 
          });
          
          if (existingUser) {
            console.log(`User ${person.username} already exists. Skipping...`);
            continue;
          }
          
          // Download and save profile picture
          let profilePicturePath = '/images/default-profile.png';
          if (person.profilePicUrl) {
            const filename = `profile-${person.username}-${Date.now()}.jpg`;
            const filepath = path.join(uploadDir, filename);
            await downloadImage(person.profilePicUrl, filepath);
            profilePicturePath = `/uploads/${filename}`;
          }
          
          // Download and save cover picture
          let coverPicturePath = '/images/default-cover.png';
          if (person.coverPicUrl) {
            const filename = `cover-${person.username}-${Date.now()}.jpg`;
            const filepath = path.join(uploadDir, filename);
            await downloadImage(person.coverPicUrl, filepath);
            coverPicturePath = `/uploads/${filename}`;
          }
          
          // Create user
          const user = await User.create({
            name: person.name,
            username: person.username,
            email: person.email,
            password: person.password,
            bio: person.bio,
            location: person.location,
            website: person.website,
            profilePicture: profilePicturePath,
            coverPicture: coverPicturePath
          });
          
          userCount++;
          console.log(`Created tech personality: ${person.name} (${person.username})`);
          
          // Create tweets for this user
          if (person.tweets && person.tweets.length > 0) {
            for (const tweetData of person.tweets) {
              await Post.create({
                content: tweetData.content,
                user: user._id,
                hashtags: tweetData.hashtags || []
              });
              
              tweetCount++;
              console.log(`Created tweet for ${person.username}: "${tweetData.content.substring(0, 30)}..."`);
            }
          }
        } catch (err) {
          console.error(`Error creating tech personality ${person.name}:`, err.message);
        }
      }
      
      // Set up follow relationships between tech personalities
      const users = await User.find({ username: { $in: techPersonalities.map(p => p.username) } });
      
      if (users.length > 1) {
        let followCount = 0;
        
        for (const user of users) {
          // Each user follows 2-5 random other users
          const numFollows = Math.floor(Math.random() * 4) + 2;
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
      }
      
      // Create interactions between tech personalities
      const allPosts = await Post.find({ user: { $in: users.map(u => u._id) } });
      
      if (allPosts.length > 0) {
        let interactionCount = 0;
        
        for (const post of allPosts) {
          // Random users like the post (50% chance per user)
          for (const user of users) {
            if (Math.random() < 0.5 && !post.user.equals(user._id)) {
              if (!post.likes.includes(user._id)) {
                post.likes.push(user._id);
                interactionCount++;
              }
            }
          }
          
          // Random users retweet the post (25% chance per user)
          for (const user of users) {
            if (Math.random() < 0.25 && !post.user.equals(user._id)) {
              if (!post.retweets.includes(user._id)) {
                post.retweets.push(user._id);
                
                // Create a retweet post
                await Post.create({
                  retweetData: post._id,
                  user: user._id
                });
                
                tweetCount++;
                interactionCount++;
                console.log(`User ${user.username} retweeted a post`);
              }
            }
          }
          
          await post.save();
        }
        
        // Create some replies
        for (const post of allPosts) {
          // 30% chance of getting replies
          if (Math.random() < 0.3) {
            // 1-2 random replies
            const numReplies = Math.floor(Math.random() * 2) + 1;
            
            for (let i = 0; i < numReplies; i++) {
              // Random user makes the reply
              const userIndex = Math.floor(Math.random() * users.length);
              const user = users[userIndex];
              
              // Don't reply to your own post
              if (post.user.equals(user._id)) {
                continue;
              }
              
              // Create reply content
              const replyContents = [
                "Completely agree with this perspective!",
                "Interesting thoughts on this topic.",
                "This is exactly what the industry needs right now.",
                "Looking forward to discussing this more.",
                "Great insights as always!",
                "I've been thinking along similar lines.",
                "This is revolutionary for the tech industry.",
                "Your vision on this is spot on.",
                "Can't wait to see how this develops further.",
                "This could change everything in the space."
              ];
              
              const replyIndex = Math.floor(Math.random() * replyContents.length);
              
              // Create the reply post
              const reply = await Post.create({
                content: replyContents[replyIndex],
                user: user._id,
                replyTo: post._id
              });
              
              // Update the original post's replies array
              post.replies.push(reply._id);
              await post.save();
              
              tweetCount++;
              interactionCount++;
              console.log(`User ${user.username} replied to a post`);
            }
          }
        }
        
        console.log(`Interaction setup complete. Created ${interactionCount} interactions.`);
      }
      
      console.log(`Tech personalities creation complete. Created ${userCount} users and ${tweetCount} posts.`);
    } catch (err) {
      console.error('Error creating tech personalities:', err);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
