const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'OTESS DATA'
    },
    arkeselApiKey: {
      type: String,
      default: ''
    },
    arkeselSenderId: {
      type: String,
      default: 'OTESS DATA'
    },
    defaultCountryCode: {
      type: String,
      default: '233'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', SettingsSchema);
