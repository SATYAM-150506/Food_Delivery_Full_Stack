const mongoose = require('mongoose');

const helpDeskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  issueType: {
    type: String,
    enum: ['order_issue', 'payment_issue', 'delivery_issue', 'account_issue', 'general_inquiry'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedAgent: {
    type: String,
    default: null
  },
  responses: [{
    author: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isAgent: {
      type: Boolean,
      default: false
    }
  }],
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
helpDeskSchema.index({ user: 1, status: 1 });
helpDeskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HelpDesk', helpDeskSchema);
