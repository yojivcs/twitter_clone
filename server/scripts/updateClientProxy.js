const fs = require('fs');
const path = require('path');

/**
 * Updates the proxy setting in the client's package.json
 * @param {number} port - The port to set in the proxy
 */
function updateClientProxy(port) {
  try {
    const clientPackageJsonPath = path.join(__dirname, '../../client/package.json');
    
    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(clientPackageJsonPath, 'utf8'));
    
    // Update the proxy
    const newProxy = `http://localhost:${port}`;
    
    if (packageJson.proxy !== newProxy) {
      packageJson.proxy = newProxy;
      
      // Write the updated package.json
      fs.writeFileSync(
        clientPackageJsonPath,
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
      
      console.log(`Updated client proxy to ${newProxy}`);
      return true;
    } else {
      console.log(`Client proxy already set to ${newProxy}`);
      return false;
    }
  } catch (error) {
    console.error('Error updating client proxy:', error);
    return false;
  }
}

// If this script is run directly
if (require.main === module) {
  const port = process.argv[2];
  
  if (!port) {
    console.error('Please provide a port number');
    process.exit(1);
  }
  
  updateClientProxy(parseInt(port, 10));
}

module.exports = updateClientProxy; 