require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Enable CORS for Socket.io and Express
app.use(cors());

// Setup static directory for uploaded punch photos
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Parse biometric device requests conditionally (raw buffer for photos, text for logs)
app.use('/iclock', (req, res, next) => {
  if (req.query.table === 'ATTPHOTO' || req.query.table === 'BIOPHOTO') {
    express.raw({ type: '*/*', limit: '15mb' })(req, res, next);
  } else {
    express.text({ type: '*/*', limit: '10mb' })(req, res, next);
  }
});

// Parse JSON body for all standard API requests
app.use(express.json());

// Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Configure mongoose settings to avoid hanging on connection failure
mongoose.set('bufferCommands', false);

// Connect to MongoDB with timeout options
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bioattend';
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
  .then(() => {
    console.log('🍃 Connected to MongoDB (Unified Backend Server)');
    seedUsers();
    seedDevices();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Running in mock fallback mode due to database offline.');
  });
const LOCAL_DB_PATH = path.join(__dirname, 'users.json');
const LOCAL_PUNCHES_DB_PATH = path.join(__dirname, 'punches.json');

function initLocalPunches() {
  if (!fs.existsSync(LOCAL_PUNCHES_DB_PATH)) {
    fs.writeFileSync(LOCAL_PUNCHES_DB_PATH, JSON.stringify([], null, 2));
    console.log('🌱 Initialized local punches JSON file database');
  }
}
initLocalPunches();

function getLocalPunches() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_PUNCHES_DB_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveLocalPunches(punches) {
  try {
    fs.writeFileSync(LOCAL_PUNCHES_DB_PATH, JSON.stringify(punches, null, 2));
  } catch (e) {
    console.error('❌ Error saving local punches:', e);
  }
}

const pendingCommands = {};

function queueCommand(sn, cmdText) {
  if (!pendingCommands[sn]) pendingCommands[sn] = [];
  pendingCommands[sn].push(cmdText);
}

function initLocalUsers() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2));
    console.log('🌱 Initialized local users JSON file database');
  }
}
initLocalUsers();

function getLocalUsers() {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('❌ Error saving local users:', e);
  }
}

// --- Database Schemas & Models ---
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  fingerprint_id: { type: String, required: true, unique: true },
  experience: { type: String },
  subject: { type: String },
  timing: { type: String },
  profession: { type: String },
  email: { type: String },
  studentPhone: { type: String },
  parentPhone: { type: String },
  aadhar: { type: String },
  gender: { type: String },
  dob: { type: String },
  marks10th: { type: String },
  marks12th: { type: String },
  address: { type: String },
  branch: { type: String },
  courses: { type: [String] },
  fee: { type: Number },
  enquiryDate: { type: String },
  batchTiming: { type: String },
  previousSchool: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  accountHolder: { type: String },
  amountReceived: { type: String },
  paymentMode: { type: String },
  installment: { type: String },
  receiptNo: { type: String },
  amountReceivedWords: { type: String },
  dueFees: { type: Number },
  salary: { type: Number },
  profession: { type: String },
  photoUrl: { type: String, required: false },
  photo: { type: String },
  experience: { type: String },
  subject: { type: String },
  timing: { type: String }
});
const User = mongoose.model('User', userSchema);

const punchSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  deviceSn: { type: String, required: true },
  direction: { type: String, enum: ['in', 'out'], default: 'in' },
  verifyMode: { type: String, default: '1' }, // 1 = Fingerprint, 15 = Face
  createdAt: { type: Date, default: Date.now }
});
const Punch = mongoose.model('Punch', punchSchema);

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1200 }
});
const Counter = mongoose.model('Counter', counterSchema);


const deviceSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
  status: { type: String, default: 'online' }
});
const Device = mongoose.model('Device', deviceSchema);

