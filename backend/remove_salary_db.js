const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/bioattend';

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      {},
      { $unset: { salary: "" } }
    );
    console.log(`Updated ${result.modifiedCount} documents, unsetting salary field.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
