const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const { spawn } = require('child_process');
const WebSocketRoot = require('./extracted_pixeva/node_modules/ws');

// Resolve GoogleFlowClient definition
const { GoogleFlowClient, MODELS } = require('./extracted_pixeva/src/google-flow-client');

// Electron integration for Native Filesystem Save
let electronAvailable = false;
let dialogObj = null;
let BrowserWindowObj = null;

try {
  const electron = require('electron');
  dialogObj = electron.dialog;
  BrowserWindowObj = electron.BrowserWindow;
  electronAvailable = true;
} catch (e) {
  console.log('Running outside Electron environment');
}

const PORT = process.env.PORT || 8080;
const FLOW_PROFILE_FILE = path.join(__dirname, 'flow-profiles.json');
const FLOW_DEFAULT_PORT = 9222;

let flowProfiles = null;
const flowClients = new Map();
const flowGenerationRuns = new Set();
const flowProfileOperations = new Map();
let flowRunId = null;
const flowRunDisabled = new Set();

// --- Profile Helper Methods ---
function loadFlowProfiles() {
  if (flowProfiles) return flowProfiles;
  let stored = [];
  try {
    if (fs.existsSync(FLOW_PROFILE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FLOW_PROFILE_FILE, 'utf8'));
      stored = Array.isArray(parsed) ? parsed : (Array.isArray(parsed && parsed.profiles) ? parsed.profiles : []);
    }
  } catch (_) {}

  const seen = new Set();
  const hasStoredDefault = stored.some((item) => String(item && item.id || '').trim() === 'default');
  const seenPorts = new Set(hasStoredDefault ? [] : [FLOW_DEFAULT_PORT]);
  flowProfiles = [];
  
  const ordered = stored.slice().sort((a, b) => {
    const aDefault = String(a && a.id || '').trim() === 'default';
    const bDefault = String(b && b.id || '').trim() === 'default';
    return Number(bDefault) - Number(aDefault);
  });

  for (const item of ordered) {
    const id = String(item && item.id || '').trim();
    let port = id === 'default' ? FLOW_DEFAULT_PORT : Number(item && item.port);
    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id) || seen.has(id)) continue;
    if (!Number.isInteger(port) || port < 1024 || port > 65535) continue;
    while (seenPorts.has(port) && port < 65535) port++;
    if (seenPorts.has(port)) continue;
    seen.add(id);
    seenPorts.add(port);
    flowProfiles.push({
      id,
      label: String(item.label || id),
      port
    });
  }

  if (!seen.has('default')) {
    flowProfiles.unshift({ id: 'default', label: 'Browser 1', port: FLOW_DEFAULT_PORT });
  }
  saveFlowProfiles();
  return flowProfiles;
}

function saveFlowProfiles() {
  try {
    fs.writeFileSync(FLOW_PROFILE_FILE, JSON.stringify({ profiles: flowProfiles }, null, 2), 'utf8');
  } catch (err) {
    console.error('flow-profiles-save failed:', err);
  }
}

function getFlowProfile(profileId = 'default') {
  const id = String(profileId || 'default');
  return loadFlowProfiles().find((profile) => profile.id === id) || null;
}

function requireFlowProfile(profileId = 'default') {
  const profile = getFlowProfile(profileId);
  if (!profile) throw new Error(`Unknown Flow browser profile: ${profileId}`);
  return profile;
}

function getFlowClient(profileId = 'default') {
  const profile = requireFlowProfile(profileId);
  let client = flowClients.get(profile.id);
  if (!client) {
    client = new GoogleFlowClient({
      profileId: profile.id,
      label: profile.label,
      port: profile.port
    });
    flowClients.set(profile.id, client);
  }
  return client;
}

function flowProfileStatus(profile) {
  const client = flowClients.get(profile.id);
  const base = {
    id: profile.id,
    profileId: profile.id,
    label: profile.label,
    port: profile.port,
    status: 'disconnected',
    connected: false,
    browserRunning: false,
    hasTokens: false,
    projectId: null,
    paused: false,
    quotaExhausted: false,
    globalCooldownMs: 0
  };
  return client ? { ...base, ...client.getStatus(), id: profile.id, profileId: profile.id, label: profile.label, port: profile.port } : base;
}

