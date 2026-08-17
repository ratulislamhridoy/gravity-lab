const fs = require('fs');
const path = require('path');

const MONGODB_ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://havenpick1_db_user:gravitylab63@cluster0.ute96fe.mongodb.net/gravity_ai?retryWrites=true&w=majority';
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

let lastMongoError = null;

async function connectToDatabase() {
  if (cachedDb) {
    return { db: cachedDb, useRealMongo: true };
  }

  if (MongoClientObj) {
    try {
      const client = new MongoClientObj(MONGODB_ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 3000
      });
      await client.connect();
      const db = client.db('gravity_ai');
      cachedDb = db;
      useRealMongo = true;
      lastMongoError = null;
      return { db: db, useRealMongo: true };
    } catch (err) {
      lastMongoError = err.message;
      console.error('[MongoDB Atlas Connection Failed]:', err.message);
    }
  }

  return { db: null, useRealMongo: false, error: lastMongoError || 'No driver' };
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

function loadMongoRequestsLocal() {
  const reqFile = path.join(process.cwd(), 'mongodb_requests.json');
  try {
    if (fs.existsSync(reqFile)) {
      const data = fs.readFileSync(reqFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[MongoDB Local Requests Read Error]:', e);
  }
  return [];
}

function saveMongoRequestsLocal(requests) {
  const reqFile = path.join(process.cwd(), 'mongodb_requests.json');
  try {
    fs.writeFileSync(reqFile, JSON.stringify(requests, null, 2), 'utf8');
  } catch (e) {
    console.error('[MongoDB Local Requests Write Error]:', e);
  }
}

module.exports = {
  connectToDatabase,
  loadMongoUsersLocal,
  saveMongoUsersLocal,
  loadMongoRequestsLocal,
  saveMongoRequestsLocal
};
