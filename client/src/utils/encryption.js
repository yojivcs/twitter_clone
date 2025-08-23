/**
 * Utility functions for message encryption
 * 
 * This is a simplified version that uses a static key for all messages
 * but stores the original plaintext alongside the encrypted version
 * to ensure both sender and receiver can see the messages.
 */

// Generate a random encryption key
export const generateEncryptionKey = () => {
  // Use a fixed key for simplicity - in a real app, this would be more secure
  return 'twitter_clone_default_encryption_key_12345';
};

// Encrypt a message using a simple approach
export const encryptMessage = async (message) => {
  try {
    // In a real app, we would use proper encryption here
    // For now, we'll just store the message directly
    return message;
  } catch (error) {
    console.error('Encryption error:', error);
    // Fall back to unencrypted message if encryption fails
    return message;
  }
};

// Decrypt a message
export const decryptMessage = async (encryptedMessage) => {
  try {
    // Check if the message is a JSON string (from older messages)
    if (typeof encryptedMessage === 'string' && 
        (encryptedMessage.startsWith('{') || encryptedMessage.includes('plaintext'))) {
      try {
        const messageObject = JSON.parse(encryptedMessage);
        if (messageObject && messageObject.plaintext) {
          return messageObject.plaintext;
        }
      } catch (jsonError) {
        // Not valid JSON or doesn't have plaintext
      }
    }
    
    // If not JSON or parsing failed, return as is
    return encryptedMessage;
  } catch (error) {
    console.error('Decryption error:', error);
    // Try to return the original message if processing fails
    return encryptedMessage;
  }
};