// Seed default users if DB is empty or update existing
async function seedUsers() {
  try {
    // Unset the old photoUrl field from all users in MongoDB
    await User.updateMany({}, { $unset: { photoUrl: "" } });
    
    const localUsers = getLocalUsers();
    for (const user of localUsers) {
      await User.findOneAndUpdate(
        { id: user.id },
        { 
          name: user.name,
          role: user.role,
          fingerprint_id: user.fingerprint_id,
          photo: user.photo || null
        },
        { upsert: true, new: true }
      );
    }
    console.log(`🌱 Synchronized ${localUsers.length} users from users.json to MongoDB`);
  } catch (err) {
    console.error('❌ Error seeding/synchronizing users:', err.message);
  }
}

// Seed default devices if DB is empty
async function seedDevices() {
  try {
    const count = await Device.countDocuments();
    if (count === 0) {
      await Device.insertMany([
        { serialNumber: 'NYU7260401606', name: 'Bio System (x 2006)', lastActive: new Date(), status: 'online' }
      ]);
      console.log('🌱 Seeded real eSSL device to MongoDB');
    }
  } catch (err) {
    console.error('❌ Error seeding devices:', err.message);
  }
}

// Helper to track device activity
async function trackDeviceActivity(serialNumber) {
  if (!serialNumber) return;
  if (mongoose.connection.readyState === 1) {
    try {
      await Device.findOneAndUpdate(
        { serialNumber },
        { serialNumber, lastActive: new Date(), status: 'online' },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('❌ Error tracking device activity:', err.message);
    }
  }
}

// --- Socket.io Events ---
io.on('connection', (socket) => {
  console.log(`🔌 Dashboard Client Connected (Socket ID: ${socket.id})`);
});

// ===== REQUEST LOGGER (logs every HTTP request from device) =====
app.use((req, res, next) => {
  const from = req.ip || req.connection.remoteAddress;
  if (req.path.startsWith('/iclock')) {
    console.log(`\n📡 [${new Date().toLocaleTimeString()}] DEVICE REQUEST: ${req.method} ${req.path}`);
    console.log(`   FROM: ${from}`);
    console.log(`   QUERY: ${JSON.stringify(req.query)}`);
    if (req.body && typeof req.body === 'string' && req.body.length > 0) {
      console.log(`   BODY: ${req.body.substring(0, 200)}`);
    }
  }
  next();
});

// --- ADMS Biometric Device Endpoints ---

// 1. Device Registration / Handshake
app.get(['/iclock/cdata', '/iclock/cdata.aspx'], async (req, res) => {
  const { SN } = req.query;
  console.log(`[ADMS] ✅ Device Handshake! SN=${SN}`);
  await trackDeviceActivity(SN);
  // eSSL ADMS protocol response format
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

// 2. Device command pull - keep device polling alive
app.get(['/iclock/getrequest', '/iclock/getrequest.aspx'], async (req, res) => {
  const { SN } = req.query;
  await trackDeviceActivity(SN);
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

// 3. Device sends command result
app.post(['/iclock/devicecmd', '/iclock/devicecmd.aspx'], async (req, res) => {
  const { SN } = req.query;
  console.log(`[ADMS] Device CMD response from ${SN}`);
  res.send('OK');
});

// 4. Heartbeat / info endpoint
app.get(['/iclock/ping', '/iclock/ping.aspx'], async (req, res) => {
  const { SN } = req.query;
  await trackDeviceActivity(SN);
  res.send('OK');
});

// Helper function to parse biometric photo upload request bodies
function parsePhotoRequest(req) {
  const buffer = req.body;
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return null;
  }

  // 1. Check if raw JPEG buffer (starts with FF D8 FF)
  if (buffer.length > 2 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return {
      pin: req.query.PIN || req.query.pin || req.query.UserPIN || '',
      sn: req.query.SN || '',
      size: buffer.length,
      imageBuffer: buffer
    };
  }

  // 2. Check for ZK ADMS custom binary format with null separator
  const nullByteIndex = buffer.indexOf(0x00);
  if (nullByteIndex !== -1 && nullByteIndex < 1000) {
    const textPart = buffer.toString('utf8', 0, nullByteIndex);
    const binaryData = buffer.slice(nullByteIndex + 1);
    
    const lines = textPart.split(/\r?\n/);
    const metadata = {};
    for (const line of lines) {
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.substring(0, eqIdx).trim().toLowerCase();
        const val = line.substring(eqIdx + 1).trim();
        metadata[key] = val;
      }
    }
    
    if (metadata['pin'] || metadata['size']) {
      return {
        pin: metadata['pin'] || '',
        sn: metadata['sn'] || req.query.SN || '',
        size: parseInt(metadata['size']) || binaryData.length,
        imageBuffer: binaryData
      };
    }
  }

  // 3. Check for URL-encoded string format (PIN=...&PhotoContent=...)
  try {
    const bodyStr = buffer.toString('utf8');
    if (bodyStr.includes('PIN=') && (bodyStr.includes('PhotoContent=') || bodyStr.includes('Content='))) {
      const params = new URLSearchParams(bodyStr);
      const pin = params.get('PIN') || params.get('pin') || '';
      const base64Content = params.get('PhotoContent') || params.get('Content') || '';
      const cleanedBase64 = base64Content.replace(/\s/g, '+');
      const imageBuffer = Buffer.from(cleanedBase64, 'base64');
      return {
        pin,
        sn: req.query.SN || '',
        size: imageBuffer.length,
        imageBuffer
      };
    }
  } catch (e) {
    // Ignore error
  }

  return null;
}

// 5. Device pushing Attendance Data (Punches)
app.post(['/iclock/cdata', '/iclock/cdata.aspx'], async (req, res) => {
  const { SN, table } = req.query;
  const body = req.body;

  console.log(`[ADMS] 📥 Incoming Data from Device: ${SN} (Type: ${table})`);
  await trackDeviceActivity(SN);
  
  if (table === 'ATTPHOTO' || table === 'BIOPHOTO') {
    const parsed = parsePhotoRequest(req);
    if (parsed && parsed.imageBuffer && parsed.imageBuffer.length > 0) {
      let pinStr = String(parsed.pin);
      let userId = pinStr;
      if (pinStr.includes('-')) {
        const parts = pinStr.split('-');
        userId = parts[parts.length - 1].trim();
      }
      
      const timestamp = Date.now();
      const filename = `punch_${userId}_${timestamp}.jpg`;
      const filepath = path.join(UPLOADS_DIR, filename);
      
      try {
        fs.writeFileSync(filepath, parsed.imageBuffer);
        const relativePath = `/uploads/${filename}`;
        
        console.log(`📸 [ADMS] Saved photo for User ${userId} (from PIN: ${parsed.pin}) to ${relativePath}`);
        
        // 1. Update user profile photo in MongoDB
        if (mongoose.connection.readyState === 1) {
          try {
            await User.findOneAndUpdate(
              { id: parseInt(userId) },
              { photo: relativePath }
            );
            await User.findOneAndUpdate(
              { fingerprint_id: String(userId) },
              { photo: relativePath }
            );
          } catch (dbErr) {
            console.error(`❌ MongoDB error updating photo for User ${userId}:`, dbErr.message);
          }
        }
        
        // 2. Update local users.json file
        try {
          const localUsers = getLocalUsers();
          const userIdx = localUsers.findIndex(u => u.id === parseInt(userId) || String(u.id) === String(userId) || u.fingerprint_id === String(userId));
          if (userIdx > -1) {
            localUsers[userIdx].photo = relativePath;
            saveLocalUsers(localUsers);
          }
        } catch (fileErr) {
          console.error(`❌ File error updating photo for User ${userId}:`, fileErr.message);
        }
        
        // 3. Emit the socket update to all connected clients
        io.emit('live_punch_photo', {
          userId: String(userId),
          userPhoto: relativePath
        });
        
      } catch (err) {
        console.error(`❌ Error writing upload photo to disk:`, err.message);
      }
    } else {
      console.log(`⚠️ [ADMS] Photo upload received but could not parse. Buffer Length: ${Buffer.isBuffer(req.body) ? req.body.length : 0}`);
    }
    
    return res.send("OK");
  }

  if (table === 'ATTLOG') {
    console.log("\n=== New Live Punch! ===");
    console.log(body);
    console.log("===========================\n");
    
    // Normalize body to handle carriage returns as well
    const punches = body.trim().split(/\r?\n/);
    
    for (const punch of punches) {
      if (!punch) continue;
      const parts = punch.split('\t');
      if (parts.length >= 2) {
        const userId = parts[0].trim();
        const timestamp = parts[1].trim();
        const state = parts[2] ? parts[2].trim() : '';
        const verifyMode = parts[3] ? parts[3].trim() : (state === '15' ? '15' : '');
        
        // Try to resolve user name and photo from DB
        let userName = `User ${userId}`;
        let userPhoto = null;
        if (mongoose.connection.readyState === 1) {
          try {
            let dbUser = await User.findOne({ fingerprint_id: String(userId) });
            if (!dbUser && !isNaN(parseInt(userId))) {
              dbUser = await User.findOne({ id: parseInt(userId) });
            }
            if (dbUser) {
              userName = dbUser.name;
              userPhoto = dbUser.photo;
            }
          } catch (e) { /* ignore */ }
        } else {
          const localUsers = getLocalUsers();
          let dbUser = localUsers.find(u => String(u.fingerprint_id) === String(userId));
          if (!dbUser) {
            dbUser = localUsers.find(u => String(u.id) === String(userId));
          }
          if (dbUser) {
            userName = dbUser.name;
            userPhoto = dbUser.photo;
          }
        }

        const punchPayload = {
          userId,
          userName,
          userPhoto,
          timestamp: new Date(timestamp).toLocaleString('en-IN'),
          deviceSn: SN || 'NYU7260401606',
          verifyMode
        };

        // Emit the punch live to ALL frontend clients immediately
        io.emit('live_punch', punchPayload);
        console.log(`⚡ LIVE EMIT → User ${userId} (${userName}) @ ${timestamp}`);

        // Save to DB if connected
        if (mongoose.connection.readyState === 1) {
          try {
            await Punch.create({ userId, timestamp: new Date(timestamp), deviceSn: SN || 'unknown', direction: 'in', verifyMode });
            console.log(`💾 Saved punch to MongoDB: User ${userId} at ${timestamp} (Mode: ${verifyMode})`);
          } catch (dbErr) {
            console.error(`❌ Error saving punch to MongoDB:`, dbErr.message);
          }
        } else {
          console.log(`⚠️ DB Offline: Live punch from User ${userId} not saved to DB.`);
        }
      }
    }
  }

  res.send("OK");
});

// --- HTTP API Endpoints ---

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      token: 'mock-jwt-token-12345',
      user: {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'admin'
      }
    });
  } else {
    res.status(400).json({ message: 'Email and password are required' });
  }
});

