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
    const { db, useRealMongo } = await connectToDatabase();

    if (useRealMongo && db) {
      const col = db.collection('users');
      await col.deleteMany({
        $or: [
          { uid: /^user_test_/ },
          { email: /@gravitylab\.ai/ }
        ]
      });
      const users = await col.find().toArray();
      res.status(200).json({ ok: true, users: users });
    } else {
      let users = loadMongoUsersLocal();
      users = users.filter(u => !String(u.uid || '').startsWith('user_test_') && !String(u.email || '').includes('@gravitylab.ai'));
      saveMongoUsersLocal(users);
      res.status(200).json({ ok: true, users: users });
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
