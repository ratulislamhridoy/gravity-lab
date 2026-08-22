const { connectToDatabase, loadMongoRequestsLocal, saveMongoRequestsLocal, loadMongoUsersLocal, saveMongoUsersLocal } = require('../db');

module.exports = async (req, res) => {
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
    const { requestId, action } = req.body || {};
    if (!requestId || !action) {
      res.status(400).json({ ok: false, error: 'Missing required validation variables' });
      return;
    }

    const { db, useRealMongo } = await connectToDatabase();
    let requestObj = null;

    // 1. Locate Request
    if (useRealMongo && db) {
      const colReq = db.collection('subscription_requests');
      requestObj = await colReq.findOne({ id: requestId });
    } else {
      const reqList = loadMongoRequestsLocal();
      requestObj = reqList.find(r => r.id === requestId);
    }

    if (!requestObj) {
      res.status(404).json({ ok: false, error: 'Payment request not found' });
      return;
    }

    if (requestObj.status !== 'pending') {
      res.status(400).json({ ok: false, error: 'Request has already been processed' });
      return;
    }

    const isApprove = action === 'approve';
    const finalStatus = isApprove ? 'approved' : 'rejected';

    // 2. Perform Request Update
    if (useRealMongo && db) {
      const colReq = db.collection('subscription_requests');
      await colReq.updateOne({ id: requestId }, { $set: { status: finalStatus } });
    } else {
      const reqList = loadMongoRequestsLocal();
      const reqIdx = reqList.findIndex(r => r.id === requestId);
      if (reqIdx >= 0) {
        reqList[reqIdx].status = finalStatus;
        saveMongoRequestsLocal(reqList);
      }
    }

    // 3. Update User if Approved
    if (isApprove) {
      // Calculate Expiry Date from Now
      const days = requestObj.plan === 'monthly' ? 30 : 180;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      const expiryStr = expiryDate.toISOString();

      if (useRealMongo && db) {
        const colUser = db.collection('users');
        const query = {
          $or: [
            { uid: requestObj.uid },
            { email: { $regex: new RegExp('^' + requestObj.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') } }
          ]
        };
        await colUser.updateOne(query, {
          $set: {
            subscription: requestObj.plan,
            subscriptionExpiry: expiryStr
          }
        });
      } else {
        const usersList = loadMongoUsersLocal();
        const userIdx = usersList.findIndex(u => u.uid === requestObj.uid || (u.email && u.email.toLowerCase() === requestObj.email.toLowerCase()));
        if (userIdx >= 0) {
          usersList[userIdx].subscription = requestObj.plan;
          usersList[userIdx].subscriptionExpiry = expiryStr;
          saveMongoUsersLocal(usersList);
        }
      }
    }

    res.status(200).json({ 
      ok: true, 
      message: `Payment request successfully ${finalStatus}`,
      uid: isApprove ? requestObj.uid : null,
      email: isApprove ? requestObj.email : null,
      plan: isApprove ? requestObj.plan : null,
      expiry: isApprove ? expiryStr : null
    });
  } catch (err) {
    console.error('[Verify Billing Endpoint Error]:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
