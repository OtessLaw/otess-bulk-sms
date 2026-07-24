const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Template message content is required']
    },
    category: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Template', TemplateSchema);