function getFlowPoolStatus() {
  const profiles = loadFlowProfiles().map(flowProfileStatus);
  const connectedCount = profiles.filter((profile) => profile.connected).length;
  return {
    status: connectedCount ? 'connected' : 'disconnected',
    connected: connectedCount > 0,
    browserRunning: profiles.some((profile) => profile.browserRunning),
    connectedCount,
    totalProfiles: profiles.length,
    profiles
  };
}

async function withFlowProfileOperation(profileId, operation) {
  const previous = flowProfileOperations.get(profileId) || Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  flowProfileOperations.set(profileId, current);
  try {
    return await current;
  } finally {
    if (flowProfileOperations.get(profileId) === current) flowProfileOperations.delete(profileId);
  }
}

function isTcpPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

async function allocateFlowPort() {
  const used = new Set(loadFlowProfiles().map((profile) => profile.port));
  for (let port = FLOW_DEFAULT_PORT; port < FLOW_DEFAULT_PORT + 200; port++) {
    if (used.has(port)) continue;
    if (await isTcpPortAvailable(port)) return port;
  }
  throw new Error('No free browser debug port is available.');
}

function flowPromptFileStem(prompt) {
  const words = String(prompt || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  let stem = words.join('_')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 120);
  if (!stem) stem = 'flow-image';
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(stem)) stem = `flow_${stem}`;
  return stem;
}

function uniqueFlowImagePath(outputDir, stem) {
  let target = path.join(outputDir, `${stem}.png`);
  let n = 1;
  while (fs.existsSync(target)) target = path.join(outputDir, `${stem} (${n++}).png`);
  return target;
}

// --- Static HTTP Server ---
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// --- MongoDB Storage Engine ---
const MONGODB_ATLAS_URI = process.env.MONGODB_URI || 'mongodb+srv://havenpick1_db_user:gravitylab63@cluster0.ute96fe.mongodb.net/gravity_ai?retryWrites=true&w=majority';
const MONGODB_FILE = path.join(__dirname, 'mongodb_users.json');

let mongoClient = null;
let useRealMongo = false;
let dbInstance = null;