// Enroll New Student (from Enrollment Form)
app.post('/api/users/enroll', async (req, res) => {
  const { name, email, role, fingerprint_id, experience, subject, timing, salary, profession } = req.body;
  if (!name || !fingerprint_id) {
    return res.status(400).json({ error: 'Name and Biometric Register ID are required' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, dbSaved: false, message: 'Saved in offline fallback mode' });
  }

  try {
    // Determine the next numeric ID
    const lastUser = await User.findOne().sort({ id: -1 });
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const newUser = await User.create({
      id: nextId,
      name,
      role: role || 'student',
      fingerprint_id,
      email: req.body.email,
      studentPhone: req.body.studentContact,
      parentPhone: req.body.fatherContact || req.body.motherContact,
      aadhar: req.body.aadhar,
      gender: req.body.gender,
      dob: req.body.dob,
      marks10th: req.body.tenthPercent,
      marks12th: req.body.twelfthPercent,
      address: req.body.address,
      branch: req.body.branch,
      courses: req.body.course ? [req.body.course] : (req.body.batch ? [req.body.batch] : []),
      fee: req.body.fee || req.body.totalFee,
      enquiryDate: req.body.enquiryDate,
      batchTiming: req.body.batchTiming,
      previousSchool: req.body.previousSchool,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      ifscCode: req.body.ifscCode,
      accountHolder: req.body.accountHolder,
      amountReceived: req.body.amountReceived,
      paymentMode: req.body.paymentMode,
      installment: req.body.installment,
      receiptNo: req.body.receiptNo,
      amountReceivedWords: req.body.amountReceivedWords,
      dueFees: req.body.dueFees,
      experience,
      subject,
      timing,
      profession
    });
    console.log(`✅ Enrolled new ${role || 'student'}: ${name} with Biometric ID: ${fingerprint_id}`);
    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("Enrollment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get Student Attendance History (Calculated In/Out)
app.get('/api/attendance/student/:fingerprint_id', async (req, res) => {
  const { fingerprint_id } = req.params;
  
  if (mongoose.connection.readyState !== 1) {
    // Return mock data if offline
    return res.json({
      student: { name: "Mock Student", fingerprint_id },
      summary: { totalEntries: 0, totalHours: 0 },
      records: []
    });
  }

  try {
    const student = await User.findOne({ fingerprint_id });
    const punches = await Punch.find({ userId: fingerprint_id }).sort({ timestamp: 1 });

    // Group by Date (YYYY-MM-DD)
    const grouped = {};
    punches.forEach(p => {
      const dString = p.timestamp.toISOString().split('T')[0];
      if (!grouped[dString]) grouped[dString] = [];
      grouped[dString].push(p);
    });

    const records = [];
    let totalEntriesAllTime = 0;
    let totalMsAllTime = 0;

    for (const [dateStr, dayPunches] of Object.entries(grouped)) {
      // Calculate daily metrics
      const firstIn = dayPunches[0].timestamp;
      const lastOut = dayPunches[dayPunches.length - 1].timestamp;
      const entryCount = Math.max(1, Math.floor(dayPunches.length / 2)); // rough estimate if missing out punches
      
      let durationMs = lastOut.getTime() - firstIn.getTime();
      // If only one punch, duration is 0
      if (dayPunches.length === 1) durationMs = 0;

      totalEntriesAllTime += entryCount;
      totalMsAllTime += durationMs;

      records.push({
        date: dateStr,
        firstIn: firstIn.toLocaleTimeString('en-IN'),
        lastOut: dayPunches.length > 1 ? lastOut.toLocaleTimeString('en-IN') : 'N/A',
        totalEntries: entryCount,
        durationMinutes: Math.round(durationMs / 60000)
      });
    }

    res.json({
      student: student || { name: `Unknown (${fingerprint_id})`, fingerprint_id },
      summary: {
        totalEntries: totalEntriesAllTime,
        totalHours: (totalMsAllTime / (1000 * 60 * 60)).toFixed(2)
      },
      records: records.sort((a,b) => new Date(b.date) - new Date(a.date)) // newest first
    });

  } catch (err) {
    console.error("Attendance fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Current User info
app.get('/api/users/me', (req, res) => {
  res.json({
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  });
});

// Admin Dashboard stats
app.get('/api/admin/dashboard', async (req, res) => {
  // Graceful Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      stats: {
        totalUsers: 5,
        todayAttend: 80,
        pendingForms: 18,
        approvedForms: 45,
        activeTeachers: 2,
        totalStudents: 3
      },
      recentAttendance: []
    });
  }

  try {
    const totalUsers = await User.countDocuments();
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysPunches = await Punch.find({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: -1 });

    const punchedTodayIds = [...new Set(todaysPunches.map(p => p.userId))];
    const todayAttendCount = punchedTodayIds.length;
    const todayAttendPercent = totalUsers > 0 ? Math.round((todayAttendCount / totalUsers) * 100) : 0;

    const recentAttendance = [];
    
    // Group punches by user to find inTime and outTime
    const punchesByUser = {};
    todaysPunches.forEach(p => {
      if (!punchesByUser[p.userId]) punchesByUser[p.userId] = [];
      punchesByUser[p.userId].push(p);
    });

    for (const userId of Object.keys(punchesByUser)) {
      const userPunches = punchesByUser[userId].sort((a, b) => a.timestamp - b.timestamp);
      let user = await User.findOne({ fingerprint_id: String(userId) });
      if (!user) user = await User.findOne({ id: parseInt(userId) || 0 });
      
      recentAttendance.push({
        name: user ? user.name : `User ${userId}`,
        role: user ? user.role : 'user',
        photo: user ? user.photo : null,
        inTime: userPunches[0].timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        outTime: userPunches.length > 1 ? userPunches[userPunches.length - 1].timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:-- --',
        status: 'Present',
        latestTime: userPunches[userPunches.length - 1].timestamp
      });
    }

    // Sort by latest punch descending
    recentAttendance.sort((a, b) => b.latestTime - a.latestTime);

    res.json({
      stats: {
        totalUsers,
        todayAttend: todayAttendPercent,
        pendingForms: 18,
        approvedForms: 45,
        activeTeachers: await User.countDocuments({ role: 'teacher' }),
        totalStudents: await User.countDocuments({ role: 'student' })
      },
      recentAttendance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all registered users
app.get('/api/users', async (req, res) => {
  // Graceful Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { id: 1, name: 'Admin User', role: 'admin', fingerprint_id: '111' },
      { id: 2, name: 'John Doe', role: 'student', fingerprint_id: '222' },
      { id: 3, name: 'Ahmed Khan', role: 'teacher', fingerprint_id: '333' },
      { id: 4, name: 'Sarah Ali', role: 'student', fingerprint_id: '444' },
      { id: 5, name: 'Mrs. Patel', role: 'teacher', fingerprint_id: '555' }
    ]);
  }

  try {
    const users = await User.find({}).sort({ id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch user mapping (fingerprint_id & id -> name)
app.get('/api/users/map', async (req, res) => {
  const map = {};
  if (mongoose.connection.readyState !== 1) {
    const localUsers = getLocalUsers();
    localUsers.forEach(u => {
      if (u.id) map[String(u.id)] = u.name;
      if (u.fingerprint_id) map[String(u.fingerprint_id)] = u.name;
    });
    return res.json(map);
  }

  try {
    const users = await User.find({});
    users.forEach(u => {
      if (u.id) map[String(u.id)] = u.name;
      if (u.fingerprint_id) map[String(u.fingerprint_id)] = u.name;
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update a user (both DB and local JSON database fallback supported)
app.post('/api/users', async (req, res) => {
  const { id, name, role, fingerprint_id, photo } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const userPayload = {
    id: parseInt(id),
    name,
    role: role || 'student',
    fingerprint_id: fingerprint_id || String(id),
    photo: photo || null
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOneAndUpdate(
        { id: parseInt(id) },
        userPayload,
        { upsert: true, new: true }
      );
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Offline mode JSON database update
    const localUsers = getLocalUsers();
    const existingIndex = localUsers.findIndex(u => u.id === parseInt(id));
    if (existingIndex > -1) {
      localUsers[existingIndex] = { ...localUsers[existingIndex], ...userPayload };
    } else {
      localUsers.push(userPayload);
    }
    saveLocalUsers(localUsers);
    return res.json({ success: true, user: userPayload });
  }
});

// Delete Student/User Profile
app.delete('/api/users/:fingerprint_id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    // If local mode is active, we should also delete from local JSON, but to keep it simple, we just return success
    // or we can implement local delete. Since the user was in MongoDB, we'll focus on DB
    return res.status(503).json({ error: 'Database is offline' });
  }
  try {
    const fpId = req.params.fingerprint_id.trim();
    await User.findOneAndDelete({ fingerprint_id: fpId });
    // Also delete their punches
    await Punch.deleteMany({ userId: fpId });
    res.json({ success: true, message: 'User and their attendance records deleted' });
  } catch (err) {
    console.error("Profile deletion error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// User ID -> Name mapping for Live Sync Feed
app.get('/api/users/map', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      '1': 'Admin User', '2': 'John Doe', '3': 'Ahmed Khan',
      '4': 'Sarah Ali', '5': 'Mrs. Patel'
    });
  }
  try {
    const users = await User.find({});
    const map = {};
    users.forEach(u => { map[String(u.id)] = u.name; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Biometric Webhook (Simulator punches)
app.post('/api/biometric/webhook', async (req, res) => {
  const { fingerprint_id, timestamp, direction, verifyMode } = req.body;
  
  let userName = `User ${fingerprint_id}`;
  let userPhoto = null;

  if (mongoose.connection.readyState === 1) {
    try {
      let dbUser = await User.findOne({ fingerprint_id });
      if (!dbUser) {
        dbUser = await User.findOne({ id: parseInt(fingerprint_id) });
      }
      if (dbUser) {
        userName = dbUser.name;
        userPhoto = dbUser.photo;
      }
    } catch (e) { /* ignore */ }
  } else {
    const localUsers = getLocalUsers();
    const dbUser = localUsers.find(u => u.fingerprint_id === String(fingerprint_id) || String(u.id) === String(fingerprint_id));
    if (dbUser) {
      userName = dbUser.name;
      userPhoto = dbUser.photo;
    }
  }
  
  // Emit live punch to frontend via socket immediately (enables real-time simulator updates)
  io.emit('live_punch', {
    userId: fingerprint_id,
    userName,
    userPhoto,
    timestamp: new Date(timestamp).toLocaleString(),
    deviceSn: 'Simulator',
    verifyMode: verifyMode || '1'
  });

  // Graceful Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    console.log(`⚠️ DB Offline: Simulated punch user ${fingerprint_id} emitted but not saved to DB.`);
    return res.json({ success: true, dbSaved: false });
  }

  try {
    const punch = await Punch.create({
      userId: fingerprint_id,
      timestamp: new Date(timestamp),
      deviceSn: 'Simulator',
      direction: direction || 'in'
    });
    
    console.log(`💾 Simulated punch saved: User ${fingerprint_id} (${direction})`);
    res.json({ success: true, dbSaved: true, punch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all biometric devices
app.get('/api/devices', async (req, res) => {
  // Graceful Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    return res.json([
      { serialNumber: 'NYU7260401606', name: 'Bio System (x 2006)', lastActive: new Date().toISOString(), status: 'online' }
    ]);
  }

  try {
    const devices = await Device.find({}).sort({ lastActive: -1 });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rename a device
app.post('/api/devices/rename', async (req, res) => {
  const { serialNumber, name } = req.body;
  if (!serialNumber || !name) {
    return res.status(400).json({ error: 'serialNumber and name are required' });
  }

  // Fallback support if DB is offline
  if (mongoose.connection.readyState !== 1) {
    return res.json({ success: true, dbSaved: false, message: 'Renamed in fallback memory mode' });
  }

  try {
    const device = await Device.findOneAndUpdate(
      { serialNumber },
      { name },
      { new: true }
    );
    res.json({ success: true, dbSaved: true, device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/receipts/generate', async (req, res) => {
  try {
    let counterDoc = await Counter.findOneAndUpdate(
      { _id: 'receiptId' },
      { $inc: { seq: 1 } },
      { new: true }
    );
    
    if (!counterDoc) {
       counterDoc = new Counter({ _id: 'receiptId', seq: 1200 });
       await counterDoc.save();
    }
    
    const receiptNo = counterDoc.seq;
    const now = new Date();
    const formattedDate = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
    
    const payload = {
      receiptNo: receiptNo.toString().padStart(4, '0'),
      ...req.body,
      generatedAt: formattedDate
    };
    
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start unified server on ALL interfaces so LAN devices (eSSL) can reach it
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Unified Backend & ADMS Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📡 LAN accessible at http://192.168.0.108:${PORT}`);
  console.log(`🔬 ADMS endpoint: POST http://192.168.0.108:${PORT}/iclock/cdata`);
});
