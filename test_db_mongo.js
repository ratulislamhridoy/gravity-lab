const { MongoClient } = require('mongodb');
const MONGODB_ATLAS_URI = 'mongodb+srv://havenpick1_db_user:gravitylab63@cluster0.ute96fe.mongodb.net/?appName=Cluster0';

async function main() {
  const client = new MongoClient(MONGODB_ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  });
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log('Databases list:');
    for (let dbInfo of dbs.databases) {
      console.log(`- ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const cols = await db.listCollections().toArray();
      cols.forEach(c => {
        console.log(`    * Collection: ${c.name}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}
main();
