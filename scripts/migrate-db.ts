import { MongoClient } from 'mongodb';

const OLD_URI = "mongodb://alokyadav83956_db_user:aethera@ac-5cv7upq-shard-00-00.toxa10r.mongodb.net:27017,ac-5cv7upq-shard-00-01.toxa10r.mongodb.net:27017,ac-5cv7upq-shard-00-02.toxa10r.mongodb.net:27017/?ssl=true&replicaSet=atlas-5irjbc-shard-0&authSource=admin&retryWrites=true&w=majority";
const NEW_URI = "mongodb+srv://aethravia_db_user:IRR1Upl1XTOVNgFQ@aethravia.smadl1m.mongodb.net/aetheravia?retryWrites=true&w=majority";

async function migrate() {
  console.log("Connecting to old database...");
  const oldClient = await MongoClient.connect(OLD_URI);
  const oldDb = oldClient.db('test'); // The old default database

  console.log("Connecting to new database...");
  const newClient = await MongoClient.connect(NEW_URI);
  const newDb = newClient.db('aetheravia');

  const collections = await oldDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections.`);
  
  for (const coll of collections) {
    const collName = coll.name;
    console.log(`\nCopying collection: ${collName}`);
    
    const docs = await oldDb.collection(collName).find({}).toArray();
    if (docs.length > 0) {
      await newDb.collection(collName).deleteMany({});
      await newDb.collection(collName).insertMany(docs);
      console.log(`✅ Copied ${docs.length} documents into ${collName}`);
    } else {
      console.log(`⚠️ Collection ${collName} is empty. Skipping.`);
    }
  }

  console.log("\n🎉 Migration complete!");
  await oldClient.close();
  await newClient.close();
}

migrate().catch(console.error);
