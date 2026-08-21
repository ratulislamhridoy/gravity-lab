const { connectToDatabase, loadMongoRequestsLocal, saveMongoRequestsLocal } = require('../db');
const https = require('https');

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sendTelegramAlert(payload) {
  return new Promise((resolve) => {
    const token = process.env.TELEGRAM_BOT_TOKEN || '8856059931:AAGT3or3oauYDSd7a43maOq3Av3cth_rEek';
    const chatId = process.env.TELEGRAM_CHAT_ID || '5366183134';
    if (!token || !chatId) {
      console.warn('[Telegram Alert skipped]: env variables MONGODB_URI or TELEGRAM keys not set.');
      resolve(false);
      return;
    }

    const amount = payload.plan === 'monthly' ? '৳১০০' : (payload.plan === 'six_months' ? '৳৫০০' : payload.plan);
    const dhakaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka', hour12: true });

    const message = `🔔 <b>New Purchase Alert</b> 🔔\n\n` +
      `📧 <b>User:</b> ${escapeHtml(payload.email)}\n` +
      `💳 <b>Method:</b> ${escapeHtml(payload.method.toUpperCase())}\n` +
      `💰 <b>Amount:</b> ${escapeHtml(amount)}\n` +
      `📞 <b>Sender:</b> <code>${escapeHtml(payload.phone || 'N/A')}</code>\n` +
      `🆔 <b>UID:</b> <code>${escapeHtml(payload.uid)}</code>\n` +
      `📅 <b>Date & Time:</b> ${escapeHtml(dhakaTime)}`;

    const postData = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve(true);
      });
    });

    req.on('error', (e) => {
      console.warn('[Telegram API Error]:', e.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const data = req.body || {};
    if (!data.uid || !data.email || !data.plan || !data.method) {
      res.status(400).json({ ok: false, error: 'Missing required request parameters' });
      return;
    }

    const newRequest = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      uid: data.uid,
      email: data.email.toLowerCase(),
      displayName: data.displayName || data.email.split('@')[0],
      plan: data.plan,
      method: data.method,
      phone: data.phone || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const { db, useRealMongo } = await connectToDatabase();

    if (useRealMongo && db) {
      const col = db.collection('subscription_requests');
      await col.insertOne(newRequest);
    } else {
      const list = loadMongoRequestsLocal();
      list.push(newRequest);
      saveMongoRequestsLocal(list);
    }

    // Try to trigger Telegram Alert Message
    await sendTelegramAlert(newRequest);

    res.status(200).json({ ok: true, message: 'Request submitted successfully', request: newRequest });
  } catch (err) {
    console.error('[Request Billing Endpoint Error]:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
