const mongoose = require('mongoose');

const SmsLogSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      default: 'Unknown'
    },
    recipientPhone: {
      type: String,
      required: [true, 'Recipient phone is required']
    },
    message: {
      type: String,
      required: [true, 'Message content is required']
    },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Pending'],
      default: 'Pending'
    },
    senderId: {
      type: String,
      default: 'OTESS DATA'
    },
    cost: {
      type: Number,
      default: 1
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: false
    },
    responseDetails: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

SmsLogSchema.index({ recipientPhone: 'text', recipientName: 'text', message: 'text' });

module.exports = mongoose.model('SmsLog', SmsLogSchema);
