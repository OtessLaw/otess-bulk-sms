const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Campaign message content is required']
    },
    targetType: {
      type: String,
      enum: ['Group', 'Individual', 'Excel'],
      default: 'Group'
    },
    groupName: {
      type: String,
      default: 'All'
    },
    totalRecipients: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'],
      default: 'Completed'
    },
    scheduledDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Campaign', CampaignSchema);
