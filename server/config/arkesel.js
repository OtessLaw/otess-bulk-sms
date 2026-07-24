const axios = require('axios');

/**
 * Arkesel SMS API Service Integration
 * Documentation: https://arkesel.com/developer-api/
 */

const ARKESEL_BASE_URL = 'https://sms.arkesel.com/api/v2';

/**
 * Normalizes phone numbers to standard international format without leading plus sign
 * Example: '0241234567' -> '233241234567' (Ghana country code 233 default)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  }
  return cleaned;
};

/**
 * Sends SMS via Arkesel v2 API
 * If API Key is missing or set to demo, it runs in Sandbox/Simulation mode for testing.
 */
const sendArkeselSms = async ({ apiKey, senderId, recipients, message, scheduledDate }) => {
  // Format all recipient numbers
  const formattedRecipients = Array.isArray(recipients)
    ? recipients.map(formatPhoneNumber).filter(Boolean)
    : [formatPhoneNumber(recipients)];

  if (formattedRecipients.length === 0) {
    throw new Error('No valid recipient phone numbers provided.');
  }

  const effectiveApiKey = apiKey || process.env.ARKESEL_API_KEY;
  const effectiveSenderId = senderId || process.env.ARKESEL_SENDER_ID || 'OTESS DATA';

  // Sandbox / Simulation Mode if no real API key is configured
  if (!effectiveApiKey || effectiveApiKey.trim() === '' || effectiveApiKey.includes('your_arkesel_api_key')) {
    console.log('[Arkesel Simulator] Simulated SMS Batch Dispatch:');
    console.log(`- Sender: ${effectiveSenderId}`);
    console.log(`- Recipients (${formattedRecipients.length}): ${formattedRecipients.slice(0, 5).join(', ')}...`);
    console.log(`- Message: "${message}"`);
    if (scheduledDate) console.log(`- Scheduled For: ${scheduledDate}`);

    return {
      success: true,
      simulated: true,
      code: '100',
      message: 'Simulated SMS sent successfully via Arkesel Sandbox Mode.',
      data: {
        recipients_count: formattedRecipients.length,
        units_used: formattedRecipients.length,
        sender: effectiveSenderId
      }
    };
  }

  // Real Arkesel API HTTP Request
  try {
    const payload = {
      sender: effectiveSenderId,
      recipients: formattedRecipients,
      message: message
    };

    if (scheduledDate) {
      payload.scheduled_date = scheduledDate;
    }

    const response = await axios.post(`${ARKESEL_BASE_URL}/sms/send`, payload, {
      headers: {
        'api-key': effectiveApiKey,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return {
      success: true,
      simulated: false,
      code: response.data?.code || '100',
      message: response.data?.message || 'SMS sent successfully.',
      data: response.data
    };
  } catch (error) {
    console.error('[Arkesel API Error]:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send SMS via Arkesel API.';
    return {
      success: false,
      simulated: false,
      message: errorMessage,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Fetches SMS Credit Balance from Arkesel
 */
const getArkeselBalance = async (apiKey) => {
  const effectiveApiKey = apiKey || process.env.ARKESEL_API_KEY;

  if (!effectiveApiKey || effectiveApiKey.trim() === '' || effectiveApiKey.includes('your_arkesel_api_key')) {
    return {
      success: true,
      simulated: true,
      balance: 10000,
      currency: 'SMS Credits (Simulated)'
    };
  }

  try {
    const response = await axios.get(`${ARKESEL_BASE_URL}/clients/balance`, {
      headers: {
        'api-key': effectiveApiKey
      },
      timeout: 10000
    });

    return {
      success: true,
      simulated: false,
      balance: response.data?.data?.balance ?? response.data?.balance ?? 0,
      currency: response.data?.data?.currency || 'GHS'
    };
  } catch (error) {
    console.error('[Arkesel Balance Error]:', error.response?.data || error.message);
    return {
      success: false,
      simulated: false,
      balance: 0,
      message: error.response?.data?.message || 'Failed to retrieve Arkesel SMS balance.'
    };
  }
};

module.exports = {
  sendArkeselSms,
  getArkeselBalance,
  formatPhoneNumber
};
