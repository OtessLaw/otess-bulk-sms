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
 * Formats a Date object or ISO date string into Arkesel's required format: "YYYY-MM-DD hh:mm AM/PM"
 */
const formatArkeselScheduledDate = (dateInput) => {
  if (!dateInput) return null;
  const str = String(dateInput).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'false') return null;

  const d = new Date(str);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
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

  const effectiveApiKey = String(apiKey || process.env.ARKESEL_API_KEY || '').trim();
  const rawSenderId = senderId || process.env.ARKESEL_SENDER_ID || 'OTESS DATA';
  const effectiveSenderId = String(rawSenderId).trim().substring(0, 11);

  // Sandbox / Simulation Mode if no real API key is configured
  if (!effectiveApiKey || effectiveApiKey === '' || effectiveApiKey.includes('your_arkesel_api_key')) {
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

    // Format and attach scheduled_date ONLY if explicitly provided and valid
    const formattedScheduled = formatArkeselScheduledDate(scheduledDate);
    if (formattedScheduled) {
      payload.scheduled_date = formattedScheduled;
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
 * Fetches SMS Credit Balance from Arkesel with multi-endpoint fallbacks
 */
const getArkeselBalance = async (apiKey) => {
  const rawKey = apiKey || process.env.ARKESEL_API_KEY || '';
  const effectiveApiKey = String(rawKey).trim();

  if (!effectiveApiKey || effectiveApiKey === '' || effectiveApiKey.includes('your_arkesel_api_key')) {
    return {
      success: true,
      simulated: true,
      balance: 10000,
      currency: 'SMS Credits (Simulated)'
    };
  }

  // Comprehensive list of known Arkesel balance endpoints & auth headers
  const endpoints = [
    { url: `${ARKESEL_BASE_URL}/clients/balance`, headers: { 'api-key': effectiveApiKey } },
    { url: `${ARKESEL_BASE_URL}/clients/balance`, headers: { 'api_key': effectiveApiKey } },
    { url: `${ARKESEL_BASE_URL}/user`, headers: { 'api-key': effectiveApiKey } },
    { url: `https://sms.arkesel.com/api/v2/sms/balance`, headers: { 'api-key': effectiveApiKey } },
    { url: `https://sms.arkesel.com/api/v1/user?action=check-balance&api_key=${encodeURIComponent(effectiveApiKey)}`, headers: {} }
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const response = await axios.get(ep.url, {
        headers: ep.headers,
        timeout: 8000
      });

      if (response.data) {
        const bal = response.data?.data?.balance ?? response.data?.balance ?? response.data?.main_balance ?? response.data?.sms_balance ?? response.data?.data?.sms_balance;
        if (bal !== undefined && bal !== null) {
          return {
            success: true,
            simulated: false,
            balance: Number(bal),
            currency: response.data?.data?.currency || response.data?.currency || 'GHS / SMS Credits'
          };
        }
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Arkesel Balance Endpoint Warning] Failed ${ep.url}:`, err.response?.data || err.message);
    }
  }

  console.error('[Arkesel Balance Error Final]:', lastError?.response?.data || lastError?.message);
  
  let errMsg = 'Failed to retrieve Arkesel SMS balance. Please verify your API Key.';
  if (lastError?.response?.status === 404 || lastError?.response?.status === 401) {
    errMsg = 'Invalid Arkesel API Key. Please double-check your key from sms.arkesel.com (API & Webhooks), or check for extra spaces.';
  } else if (lastError?.response?.data?.message) {
    errMsg = lastError.response.data.message;
  } else if (lastError?.response?.data?.error) {
    errMsg = lastError.response.data.error;
  }

  return {
    success: false,
    simulated: false,
    balance: 0,
    message: errMsg
  };
};

module.exports = {
  sendArkeselSms,
  getArkeselBalance,
  formatPhoneNumber
};
