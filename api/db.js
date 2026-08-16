const fs = require('fs');
const path = require('path');

const MONGODB_ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://havenpick1_db_user:polZjE5zNHj1TXPF@cluster0.ute96fe.mongodb.net/gravity_ai?retryWrites=true&w=majority';
const MONGODB_FILE = path.join(process.cwd(), 'mongodb_users.json');

let cachedDb = null;
let useRealMongo = false;
let MongoClientObj = null;

try {
  const { MongoClient } = require('mongodb');
  MongoClientObj = MongoClient;
} catch (e) {
  console.log('[MongoDB Driver Note]: mongodb package not installed.');
}

async function connectToDatabase() {
  if (cachedDb) {
    return { db: cachedDb, useRealMongo: true };
  }

  if (MongoClientObj) {
    try {
      const client = new MongoClientObj(MONGODB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      await client.connect();
      const db = client.db('gravity_ai');
      cachedDb = db;
      useRealMongo = true;
      return { db: db, useRealMongo: true };
    } catch (err) {
      console.error('[MongoDB Atlas Connection Failed]:', err.message);
    }
  }

  return { db: null, useRealMongo: false };
}

function loadMongoUsersLocal() {
  try {
    if (fs.existsSync(MONGODB_FILE)) {
      const data = fs.readFileSync(MONGODB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[MongoDB Local Storage Read Error]:', e);
  }
  return [];
}

function saveMongoUsersLocal(users) {
  try {
    fs.writeFileSync(MONGODB_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('[MongoDB Local Storage Write Error]:', e);
  }
}

module.exports = {
  connectToDatabase,
  loadMongoUsersLocal,
  saveMongoUsersLocal
};
