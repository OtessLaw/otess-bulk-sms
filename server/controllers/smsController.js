const ExcelJS = require('exceljs');
const { sendArkeselSms, formatPhoneNumber } = require('../config/arkesel');
const Contact = require('../models/Contact');
const SmsLog = require('../models/SmsLog');
const Campaign = require('../models/Campaign');
const Settings = require('../models/Settings');

/**
 * Replaces template dynamic placeholder variables: {{name}}, {{phone}}, {{email}}, {{group}}
 */
const replaceVariables = (templateText, contact) => {
  if (!templateText) return '';
  return templateText
    .replace(/\{\{name\}\}/gi, contact.name || 'Valued Client')
    .replace(/\{\{phone\}\}/gi, contact.phone || '')
    .replace(/\{\{email\}\}/gi, contact.email || '')
    .replace(/\{\{group\}\}/gi, contact.groupName || 'General');
};

/**
 * @desc    Send Bulk SMS (Group, Individual, or Direct List)
 * @route   POST /api/sms/send
 * @access  Private
 */
const sendSms = async (req, res, next) => {
  try {
    const {
      targetType,      // 'Group', 'Individual', 'UploadedList'
      groupName,       // E.g., 'Agents', 'VIP', 'All'
      individualPhone, // Single or comma-separated phone string
      customRecipients,// Array of objects [{ name, phone, email, groupName }]
      message,         // Raw template message string with variables
      scheduledDate,   // Optional scheduled ISO date/time string
      campaignTitle    // Optional campaign name
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // Fetch system settings for Arkesel credentials
    const settings = await Settings.findOne() || {};
    const apiKey = settings.arkeselApiKey || process.env.ARKESEL_API_KEY;
    const senderId = settings.arkeselSenderId || process.env.ARKESEL_SENDER_ID || 'OTESS DATA';

    let rawRecipients = [];

    if (targetType === 'Group') {
      const query = groupName && groupName !== 'All' ? { groupName, status: 'Active' } : { status: 'Active' };
      rawRecipients = await Contact.find(query).lean();
    } else if (targetType === 'Individual') {
      if (!individualPhone) {
        return res.status(400).json({ success: false, message: 'Individual phone number is required.' });
      }
      const rawNumbers = String(individualPhone).split(',').map(n => n.trim()).filter(Boolean);
      rawRecipients = rawNumbers.map(p => ({
        name: 'Recipient',
        phone: p,
        email: '',
        groupName: 'Individual'
      }));
    } else if (targetType === 'UploadedList' && Array.isArray(customRecipients)) {
      rawRecipients = customRecipients;
    } else {
      // Default fallback: send to all active contacts
      rawRecipients = await Contact.find({ status: 'Active' }).lean();
    }

    if (rawRecipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients found for the selected target.' });
    }

    // Deduplicate and format recipient phone numbers
    const seenPhones = new Set();
    const recipientsList = [];

    for (const r of rawRecipients) {
      const formatted = formatPhoneNumber(r.phone);
      if (!formatted) continue;
      if (!seenPhones.has(formatted)) {
        seenPhones.add(formatted);
        recipientsList.push({
          name: r.name || 'Valued Client',
          phone: formatted,
          rawPhone: r.phone,
          email: r.email || '',
          groupName: r.groupName || groupName || 'General'
        });
      }
    }

    if (recipientsList.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid phone numbers found in recipient list.' });
    }

    // Create Campaign Record
    const campaign = await Campaign.create({
      title: campaignTitle || `Bulk Campaign - ${new Date().toLocaleString()}`,
      message: message,
      targetType: targetType || 'Group',
      groupName: groupName || 'General',
      totalRecipients: recipientsList.length,
      status: scheduledDate ? 'Scheduled' : 'Sending',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    });

    let successCount = 0;
    let failureCount = 0;
    const logsToInsert = [];

    // Check if message contains dynamic variable tags
    const hasDynamicVariables = /\{\{(name|phone|email|group)\}\}/i.test(message);

    if (!hasDynamicVariables) {
      // BATCH DISPATCH: Send in chunks of 100 phone numbers per Arkesel API call
      const CHUNK_SIZE = 100;
      const chunks = [];
      for (let i = 0; i < recipientsList.length; i += CHUNK_SIZE) {
        chunks.push(recipientsList.slice(i, i + CHUNK_SIZE));
      }

      // Execute chunks in parallel batches of 5 chunks
      const BATCH_CONCURRENCY = 5;
      for (let i = 0; i < chunks.length; i += BATCH_CONCURRENCY) {
        const currentBatch = chunks.slice(i, i + BATCH_CONCURRENCY);

        await Promise.all(
          currentBatch.map(async (chunk) => {
            const chunkPhones = chunk.map(c => c.phone);
            try {
              const apiResult = await sendArkeselSms({
                apiKey,
                senderId,
                recipients: chunkPhones,
                message: message,
                scheduledDate
              });

              const isSuccess = apiResult.success;
              for (const recipient of chunk) {
                if (isSuccess) {
                  successCount++;
                } else {
                  failureCount++;
                }
                logsToInsert.push({
                  recipientName: recipient.name,
                  recipientPhone: recipient.phone,
                  message: message,
                  status: isSuccess ? 'Success' : 'Failed',
                  senderId: senderId,
                  cost: isSuccess ? 1 : 0,
                  campaignId: campaign._id,
                  responseDetails: apiResult
                });
              }
            } catch (err) {
              for (const recipient of chunk) {
                failureCount++;
                logsToInsert.push({
                  recipientName: recipient.name,
                  recipientPhone: recipient.phone,
                  message: message,
                  status: 'Failed',
                  senderId: senderId,
                  cost: 0,
                  campaignId: campaign._id,
                  responseDetails: { error: err.message }
                });
              }
            }
          })
        );
      }
    } else {
      // PERSONALIZED DISPATCH: Process recipients in parallel batches of 20
      const CONCURRENCY_LIMIT = 20;
      for (let i = 0; i < recipientsList.length; i += CONCURRENCY_LIMIT) {
        const batch = recipientsList.slice(i, i + CONCURRENCY_LIMIT);

        await Promise.all(
          batch.map(async (recipient) => {
            const personalizedMessage = replaceVariables(message, recipient);
            try {
              const apiResult = await sendArkeselSms({
                apiKey,
                senderId,
                recipients: [recipient.phone],
                message: personalizedMessage,
                scheduledDate
              });

              const isSuccess = apiResult.success;
              if (isSuccess) {
                successCount++;
              } else {
                failureCount++;
              }

              logsToInsert.push({
                recipientName: recipient.name,
                recipientPhone: recipient.phone,
                message: personalizedMessage,
                status: isSuccess ? 'Success' : 'Failed',
                senderId: senderId,
                cost: isSuccess ? 1 : 0,
                campaignId: campaign._id,
                responseDetails: apiResult
              });
            } catch (err) {
              failureCount++;
              logsToInsert.push({
                recipientName: recipient.name,
                recipientPhone: recipient.phone,
                message: personalizedMessage,
                status: 'Failed',
                senderId: senderId,
                cost: 0,
                campaignId: campaign._id,
                responseDetails: { error: err.message }
              });
            }
          })
        );
      }
    }

    // Bulk Save Logs to MongoDB
    if (logsToInsert.length > 0) {
      await SmsLog.insertMany(logsToInsert);
    }

    // Update Campaign Stats
    campaign.status = failureCount === recipientsList.length ? 'Failed' : 'Completed';
    campaign.successCount = successCount;
    campaign.failureCount = failureCount;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `SMS batch execution finished: ${successCount} Sent, ${failureCount} Failed.`,
      campaign,
      summary: {
        total: recipientsList.length,
        success: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get SMS Delivery History Logs
 * @route   GET /api/sms/logs
 * @access  Private
 */
const getSmsLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { recipientName: searchRegex },
        { recipientPhone: searchRegex },
        { message: searchRegex }
      ];
    }

    const total = await SmsLog.countDocuments(query);
    const logs = await SmsLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export SMS History Logs to Excel
 * @route   GET /api/sms/logs/export
 * @access  Private
 */
const exportSmsLogs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'All' ? { status } : {};

    const logs = await SmsLog.find(query).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OTESS SMS History');

    worksheet.columns = [
      { header: 'Recipient Name', key: 'recipientName', width: 25 },
      { header: 'Phone Number', key: 'recipientPhone', width: 20 },
      { header: 'Message', key: 'message', width: 45 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Sender ID', key: 'senderId', width: 18 },
      { header: 'Cost (Credits)', key: 'cost', width: 15 },
      { header: 'Date & Time', key: 'createdAt', width: 25 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' }
    };

    logs.forEach((log) => {
      worksheet.addRow({
        recipientName: log.recipientName,
        recipientPhone: log.recipientPhone,
        message: log.message,
        status: log.status,
        senderId: log.senderId,
        cost: log.cost,
        createdAt: new Date(log.createdAt).toLocaleString()
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `OTESS_SMS_Logs_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendSms,
  getSmsLogs,
  exportSmsLogs
};
