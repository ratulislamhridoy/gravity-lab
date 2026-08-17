const { connectToDatabase } = require('../db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db, useRealMongo, error } = await connectToDatabase();
    if (!useRealMongo || !db) {
      res.status(200).json({ ok: false, error: 'Not using real MongoDB', details: error });
      return;
    }

    const col = db.collection('users');
    const allUsers = await col.find().toArray();
    
    // Sort all records matching target email or similar
    const matched = allUsers.map(u => ({
      id: u._id,
      uid: u.uid,
      email: u.email,
      subscription: u.subscription,
      subscriptionExpiry: u.subscriptionExpiry,
      creditsDaily: u.creditsDaily,
      lastActive: u.lastActive
    }));

    res.status(200).json({
      ok: true,
      useRealMongo: true,
      count: allUsers.length,
      users: matched
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
