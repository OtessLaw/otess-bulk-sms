const Contact = require('../models/Contact');
const Group = require('../models/Group');
const SmsLog = require('../models/SmsLog');
const Campaign = require('../models/Campaign');
const Settings = require('../models/Settings');
const { getArkeselBalance } = require('../config/arkesel');

/**
 * @desc    Get Dashboard Overview Summary Stats
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalCampaigns = await Campaign.countDocuments();

    // SMS sent today start/end dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const smsSentToday = await SmsLog.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: 'Success'
    });

    const smsFailedToday = await SmsLog.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: 'Failed'
    });

    // Total SMS stats all time
    const totalSent = await SmsLog.countDocuments({ status: 'Success' });
    const totalFailed = await SmsLog.countDocuments({ status: 'Failed' });

    // Fetch Arkesel API balance
    const settings = await Settings.findOne() || {};
    const balanceResult = await getArkeselBalance(settings.arkeselApiKey);

    // Fetch recent 5 activities
    const recentActivities = await SmsLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('recipientName recipientPhone status createdAt message');

    res.status(200).json({
      success: true,
      cards: {
        totalContacts,
        smsSentToday,
        smsFailedToday,
        smsBalance: balanceResult.balance,
        balanceCurrency: balanceResult.currency || 'SMS Credits',
        simulatedBalance: balanceResult.simulated || false,
        totalGroups,
        totalCampaigns,
        totalSent,
        totalFailed
      },
      recentActivities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Analytics Chart Data (Daily, Weekly, Monthly, Success/Failure Rates)
 * @route   GET /api/analytics/charts
 * @access  Private
 */
const getChartData = async (req, res, next) => {
  try {
    // Generate daily SMS stats for past 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      const sentCount = await SmsLog.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'Success'
      });

      const failedCount = await SmsLog.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'Failed'
      });

      dailyStats.push({
        day: dayLabel,
        Sent: sentCount,
        Failed: failedCount
      });
    }

    // Success vs Failure overall pie chart data
    const totalSuccess = await SmsLog.countDocuments({ status: 'Success' });
    const totalFailed = await SmsLog.countDocuments({ status: 'Failed' });

    const pieData = [
      { name: 'Success', value: totalSuccess || 10, color: '#10b981' },
      { name: 'Failed', value: totalFailed || 1, color: '#ef4444' }
    ];

    res.status(200).json({
      success: true,
      dailyStats,
      pieData,
      overallSuccessRate: (totalSuccess + totalFailed) > 0
        ? (((totalSuccess) / (totalSuccess + totalFailed)) * 100).toFixed(1)
        : 100
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getChartData
};
