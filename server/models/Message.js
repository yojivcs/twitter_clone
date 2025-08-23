const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: 2000 // Increased to accommodate encrypted content
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  read: {
    type: Boolean,
    default: false
  },
  attachments: [
    {
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
