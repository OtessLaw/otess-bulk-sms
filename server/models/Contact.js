const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: false
    },
    groupName: {
      type: String,
      default: 'General'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// Index for fast searching by name, phone, or email
ContactSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Contact', ContactSchema);
