# Tech Personalities Generator for Twitter Clone

This script creates realistic tech industry personalities in your Twitter clone application, complete with profile pictures, cover photos, tweets with hashtags, and social interactions.

## Features

- Creates accounts for well-known tech industry figures
- Downloads and sets real profile pictures and cover photos
- Generates realistic tweets with relevant hashtags
- Creates follow relationships between personalities
- Adds likes, retweets, and replies to simulate engagement

## Prerequisites

Before running this script, ensure you have:

1. Node.js installed
2. MongoDB running
3. The Twitter Clone application properly set up
4. Required npm packages installed:
   - axios (for downloading images)

## Installation

If you don't have axios installed, run:

```bash
cd server
npm install axios
```

## Usage

Run the script from the server directory:

```bash
cd server
node scripts/createTechPersonalities.js
```

## Tech Personalities Included

The script creates accounts for:

1. Elon Musk (Tesla, SpaceX)
2. Satya Nadella (Microsoft)
3. Sundar Pichai (Google, Alphabet)
4. Tim Cook (Apple)
5. Mark Zuckerberg (Meta)
6. Jeff Bezos (Amazon, Blue Origin)
7. Lisa Su (AMD)
8. Jensen Huang (NVIDIA)

## Customization

You can easily modify the `techPersonalities` array in the script to:

- Add more tech personalities
- Change profile information
- Add different tweets
- Modify profile/cover images

## Important Notes

1. This script will not create duplicate accounts if they already exist
2. Images are downloaded from URLs and stored in your server's uploads directory
3. Passwords are set to 'password123' for all accounts (for development only)
4. The script creates follow relationships and interactions between the personalities

## After Running

After running this script, you should see:

1. New user accounts in your database
2. Profile and cover images in your uploads directory
3. Tweets, likes, retweets, and replies from these accounts

You can now log in as any of these personalities using their email and the password 'password123'.

## Troubleshooting

If you encounter issues:

1. Check MongoDB connection
2. Ensure upload directories are writable
3. Check network connectivity for image downloads
4. Verify that the User and Post models match the expected schema
