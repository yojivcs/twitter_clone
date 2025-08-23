const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Kill any running processes
const killProcesses = () => {
  return new Promise((resolve) => {
    console.log('Stopping any running processes...');
    
    // Different commands for Windows vs Unix-like systems
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      spawn('taskkill', ['/F', '/IM', 'node.exe'], { 
        stdio: 'inherit',
        shell: true 
      }).on('close', () => {
        setTimeout(resolve, 1000); // Give some time for processes to fully terminate
      });
    } else {
      // For Unix-like systems
      spawn('pkill', ['-f', 'node'], { 
        stdio: 'inherit',
        shell: true 
      }).on('close', () => {
        setTimeout(resolve, 1000);
      });
    }
  });
};

// Start the application
const startApp = () => {
  console.log('Starting the application...');
  
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  const devProcess = spawn(npmCmd, ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true 
  });
  
  devProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
  });
  
  return devProcess;
};

// Main function
const restartApp = async () => {
  try {
    await killProcesses();
    console.log('All processes stopped.');
    
    startApp();
  } catch (error) {
    console.error('Error during restart:', error);
  }
};

// Run if called directly
if (require.main === module) {
  restartApp();
}

module.exports = restartApp; 