try {
  const { MongoClient } = require('mongodb');
  mongoClient = new MongoClient(MONGODB_ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  });
  mongoClient.connect()
    .then((client) => {
      dbInstance = client.db('gravity_ai');
      useRealMongo = true;
      console.log('[MongoDB Atlas]: Successfully connected to database gravity_ai');
    })
    .catch((err) => {
      console.error('[MongoDB Atlas]: Connection failed, falling back to local JSON storage. Error:', err.message);
    });
} catch (e) {
  console.log('[MongoDB Driver Note]: mongodb package not installed, using local file-based database fallback.');
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

const MONGODB_REQUESTS_FILE = path.join(__dirname, 'mongodb_requests.json');

function loadMongoRequestsLocal() {
  try {
    if (fs.existsSync(MONGODB_REQUESTS_FILE)) {
      const data = fs.readFileSync(MONGODB_REQUESTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[MongoDB Local Requests Read Error]:', e);
  }
  return [];
}

function saveMongoRequestsLocal(requests) {
  try {
    fs.writeFileSync(MONGODB_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
  } catch (e) {
    console.error('[MongoDB Local Requests Write Error]:', e);
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  let urlPath = req.url.split('?')[0];

  // API Route: Track User (POST)
  if (urlPath === '/api/users/track' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const userData = JSON.parse(body || '{}');
        if (!userData || (!userData.uid && !userData.email)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Invalid user data' }));
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

        if (useRealMongo && dbInstance) {
          const col = dbInstance.collection('users');
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
            userObj.creditsDaily = { remaining: 30, lastResetDate: now.split('T')[0] };
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
            userObj.creditsDaily = { remaining: 30, lastResetDate: now.split('T')[0] };
            users.unshift(userObj);
          }
          saveMongoUsersLocal(users);
          count = users.length;
        }

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true, message: 'User tracked in MongoDB DB', user: finalUser, count: count }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: Clear Test Users (POST)
  if (req.url === '/api/users/clear-test' && req.method === 'POST') {
    if (useRealMongo && dbInstance) {
      const col = dbInstance.collection('users');
      col.deleteMany({
        $or: [
          { uid: /^user_test_/ },
          { email: /@gravitylab\.ai/ }
        ]
      })
      .then(async () => {
        const users = await col.find().toArray();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, users: users }));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      });
    } else {
      let users = loadMongoUsersLocal();
      users = users.filter(u => !String(u.uid || '').startsWith('user_test_') && !String(u.email || '').includes('@gravitylab.ai'));
      saveMongoUsersLocal(users);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, users: users }));
    }
    return;
  }

  // API Route: Debug DB Users (GET)
  if (req.url === '/api/users/debug-db' && req.method === 'GET') {
    if (useRealMongo && dbInstance) {
      const col = dbInstance.collection('users');
      col.find().toArray()
        .then(users => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, count: users.length, users }));
        })
        .catch(err => {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: err.message }));
        });
    } else {
      let users = loadMongoUsersLocal();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: users.length, users, fallback: true }));
    }
    return;
  }

  // API Route: Update User Plan (POST)
  if (urlPath === '/api/users/update-plan' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { uid, email, plan, expiry } = JSON.parse(body || '{}');
        if (!uid) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'User UID is required' }));
          return;
        }

        if (useRealMongo && dbInstance) {
          const col = dbInstance.collection('users');
          const query = {
            $or: [
              { uid: uid },
              { email: { $regex: new RegExp('^' + (email || '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } }
            ]
          };
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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Plan updated' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: Update User Credits (POST)
  if (urlPath === '/api/users/update-credits' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { uid, remaining, lastResetDate } = JSON.parse(body || '{}');
        if (!uid) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'User UID is required' }));
          return;
        }

        if (useRealMongo && dbInstance) {
          const col = dbInstance.collection('users');
          await col.updateOne({ uid: uid }, {
            $set: {
              creditsDaily: {
                remaining: remaining ?? 30,
                lastResetDate: lastResetDate || new Date().toISOString().split('T')[0]
              }
            }
          });
        } else {
          // File Fallback
          let users = loadMongoUsersLocal();
          let index = users.findIndex(u => u.uid === uid);
          if (index >= 0) {
            users[index].creditsDaily = {
              remaining: remaining ?? 30,
              lastResetDate: lastResetDate || new Date().toISOString().split('T')[0]
            };
            saveMongoUsersLocal(users);
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Credits updated' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // Helper for Telegram notifications
  function sendTelegramAlert(payload) {
    return new Promise((resolve) => {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (!token || !chatId) {
        resolve(false);
        return;
      }
      const https = require('https');
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
        res.on('end', () => { resolve(true); });
      });
      req.on('error', (e) => { resolve(false); });
      req.write(postData);
      req.end();
    });
  }

  // API Route: Request Subscription (POST)
  if (urlPath === '/api/subscriptions/request' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data.uid || !data.email || !data.plan || !data.method) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Missing required request parameters' }));
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

        if (useRealMongo && dbInstance) {
          await dbInstance.collection('subscription_requests').insertOne(newRequest);
        } else {
          const list = loadMongoRequestsLocal();
          list.push(newRequest);
          saveMongoRequestsLocal(list);
        }

        await sendTelegramAlert(newRequest);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Request submitted successfully', request: newRequest }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: List Subscriptions (GET)
  if (urlPath === '/api/subscriptions/list' && req.method === 'GET') {
    (async () => {
      try {
        let requests = [];
        if (useRealMongo && dbInstance) {
          requests = await dbInstance.collection('subscription_requests').find({}).sort({ createdAt: -1 }).toArray();
        } else {
          requests = loadMongoRequestsLocal();
          requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, requests }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    })();
    return;
  }

  // API Route: Verify Subscription (POST)
  if (urlPath === '/api/subscriptions/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { requestId, action } = JSON.parse(body || '{}');
        if (!requestId || !action) {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Missing required parameters' }));
          return;
        }

        let requestObj = null;
        if (useRealMongo && dbInstance) {
          requestObj = await dbInstance.collection('subscription_requests').findOne({ id: requestId });
        } else {
          const reqList = loadMongoRequestsLocal();
          requestObj = reqList.find(r => r.id === requestId);
        }

        if (!requestObj) {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Request not found' }));
          return;
        }

        if (requestObj.status !== 'pending') {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, error: 'Request already processed' }));
          return;
        }

        const isApprove = action === 'approve';
        const finalStatus = isApprove ? 'approved' : 'rejected';

        // Update Request
        if (useRealMongo && dbInstance) {
          await dbInstance.collection('subscription_requests').updateOne({ id: requestId }, { $set: { status: finalStatus } });
        } else {
          const reqList = loadMongoRequestsLocal();
          const idx = reqList.findIndex(r => r.id === requestId);
          if (idx >= 0) {
            reqList[idx].status = finalStatus;
            saveMongoRequestsLocal(reqList);
          }
        }

        // Update User if Approved
        if (isApprove) {
          const days = requestObj.plan === 'monthly' ? 30 : 180;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + days);
          const expiryStr = expiryDate.toISOString();

          if (useRealMongo && dbInstance) {
            const query = {
              $or: [
                { uid: requestObj.uid },
                { email: { $regex: new RegExp('^' + requestObj.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } }
              ]
            };
            await dbInstance.collection('users').updateOne(query, {
              $set: {
                subscription: requestObj.plan,
                subscriptionExpiry: expiryStr
              }
            });
          } else {
            const users = loadMongoUsersLocal();
            const idx = users.findIndex(u => u.uid === requestObj.uid || (u.email && u.email.toLowerCase() === requestObj.email.toLowerCase()));
            if (idx >= 0) {
              users[idx].subscription = requestObj.plan;
              users[idx].subscriptionExpiry = expiryStr;
              saveMongoUsersLocal(users);
            }
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: `Request successfully ${finalStatus}` }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // API Route: List Users (GET)
  if (urlPath === '/api/users/list' && req.method === 'GET') {
    if (useRealMongo && dbInstance) {
      dbInstance.collection('users').find().toArray()
        .then((users) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, count: users.length, users }));
        })
        .catch((err) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: err.message }));
        });
    } else {
      const users = loadMongoUsersLocal();
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, count: users.length, users }));
    }
    return;
  }

  const FRONTEND_ROUTES = ['/promptgen', '/flowgen', '/slicer', '/vectorizer', '/Vectorizer', '/bannergen', '/dashboard'];

  if (urlPath === '/') urlPath = '/index.html';
  
  const localPath = path.join(__dirname, urlPath.replace(/\//g, path.sep));
  
  // Guard traversal
  if (!localPath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }
  
  fs.stat(localPath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (FRONTEND_ROUTES.includes(urlPath)) {
        const indexPath = path.join(__dirname, 'index.html');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
      return;
    }
    
    // Serve file
    const ext = path.extname(localPath).toLowerCase();
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(localPath).pipe(res);
  });
});

