const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  fingerprint_id: { type: String, required: true, unique: true },
  photoUrl: { type: String }
});

const User = mongoose.model('User', userSchema);

async function setPhotos() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://bksciencetutorials_db_user:pass123@cluster0.yjel3nd.mongodb.net/bioattend?retryWrites=true&w=majority');
  console.log('Connected to DB');
  
  // Set a nice placeholder avatar for user 1 (Admin User / Punam)
  await User.findOneAndUpdate({ id: 1 }, { photoUrl: 'https://i.pravatar.cc/150?u=punam' });
  
  await User.findOneAndUpdate({ id: 29 }, { photoUrl: 'https://i.postimg.cc/kBhkMqNd/image.jpg' });
  console.log('Successfully updated User 29 photoUrl!');
  process.exit(0);
}

setPhotos();
