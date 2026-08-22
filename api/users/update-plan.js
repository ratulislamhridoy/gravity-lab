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
      const query = {
        $or: [
          { uid: uid },
          { email: { $regex: new RegExp('^' + (email || '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } }
        ]
      };
      const existing = await col.findOne(query);
      if (existing) {
        await col.updateOne({ _id: existing._id }, {
          $set: {
            subscription: plan,
            subscriptionExpiry: expiry
          }
        });
      } else {
        const now = new Date().toISOString();
        await col.insertOne({
          uid: uid,
          email: email || '',
          displayName: email ? email.split('@')[0] : 'User',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          provider: 'google.com',
          status: 'active',
          lastActive: now,
          firstLogin: now,
          metrics: {},
          subscription: plan,
          subscriptionExpiry: expiry,
          creditsDaily: { remaining: 15, lastResetDate: now.split('T')[0] }
        });
      }
    } else {
      // File Fallback
      let users = loadMongoUsersLocal();
      let index = users.findIndex(u => u.uid === uid || (email && u.email && u.email.toLowerCase() === email.toLowerCase()));
      if (index >= 0) {
        users[index].subscription = plan;
        users[index].subscriptionExpiry = expiry;
      } else {
        const now = new Date().toISOString();
        users.push({
          uid: uid,
          email: email || '',
          displayName: email ? email.split('@')[0] : 'User',
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          provider: 'google.com',
          status: 'active',
          lastActive: now,
          firstLogin: now,
          metrics: {},
          subscription: plan,
          subscriptionExpiry: expiry,
          creditsDaily: { remaining: 15, lastResetDate: now.split('T')[0] }
        });
      }
      saveMongoUsersLocal(users);
    }

    res.status(200).json({ ok: true, message: 'User subscription updated' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
