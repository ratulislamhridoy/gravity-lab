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
    const userData = req.body || {};
    if (!userData || (!userData.uid && !userData.email)) {
      res.status(400).json({ ok: false, error: 'Invalid user data' });
      return;
    }

    const emailKey = (userData.email || '').toLowerCase();
    const now = new Date().toISOString();
    const userObj = {
      uid: userData.uid || 'user_' + Date.now(),
      email: userData.email || '',
      displayName: userData.displayName || (userData.email ? userData.email.split('@')[0] : 'User'),
      photoURL: userData.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
      provider: userData.provider || 'google.com',
      status: 'active',
      lastActive: now,
      firstLogin: now,
      metrics: userData.metrics || {}
    };

    let finalUser = userObj;
    let count = 0;

    const { db, useRealMongo } = await connectToDatabase();

    if (useRealMongo && db) {
      const col = db.collection('users');
      const query = (userData.uid && emailKey)
        ? {
            $or: [
              { uid: userData.uid },
              { email: { $regex: new RegExp('^' + emailKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } }
            ]
          }
        : (userData.uid ? { uid: userData.uid } : { email: { $regex: new RegExp('^' + emailKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } });

      const existing = await col.findOne(query);
      if (existing) {
        userObj.firstLogin = existing.firstLogin || now;
        userObj.subscription = existing.subscription || 'free';
        userObj.subscriptionExpiry = existing.subscriptionExpiry || null;
        userObj.creditsDaily = existing.creditsDaily || null;
        // Merge metrics safely
        userObj.metrics = {
          iconSheets: (userObj.metrics.iconSheets || {}).total > (existing.metrics?.iconSheets || {}).total ? userObj.metrics.iconSheets : (existing.metrics?.iconSheets || {}),
          prompts: (userObj.metrics.prompts || {}).total > (existing.metrics?.prompts || {}).total ? userObj.metrics.prompts : (existing.metrics?.prompts || {}),
          flowImages: (userObj.metrics.flowImages || {}).total > (existing.metrics?.flowImages || {}).total ? userObj.metrics.flowImages : (existing.metrics?.flowImages || {}),
          presentations: (userObj.metrics.presentations || {}).total > (existing.metrics?.presentations || {}).total ? userObj.metrics.presentations : (existing.metrics?.presentations || {})
        };
        await col.updateOne({ _id: existing._id }, { $set: userObj });
        finalUser = { ...existing, ...userObj };
      } else {
        userObj.subscription = 'free';
        userObj.subscriptionExpiry = null;
        userObj.creditsDaily = { remaining: 15, lastResetDate: now.split('T')[0] };
        await col.insertOne(userObj);
      }
      count = await col.countDocuments();
    } else {
      // File Fallback
      let users = loadMongoUsersLocal();
      let existingIdx = users.findIndex(u => (userData.uid && u.uid === userData.uid) || (emailKey && u.email && u.email.toLowerCase() === emailKey));

      if (existingIdx >= 0) {
        userObj.firstLogin = users[existingIdx].firstLogin || now;
        userObj.subscription = users[existingIdx].subscription || 'free';
        userObj.subscriptionExpiry = users[existingIdx].subscriptionExpiry || null;
        userObj.creditsDaily = users[existingIdx].creditsDaily || null;
        userObj.metrics = {
          iconSheets: (userObj.metrics.iconSheets || {}).total > (users[existingIdx].metrics?.iconSheets || {}).total ? userObj.metrics.iconSheets : (users[existingIdx].metrics?.iconSheets || {}),
          prompts: (userObj.metrics.prompts || {}).total > (users[existingIdx].metrics?.prompts || {}).total ? userObj.metrics.prompts : (users[existingIdx].metrics?.prompts || {}),
          flowImages: (userObj.metrics.flowImages || {}).total > (users[existingIdx].metrics?.flowImages || {}).total ? userObj.metrics.flowImages : (users[existingIdx].metrics?.flowImages || {}),
          presentations: (userObj.metrics.presentations || {}).total > (users[existingIdx].metrics?.presentations || {}).total ? userObj.metrics.presentations : (users[existingIdx].metrics?.presentations || {})
        };
        users[existingIdx] = { ...users[existingIdx], ...userObj };
        finalUser = users[existingIdx];
      } else {
        userObj.subscription = 'free';
        userObj.subscriptionExpiry = null;
        userObj.creditsDaily = { remaining: 15, lastResetDate: now.split('T')[0] };
        users.unshift(userObj);
      }
      saveMongoUsersLocal(users);
      count = users.length;
    }

    res.status(200).json({ ok: true, message: 'User tracked in MongoDB DB', user: finalUser, count: count });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
