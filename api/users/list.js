const { connectToDatabase, loadMongoUsersLocal } = require('../db');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { db, useRealMongo, error } = await connectToDatabase();

    if (useRealMongo && db) {
      const users = await db.collection('users').find().toArray();
      res.status(200).json({ ok: true, count: users.length, users, useRealMongo: true });
    } else {
      const users = loadMongoUsersLocal();
      res.status(200).json({ ok: true, count: users.length, users, useRealMongo: false, mongoError: error });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
