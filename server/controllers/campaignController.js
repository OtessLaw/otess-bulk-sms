const Campaign = require('../models/Campaign');
const SmsLog = require('../models/SmsLog');

/**
 * @desc    Get all campaigns
 * @route   GET /api/campaigns
 * @access  Private
 */
const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      campaigns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create/Save a Campaign Draft
 * @route   POST /api/campaigns
 * @access  Private
 */
const createCampaign = async (req, res, next) => {
  try {
    const { title, message, targetType, groupName, scheduledDate } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Campaign title and message are required.' });
    }

    const campaign = await Campaign.create({
      title: title.trim(),
      message: message.trim(),
      targetType: targetType || 'Group',
      groupName: groupName || 'General',
      status: scheduledDate ? 'Scheduled' : 'Draft',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    res.status(201).json({
      success: true,
      message: 'Campaign saved successfully',
      campaign
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Duplicate Campaign
 * @route   POST /api/campaigns/:id/duplicate
 * @access  Private
 */
const duplicateCampaign = async (req, res, next) => {
  try {
    const original = await Campaign.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original campaign not found.' });
    }

    const duplicate = await Campaign.create({
      title: `${original.title} (Copy)`,
      message: original.message,
      targetType: original.targetType,
      groupName: original.groupName,
      status: 'Draft'
    });

    res.status(201).json({
      success: true,
      message: 'Campaign duplicated successfully',
      campaign: duplicate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Campaign
 * @route   DELETE /api/campaigns/:id
 * @access  Private
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Campaign Statistics
 * @route   GET /api/campaigns/:id/stats
 * @access  Private
 */
const getCampaignStats = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const logs = await SmsLog.find({ campaignId: campaign._id });

    const total = campaign.totalRecipients || logs.length;
    const success = campaign.successCount ?? logs.filter(l => l.status === 'Success').length;
    const failed = campaign.failureCount ?? logs.filter(l => l.status === 'Failed').length;
    const isFinished = campaign.status === 'Completed' || campaign.status === 'Failed' || campaign.status === 'Scheduled';

    res.status(200).json({
      success: true,
      campaign,
      stats: {
        total,
        success,
        failed,
        status: campaign.status,
        isFinished,
        successRate: total > 0 ? ((success / total) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCampaigns,
  createCampaign,
  duplicateCampaign,
  deleteCampaign,
  getCampaignStats
};
