const { connectToDatabase, loadMongoRequestsLocal, saveMongoRequestsLocal } = require('../db');
const https = require('https');

function sendTelegramAlert(payload) {
  return new Promise((resolve) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      console.warn('[Telegram Alert skipped]: env variables MONGODB_URI or TELEGRAM keys not set.');
      resolve(false);
      return;
    }

    const message = `🔔 *New Subscription Request* 🔔\n\n` +
      `👤 *User:* ${payload.displayName}\n` +
      `📧 *Email:* ${payload.email}\n` +
      `🆔 *UID:* \`${payload.uid}\`\n\n` +
      `💎 *Plan Requested:* \`${payload.plan}\`\n` +
      `💳 *Method:* ${payload.method.toUpperCase()}\n` +
      `📞 *Sender Phone:* \`${payload.phone || 'WhatsApp contact'}\`\n\n` +
      `⏳ *Status:* Pending Verification.`;

    const postData = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
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
