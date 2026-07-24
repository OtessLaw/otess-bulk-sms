const Settings = require('../models/Settings');
const { getArkeselBalance } = require('../config/arkesel');

/**
 * @desc    Get Arkesel & System Settings
 * @route   GET /api/settings
 * @access  Private
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        companyName: 'OTESS DATA',
        arkeselApiKey: process.env.ARKESEL_API_KEY || '',
        arkeselSenderId: process.env.ARKESEL_SENDER_ID || 'OTESS DATA'
      });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update Arkesel & System Settings in Database
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = async (req, res, next) => {
  try {
    const { companyName, arkeselApiKey, arkeselSenderId } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (companyName) settings.companyName = companyName.trim();
    if (arkeselApiKey !== undefined) settings.arkeselApiKey = arkeselApiKey.trim();
    if (arkeselSenderId) settings.arkeselSenderId = arkeselSenderId.trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated and saved successfully in database.',
      settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test Arkesel API Connection & Fetch Balance
 * @route   POST /api/settings/test-connection
 * @access  Private
 */
const testArkeselConnection = async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || (await Settings.findOne())?.arkeselApiKey || process.env.ARKESEL_API_KEY;

    const result = await getArkeselBalance(keyToTest);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.simulated
          ? 'Connected via Arkesel Sandbox Mode (Simulated Key).'
          : 'Successfully connected to Arkesel SMS API Gateway!',
        balance: result.balance,
        currency: result.currency || 'SMS Credits',
        simulated: result.simulated
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to connect to Arkesel API. Please check your API Key.'
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testArkeselConnection
};
