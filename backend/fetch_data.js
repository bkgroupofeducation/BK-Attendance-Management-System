const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB.\n');
  const collections = await mongoose.connection.db.collections();
  
  for (let c of collections) {
    const count = await c.countDocuments();
    const docs = await c.find().limit(2).toArray();
    console.log(`=== Collection: ${c.collectionName} (Total: ${count}) ===`);
    console.log(JSON.stringify(docs, null, 2));
    console.log('\n');
  }
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