// --- WebSocket API ---
const logFile = path.join(__dirname, 'server.log');
function logToFile(msg) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync(logFile, `[${ts}] ${msg}\n`, 'utf8');
  } catch (_) {}
}

const wss = new WebSocketRoot.Server({ server });

wss.on('connection', (ws) => {
  logToFile('[ws-server] Client connected');
  console.log('[ws-server] Client connected');
  
  const sendToClient = (msgType, payload) => {
    if (ws.readyState === WebSocketRoot.OPEN) {
      ws.send(JSON.stringify({ type: msgType, ...payload }));
    }
  };

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { action, profileId, ...payload } = data;
      logToFile(`[ws-server] Event received: ${action} for profile: ${profileId}`);
      console.log(`[ws-server] Event received: ${action} for profile: ${profileId}`);

      switch (action) {
        case 'profiles': {
          sendToClient('profiles', { ok: true, ...getFlowPoolStatus() });
          break;
        }

        case 'profile-add': {
          try {
            const profiles = loadFlowProfiles();
            if (profiles.length >= 3) {
              throw new Error('Maximum of 3 browser profiles allowed to prevent performance issues.');
            }
            let n = 2;
            while (profiles.some((profile) => profile.id === `browser-${n}`)) n++;
            const profile = {
              id: `browser-${n}`,
              label: `Browser ${n}`,
              port: await allocateFlowPort()
            };
            profiles.push(profile);
            saveFlowProfiles();
            sendToClient('profile-add', { ok: true, profile, ...getFlowPoolStatus() });
          } catch (err) {
            sendToClient('profile-add', { ok: false, error: err.message });
          }
          break;
        }

        case 'status': {
          try {
            if (profileId) {
              sendToClient('status', { ok: true, profileId, status: flowProfileStatus(requireFlowProfile(profileId)) });
            } else {
              sendToClient('status', { ok: true, ...getFlowPoolStatus() });
            }
          } catch (err) {
            sendToClient('status', { ok: false, error: err.message });
          }
          break;
        }

        case 'login': {
          const targetProfileId = String(profileId || 'default');
          try {
            const profile = requireFlowProfile(targetProfileId);
            await withFlowProfileOperation(targetProfileId, async () => {
              const client = getFlowClient(targetProfileId);
              // Open Chrome in visible mode for user login
              await client.openLoginWindow(targetProfileId);
              try {
                await client.connect();
              } catch (e) {
                console.log('Connect during login route:', e.message);
              }
              
              sendToClient('login', { ok: true, profileId: targetProfileId, status: flowProfileStatus(profile) });
            });
          } catch (err) {
            sendToClient('login', { ok: false, profileId: targetProfileId, error: err.message });
          }
          break;
        }

        case 'init': {
          const targetProfileId = String(profileId || 'default');
          try {
            const profile = requireFlowProfile(targetProfileId);
            await withFlowProfileOperation(targetProfileId, async () => {
              const client = getFlowClient(targetProfileId);
              if (client.cdpWs && client.cdpWs.readyState === WebSocketRoot.OPEN && client.cdpSessionId) {
                sendToClient('init', { ok: true, message: 'Already connected', profileId: targetProfileId, status: flowProfileStatus(profile) });
                return;
              }
              await client.launchChrome();
              await client.connect();
              
              // Safe best-effort token/project collection
              try { await client.collectTokens(); } catch (e) { console.error('collectTokens err', e); }
              try { await client.ensureProjectId(); } catch (e) { console.error('ensureProjectId err', e); }
              
              sendToClient('init', { ok: true, message: 'Connected to Flow', profileId: targetProfileId, status: flowProfileStatus(profile) });
            });
          } catch (err) {
            sendToClient('init', { ok: false, profileId: targetProfileId, error: err.message });
          }
          break;
        }

        case 'generate': {
          try {
            const rawPrompts = Array.isArray(payload.prompts) ? payload.prompts.map((p) => String(p)) : [];
            if (!rawPrompts.length) {
              sendToClient('generate-result', { ok: false, error: 'No prompts supplied.' });
              break;
            }

            const imagesPerPrompt = Math.max(1, Math.min(4, Number(payload.imagesPerPrompt) || 1));
            const prompts = [];
            const requestedIndices = [];
            rawPrompts.forEach((p, idx) => {
              for (let k = 0; k < imagesPerPrompt; k++) {
                prompts.push(p);
                requestedIndices.push(idx * 100 + k);
              }
            });

            const runId = payload.runId == null ? null : payload.runId;
            if (runId !== flowRunId) {
              flowRunId = runId;
              flowRunDisabled.clear();
              for (const client of flowClients.values()) client.rateLimitedOff = false;
            }

            const requestedIds = Array.isArray(payload.profileIds)
              ? payload.profileIds.map((id) => String(id)).filter(Boolean)
              : [];
            
            const candidateProfiles = loadFlowProfiles()
              .filter((p) => !requestedIds.length || requestedIds.includes(p.id))
              .filter((p) => !flowRunDisabled.has(p.id))
              .map((p) => ({ profile: p, client: flowClients.get(p.id) }))
              .filter(({ client }) => client && client.cdpWs && client.cdpWs.readyState === WebSocketRoot.OPEN && client.cdpSessionId && !client.rateLimitedOff);

            if (!candidateProfiles.length) {
              const disabledNote = flowRunDisabled.size ? ' All selected browsers were rate-limited.' : '';
              sendToClient('generate-result', { ok: false, error: `No active connected Flow browsers found.${disabledNote} Please login/connect first.` });
              break;
            }
            
            const assignments = candidateProfiles.map(({ profile, client }) => ({ profile, client, jobs: [] }));
            prompts.forEach((prompt, index) => {
              assignments[index % assignments.length].jobs.push({ prompt, index: requestedIndices[index] });
            });

            const savedFiles = [];
            const results = [];
            const errors = [];
            const successfulIndexes = new Set();
            const errorIndexes = new Set();
            const progressByProfile = new Map(assignments.map(({ profile }) => [profile.id, 0]));
            const total = prompts.length;

            const sendProgress = () => {
              const completedStatus = Array.from(progressByProfile.values()).reduce((sum, val) => sum + val, 0);
              sendToClient('flow-progress', { runId, completed: completedStatus, total, browsers: assignments.length });
            };

            const recordError = (index, error, message) => {
              if (successfulIndexes.has(index) || errorIndexes.has(index)) return;
              errorIndexes.add(index);
              errors.push({ index, error: error || 'failed', message: message || '' });
            };

            const tasks = assignments.map(async ({ profile, client, jobs }) => {
              client.paused = false;
              let batchResult;
              try {
                batchResult = await client.generateBatch(
                  jobs.map((j) => j.prompt),
                  payload.options || {},
                  (done) => {
                    progressByProfile.set(profile.id, done);
                    sendProgress();
                  },
                  (localIndex, genResult) => {
                    const job = jobs[localIndex];
                    if (!job) return;
                    if (genResult && genResult.dataUrl) {
                      successfulIndexes.add(job.index);
                      results.push({ index: job.index, profileId: profile.id, ...genResult });
                      
                      let savedFile = null;
                      if (payload.outputDir) {
                        try {
                          let rawDir = payload.outputDir.trim();
                          let outDir;
                          if (path.isAbsolute(rawDir)) {
                            outDir = rawDir;
                          } else if (rawDir.toLowerCase().startsWith('downloads')) {
                            const subPath = rawDir.substring(9).replace(/^[\\\/]+/, '');
                            outDir = subPath ? path.join(os.homedir(), 'Downloads', subPath) : path.join(os.homedir(), 'Downloads');
                          } else {
                            outDir = path.resolve(__dirname, rawDir);
                          }
                          fs.mkdirSync(outDir, { recursive: true });
                          savedFile = uniqueFlowImagePath(outDir, flowPromptFileStem(job.prompt));
                          client.saveImage(savedFile, genResult.dataUrl);
                          savedFiles.push(savedFile);
                        } catch (saveErr) {
                          console.error('Save failed', saveErr);
                        }
                      }
                      
                      sendToClient('flow-item', {
                        runId,
                        profileId: profile.id,
                        index: job.index,
                        status: 'done',
                        dataUrl: genResult.dataUrl,
                        savedFile,
                        seed: genResult.seed || null,
                        model: genResult.model || null,
                        width: genResult.width || null,
                        height: genResult.height || null
                      });
                    } else {
                      const error = genResult && genResult.error || 'failed';
                      const errMsg = genResult && genResult.message || '';
                      recordError(job.index, error, errMsg);
                      sendToClient('flow-item', {
                        runId,
                        profileId: profile.id,
                        index: job.index,
                        status: 'error',
                        error,
                        message: errMsg
                      });
                    }
                  },
                  (localIndex) => {
                    const job = jobs[localIndex];
                    if (job) {
                      sendToClient('flow-item', { runId, profileId: profile.id, index: job.index, status: 'processing' });
                    }
                  },
                  payload.concurrency
                );
              } catch (err) {
                batchResult = { ok: false, error: 'worker_exception', message: err.message };
                console.error(`flow-generate-${profile.id} failed`, err);
              }

              if (batchResult && !batchResult.ok && batchResult.error !== 'rate_limited_off') {
                for (const job of jobs) recordError(job.index, batchResult.error || 'failed', batchResult.message || '');
              }
              for (const it of (batchResult && batchResult.errors) || []) {
                const job = jobs[it.index];
                if (job) recordError(job.index, it.error, it.message);
              }

              if (client.rateLimitedOff && !flowRunDisabled.has(profile.id)) {
                flowRunDisabled.add(profile.id);
                sendToClient('flow-browser', { profileId: profile.id, label: profile.label || profile.id, status: 'rate_limited_off' });
              }
              return { profileId: profile.id, batchResult };
            });

            const generationRun = Promise.all(tasks);
            flowGenerationRuns.add(generationRun);
            try {
              await generationRun;
            } finally {
              flowGenerationRuns.delete(generationRun);
            }
            
            sendProgress();
            sendToClient('generate-result', {
              ok: true,
              results,
              errors,
              savedFiles,
              completed: successfulIndexes.size + errorIndexes.size,
              total,
              profileIds: assignments.map(({ profile }) => profile.id)
            });

          } catch (err) {
            console.error('Generation failed', err);
            sendToClient('generate-result', { ok: false, error: err.message });
          }
          break;
        }

        case 'stop': {
          try {
            const clients = profileId ? [getFlowClient(profileId)] : Array.from(flowClients.values());
            clients.forEach(c => c.stop());
            const runs = Array.from(flowGenerationRuns);
            if (runs.length) await Promise.allSettled(runs);
            sendToClient('stop', { ok: true });
          } catch (err) {
            sendToClient('stop', { ok: false, error: err.message });
          }
          break;
        }

        case 'disconnect': {
          try {
            const profiles = profileId ? [requireFlowProfile(profileId)] : loadFlowProfiles();
            await Promise.all(profiles.map(p => withFlowProfileOperation(p.id, async () => {
              const client = flowClients.get(p.id);
              if (client) await client.disconnect();
            })));
            sendToClient('disconnect', { ok: true, ...getFlowPoolStatus() });
          } catch (err) {
            sendToClient('disconnect', { ok: false, error: err.message });
          }
          break;
        }

        case 'save-vector-sheet': {
          try {
            const outputDirName = payload.outputDir || 'output/icon_sheets';
            const targetDir = path.isAbsolute(outputDirName)
              ? outputDirName
              : path.join(__dirname, outputDirName);

            fs.mkdirSync(targetDir, { recursive: true });

            const timestamp = Date.now();
            const sheetFilename = `icon_sheet_${timestamp}.svg`;
            const sheetPath = path.join(targetDir, sheetFilename);

            if (payload.sheetSvg) {
              fs.writeFileSync(sheetPath, payload.sheetSvg, 'utf8');
            }

            const sheetEpsFilename = `icon_sheet_${timestamp}.eps`;
            const sheetEpsPath = path.join(targetDir, sheetEpsFilename);
            if (payload.sheetEps) {
              fs.writeFileSync(sheetEpsPath, payload.sheetEps, 'utf8');
            }

            const savedIcons = [];
            if (Array.isArray(payload.iconSvgs)) {
              payload.iconSvgs.forEach((svgContent, idx) => {
                const iconFilename = `icon_${timestamp}_${idx + 1}.svg`;
                const iconPath = path.join(targetDir, iconFilename);
                fs.writeFileSync(iconPath, svgContent, 'utf8');
                savedIcons.push(iconFilename);
              });
            }

            const savedEpsIcons = [];
            if (Array.isArray(payload.iconEpsList)) {
              payload.iconEpsList.forEach((epsContent, idx) => {
                const iconFilename = `icon_${timestamp}_${idx + 1}.eps`;
                const iconPath = path.join(targetDir, iconFilename);
                fs.writeFileSync(iconPath, epsContent, 'utf8');
                savedEpsIcons.push(iconFilename);
              });
            }

            sendToClient('save-vector-sheet', {
              ok: true,
              sheetFile: sheetPath,
              sheetEpsFile: sheetEpsPath,
              savedIconsCount: savedIcons.length,
              savedEpsCount: savedEpsIcons.length,
              targetDir
            });
          } catch (err) {
            console.error('Vector sheet save error:', err);
            sendToClient('save-vector-sheet', { ok: false, error: err.message });
          }
          break;
        }

        case 'save-text-file': {
          try {
            const fileName = payload.fileName || 'file.txt';
            const fileContent = payload.fileContent || '';
            const fileFilters = payload.filters || [
              { name: 'Text Files', extensions: ['txt'] },
              { name: 'All Files', extensions: ['*'] }
            ];

            let filePath = null;

            if (electronAvailable && dialogObj) {
              const saveOptions = {
                title: 'Save Prompt File',
                defaultPath: fileName,
                filters: fileFilters
              };

              let win = null;
              try {
                if (BrowserWindowObj && typeof BrowserWindowObj.getFocusedWindow === 'function') {
                  win = BrowserWindowObj.getFocusedWindow();
                }
              } catch (_) {}

              if (win) {
                filePath = dialogObj.showSaveDialogSync(win, saveOptions);
              } else {
                filePath = dialogObj.showSaveDialogSync(saveOptions);
              }
              
              if (!filePath) {
                // User cancelled the dialog
                sendToClient('save-text-file', { ok: false, cancelled: true });
                break;
              }
            } else {
              // Fallback to auto saving inside output/prompts if running on bare node server
              const outputDirName = 'output/prompts';
              const targetDir = path.isAbsolute(outputDirName)
                ? outputDirName
                : path.join(__dirname, outputDirName);
              fs.mkdirSync(targetDir, { recursive: true });
              filePath = path.join(targetDir, fileName);
            }

            fs.writeFileSync(filePath, fileContent, 'utf8');

            sendToClient('save-text-file', {
              ok: true,
              filePath,
              fileName,
              cancelled: false
            });
          } catch (err) {
            console.error('File save error:', err);
            sendToClient('save-text-file', { ok: false, error: err.message });
          }
          break;
        }

        case 'client-error': {
          logToFile(`[client-error] ${payload.error}`);
          console.error(`[client-error] ${payload.error}`);
          break;
        }

        case 'client-log': {
          logToFile(`[client-log] ${payload.message}`);
          console.log(`[client-log] ${payload.message}`);
          break;
        }

        case 'vectorize-tile': {
          try {
            logToFile(`[ws-server] vectorize-tile init for tile index: ${payload.index}`);
            const { vectorize } = require('./extracted_pixeva/src/vectorize-engine');
            const dataUrl = payload.dataUrl;
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            const options = {
              mode: payload.mode || 'bw',
              color: payload.color || '#000000',
              smoothing: payload.smoothing !== undefined ? Number(payload.smoothing) : 5,
              preblur: Math.round((payload.smoothing !== undefined ? Number(payload.smoothing) : 5) * (payload.maxRes ? Number(payload.maxRes) : 1600) / 1600),
              
              // Enable high-quality tracing to match Pixeva AI based on client values
              traceAtMaxRes: true,
              maxRes: payload.maxRes !== undefined ? Number(payload.maxRes) : 1600,
              corner: payload.corner !== undefined ? Number(payload.corner) : 133,
              length: payload.simplify !== undefined ? Number(payload.simplify) : 5.5,
              speckle: payload.speckle !== undefined ? Number(payload.speckle) : 3,
              smooth: payload.optimise !== undefined ? !!payload.optimise : true,
              upscale: payload.upscale !== undefined ? Number(payload.upscale) : 1
            };

            logToFile(`[ws-server] tracing curves for index: ${payload.index} options: ${JSON.stringify(options)}`);
            const result = await vectorize(buffer, options);
            logToFile(`[ws-server] tracing complete for index: ${payload.index}, hasInk: ${result.hasInk}`);
            sendToClient('vectorize-tile-result', {
              ok: true,
              index: payload.index,
              svg: result.svg,
              hasInk: result.hasInk
            });
          } catch (err) {
            logToFile(`[ws-server] vectorize-tile error for index: ${payload.index}: ${err.stack || err.message}`);
            console.error('Vectorize tile error:', err);
            sendToClient('vectorize-tile-result', {
              ok: false,
              index: payload.index,
              error: err.message
            });
          }
          break;
        }

        default:
          sendToClient('error', { error: `Unknown action: ${action}` });
      }
    } catch (e) {
      console.error('[ws-server] Parsing error:', e);
      sendToClient('error', { error: 'Failed to process message' });
    }
  });

  ws.on('close', () => {
    console.log('[ws-server] Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`[server] Gravity AI Studio running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  for (const client of flowClients.values()) {
    try { client.disconnect(); } catch (_) {}
  }
  process.exit(0);
});
