# Database Transfer Guide

This guide explains how to transfer your Twitter Clone database from one laptop to another.

## Method 1: Using the Export/Import Scripts (Recommended)

### Step 1: Export from Current Laptop

1. **Make sure MongoDB is running** on your current laptop
2. **Run the export script:**
   ```bash
   cd server
   node scripts/exportDatabase.js
   ```
3. **This will create an `exports` folder** in your server directory containing:
   - `users.json` - All user accounts
   - `posts.json` - All posts and tweets
   - `messages.json` - All chat messages
   - `conversations.json` - Chat conversations
   - `notifications.json` - User notifications
   - `importDatabase.js` - Import script for the new laptop

### Step 2: Transfer Files

1. **Copy the entire `exports` folder** to your new laptop
2. **Transfer methods:**
   - USB drive
   - Cloud storage (Google Drive, Dropbox, OneDrive)
   - Email (if files are small)
   - Network transfer

### Step 3: Import on New Laptop

1. **Install MongoDB** on your new laptop
2. **Start MongoDB service**
3. **Copy the `exports` folder** to your new laptop's `server` directory
4. **Run the import script:**
   ```bash
   cd server
   node exports/importDatabase.js
   ```

## Method 2: MongoDB Native Tools

### Export (Current Laptop)
```bash
# Export entire database
mongodump --db twitter-clone --out C:\backup

# Or export specific collections
mongoexport --db twitter-clone --collection users --out C:\backup\users.json
mongoexport --db twitter-clone --collection posts --out C:\backup\posts.json
mongoexport --db twitter-clone --collection messages --out C:\backup\messages.json
```

### Import (New Laptop)
```bash
# Import entire database
mongorestore --db twitter-clone C:\backup\twitter-clone

# Or import specific collections
mongoimport --db twitter-clone --collection users C:\backup\users.json
mongoimport --db twitter-clone --collection posts C:\backup\posts.json
mongoimport --db twitter-clone --collection messages C:\backup\messages.json
```

## Method 3: Copy MongoDB Data Directory

1. **Stop MongoDB** on both laptops
2. **Copy the data directory** (usually `C:\data\db` or MongoDB installation folder)
3. **Paste to same location** on new laptop
4. **Start MongoDB** on new laptop

## What Gets Transferred

✅ **User accounts** - All registered users with profiles  
✅ **Posts and tweets** - All content with likes, retweets, replies  
✅ **Messages** - All chat conversations and messages  
✅ **Follow relationships** - Who follows whom  
✅ **Notifications** - User activity notifications  
✅ **Media files** - Profile pictures, cover photos, post media  

⚠️ **Note:** Media files in the `uploads` folder need to be transferred separately

## Troubleshooting

### Export Issues
- Make sure MongoDB is running
- Check database connection in `config.env`
- Ensure you have read permissions

### Import Issues
- Make sure MongoDB is running on new laptop
- Check database connection
- Ensure you have write permissions
- Clear existing data if needed: `db.dropDatabase()`

### Media Files
- Copy the `server/public/uploads` folder separately
- Or copy the `client/public/uploads` folder
- Ensure file paths match between laptops

## Quick Commands

```bash
# Export everything
node scripts/exportDatabase.js

# Import everything  
node exports/importDatabase.js

# Check MongoDB status
net start MongoDB

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"
```

## After Import

1. **Start your server:** `npm start`
2. **Start your client:** `npm start`
3. **Test login** with existing accounts
4. **Verify data** appears correctly

Your database should now be identical on both laptops!
