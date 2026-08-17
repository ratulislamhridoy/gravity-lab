const { connectToDatabase, loadMongoUsersLocal, saveMongoUsersLocal } = require('../db');

module.exports = async (req, res) => {
  // CORS Headers
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
    const { uid, email, plan, expiry } = req.body || {};
    if (!uid) {
      res.status(400).json({ ok: false, error: 'User UID is required' });
      return;
    }

    const { db, useRealMongo } = await connectToDatabase();

    if (useRealMongo && db) {
      const col = db.collection('users');
      const query = { uid: uid };
      await col.updateOne(query, {
        $set: {
          subscription: plan,
          subscriptionExpiry: expiry
        }
      });
    } else {
      // File Fallback
      let users = loadMongoUsersLocal();
      let index = users.findIndex(u => u.uid === uid || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
      if (index >= 0) {
        users[index].subscription = plan;
        users[index].subscriptionExpiry = expiry;
        saveMongoUsersLocal(users);
      }
    }

    res.status(200).json({ ok: true, message: 'User subscription updated' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
