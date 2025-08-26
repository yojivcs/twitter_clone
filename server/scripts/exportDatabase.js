const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import your models
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const connectDB = require('../config/db');

const exportDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Connected to database. Starting export...');
    
    // Create export directory
    const exportDir = path.join(__dirname, '..', 'exports');
    await fs.mkdir(exportDir, { recursive: true });
    
    // Export collections
    const collections = [
      { name: 'users', model: User },
      { name: 'posts', model: Post },
      { name: 'messages', model: Message },
      { name: 'conversations', model: Conversation },
      { name: 'notifications', model: Notification }
    ];
    
    for (const collection of collections) {
      console.log(`Exporting ${collection.name}...`);
      
      const data = await collection.model.find({});
      
      // Convert to plain objects and remove MongoDB-specific fields
      const cleanData = data.map(item => {
        const obj = item.toObject();
        delete obj._id;
        delete obj.__v;
        return obj;
      });
      
      // Save to file
      const filePath = path.join(exportDir, `${collection.name}.json`);
      await fs.writeFile(filePath, JSON.stringify(cleanData, null, 2));
      
      console.log(`✓ Exported ${collection.name}: ${cleanData.length} documents`);
    }
    
    // Create import script
    const importScript = `
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import your models
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const connectDB = require('../config/db');

const importDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Connected to database. Starting import...');
    
    // Import collections
    const collections = [
      { name: 'users', model: User },
      { name: 'posts', model: Post },
      { name: 'messages', model: Message },
      { name: 'conversations', model: Conversation },
      { name: 'notifications', model: Notification }
    ];
    
    for (const collection of collections) {
      console.log(\`Importing \${collection.name}...\`);
      
      const filePath = path.join(__dirname, '..', 'exports', \`\${collection.name}.json\`);
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      if (data.length > 0) {
        await collection.model.insertMany(data);
        console.log(\`✓ Imported \${collection.name}: \${data.length} documents\`);
      } else {
        console.log(\`⚠ \${collection.name}: No data to import\`);
      }
    }
    
    console.log('Database import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
};

importDatabase();
`;
    
    const importScriptPath = path.join(exportDir, 'importDatabase.js');
    await fs.writeFile(importScriptPath, importScript);
    
    console.log('\n✅ Database export completed successfully!');
    console.log(`📁 Export files saved to: ${exportDir}`);
    console.log(`📜 Import script created: ${importScriptPath}`);
    console.log('\n📋 To import on another laptop:');
    console.log('1. Copy the "exports" folder to your new laptop');
    console.log('2. Run: node exports/importDatabase.js');
    
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
};

exportDatabase();
