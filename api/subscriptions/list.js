const { connectToDatabase, loadMongoRequestsLocal } = require('../db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const { db, useRealMongo } = await connectToDatabase();
    let requests = [];

    if (useRealMongo && db) {
      const col = db.collection('subscription_requests');
      requests = await col.find({}).sort({ createdAt: -1 }).toArray();
    } else {
      requests = loadMongoRequestsLocal();
      // Sort manually by date desc
      requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({ ok: true, requests });
  } catch (err) {
    console.error('[List Billing Endpoint Error]:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
