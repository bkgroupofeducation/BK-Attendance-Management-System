const mongoose = require('mongoose');
const uri = 'mongodb://bksciencetutorials_db_user:pass123@ac-bxobcbg-shard-00-00.yjel3nd.mongodb.net:27017,ac-bxobcbg-shard-00-01.yjel3nd.mongodb.net:27017,ac-bxobcbg-shard-00-02.yjel3nd.mongodb.net:27017/bioattend?ssl=true&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
  console.log('Connected to MongoDB. Wiping database...');
  await mongoose.connection.db.collection('users').deleteMany({});
  await mongoose.connection.db.collection('punches').deleteMany({});
  console.log('Successfully wiped fake data from MongoDB!');
  process.exit(0);
}).catch(err => {
  console.error('Mongo Error:', err.message);
  process.exit(1);
});
