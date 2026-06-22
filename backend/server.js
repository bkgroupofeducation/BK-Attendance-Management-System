require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Enable CORS for Socket.io and Express
app.use(cors());

// Parse biometric device raw plain text requests only on /iclock routes
app.use('/iclock', express.text({ type: '*/*' }));

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

// --- Database Schemas & Models ---
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  fingerprint_id: { type: String, required: true, unique: true }
});
const User = mongoose.model('User', userSchema);

const punchSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  deviceSn: { type: String, required: true },
  direction: { type: String, enum: ['in', 'out'], default: 'in' },
  createdAt: { type: Date, default: Date.now }
});
const Punch = mongoose.model('Punch', punchSchema);

const deviceSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
  status: { type: String, default: 'online' }
});
const Device = mongoose.model('Device', deviceSchema);

// Seed default users if DB is empty
async function seedUsers() {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany([
        { id: 1, name: 'Admin User', role: 'admin', fingerprint_id: '111' },
        { id: 2, name: 'John Doe', role: 'student', fingerprint_id: '222' },
        { id: 3, name: 'Ahmed Khan', role: 'teacher', fingerprint_id: '333' },
        { id: 4, name: 'Sarah Ali', role: 'student', fingerprint_id: '444' },
        { id: 5, name: 'Mrs. Patel', role: 'teacher', fingerprint_id: '555' }
      ]);
      console.log('🌱 Seeded default users to MongoDB');
    }
  } catch (err) {
    console.error('❌ Error seeding users:', err.message);
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

// 5. Device pushing Attendance Data (Punches)
app.post(['/iclock/cdata', '/iclock/cdata.aspx'], async (req, res) => {
  const { SN, table } = req.query;
  const body = req.body;

  console.log(`[ADMS] 📥 Incoming Data from Device: ${SN} (Type: ${table})`);
  await trackDeviceActivity(SN);
  
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
        const verifyMode = parts[2] ? parts[2].trim() : '';
        
        // Try to resolve user name from DB
        let userName = `User ${userId}`;
        const fallbackNames = {
          '1': 'Admin User',
          '01': 'Admin User',
          '2': 'John Doe',
          '02': 'John Doe',
          '3': 'Ahmed Khan',
          '03': 'Ahmed Khan',
          '4': 'Sarah Ali',
          '04': 'Sarah Ali',
          '5': 'Mrs. Patel',
          '05': 'Mrs. Patel'
        };
        if (mongoose.connection.readyState === 1) {
          try {
            const dbUser = await User.findOne({ id: parseInt(userId) });
            if (dbUser) userName = dbUser.name;
          } catch (e) { /* ignore */ }
        } else {
          userName = fallbackNames[userId] || fallbackNames[String(parseInt(userId))] || `User ${userId}`;
        }

        const punchPayload = {
          userId,
          userName,
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
            await Punch.create({ userId, timestamp: new Date(timestamp), deviceSn: SN || 'unknown', direction: 'in' });
            console.log(`💾 Saved punch to MongoDB: User ${userId} at ${timestamp}`);
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

    const punchedToday = await Punch.distinct('userId', {
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayAttendCount = punchedToday.length;
    const todayAttendPercent = totalUsers > 0 ? Math.round((todayAttendCount / totalUsers) * 100) : 0;

    res.json({
      stats: {
        totalUsers,
        todayAttend: todayAttendPercent,
        pendingForms: 18,
        approvedForms: 45,
        activeTeachers: await User.countDocuments({ role: 'teacher' }),
        totalStudents: await User.countDocuments({ role: 'student' })
      },
      recentAttendance: []
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
  const { fingerprint_id, timestamp, direction } = req.body;
  
  // Emit live punch to frontend via socket immediately (enables real-time simulator updates)
  io.emit('live_punch', {
    userId: fingerprint_id,
    timestamp: new Date(timestamp).toLocaleString(),
    deviceSn: 'Simulator'
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

// Start unified server on ALL interfaces so LAN devices (eSSL) can reach it
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Unified Backend & ADMS Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📡 LAN accessible at http://192.168.0.106:${PORT}`);
  console.log(`🔬 ADMS endpoint: POST http://192.168.0.106:${PORT}/iclock/cdata`);
});
