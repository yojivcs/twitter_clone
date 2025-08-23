const { spawn } = require('child_process');
const path = require('path');

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${path.basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath], { 
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${path.basename(scriptPath)} completed successfully.`);
        resolve();
      } else {
        console.error(`${path.basename(scriptPath)} failed with code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`Failed to start ${path.basename(scriptPath)}:`, err);
      reject(err);
    });
  });
}

// Run scripts in sequence
async function runAllScripts() {
  try {
    console.log('Starting data population...');
    
    // 1. Register users
    await runScript(path.join(__dirname, 'bulkRegister.js'));
    
    // 2. Set up follow relationships
    await runScript(path.join(__dirname, 'setupFollows.js'));
    
    // 3. Create sample tweets, likes, retweets, and replies
    await runScript(path.join(__dirname, 'createSampleTweets.js'));
    
    console.log('All data population completed successfully!');
    console.log('You can now use the application with sample data.');
  } catch (error) {
    console.error('Data population failed:', error);
  }
}

// Run the main function
runAllScripts(); 