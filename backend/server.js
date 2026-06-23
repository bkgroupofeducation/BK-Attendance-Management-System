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
const fs = require('fs');
const path = require('path');
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
      const localUsers = getLocalUsers();
      if (localUsers.length > 0) {
        await User.insertMany(localUsers);
        console.log(`🌱 Seeded ${localUsers.length} users from users.json to MongoDB`);
      } else {
        console.log('🌱 No local users to seed to MongoDB');
      }
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
  
  if (pendingCommands[SN] && pendingCommands[SN].length > 0) {
    const cmd = pendingCommands[SN].shift();
    console.log(`📡 [ADMS] Sending queued command to device ${SN}: ${cmd}`);
    return res.send(cmd);
  }
  
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
        if (mongoose.connection.readyState === 1) {
          try {
            const dbUser = await User.findOne({ id: parseInt(userId) });
            if (dbUser) {
              userName = dbUser.name;
            } else {
              const dbUserByFp = await User.findOne({ fingerprint_id: String(userId) });
              if (dbUserByFp) userName = dbUserByFp.name;
            }
          } catch (e) { /* ignore */ }
        } else {
          const localUsers = getLocalUsers();
          const dbUser = localUsers.find(u => u.id === parseInt(userId) || String(u.id) === String(userId) || u.fingerprint_id === String(userId));
          if (dbUser) {
            userName = dbUser.name;
          }
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
          const localPunches = getLocalPunches();
          localPunches.push({
            userId,
            timestamp: new Date(timestamp).toISOString(),
            deviceSn: SN || 'unknown',
            direction: 'in',
            createdAt: new Date().toISOString()
          });
          saveLocalPunches(localPunches);
          console.log(`💾 Saved punch to local JSON: User ${userId} at ${timestamp}`);
        }
      }
    }
  } else if (table === 'USERINFO' || table === 'OPERLOG') {
    console.log(`\n=== Syncing User Info from Device (Table: ${table}) ===`);
    console.log(body.substring(0, 500)); // Log first 500 chars to console safely
    console.log("====================================================\n");

    const lines = body.trim().split(/\r?\n/);
    for (const line of lines) {
      if (!line) continue;
      
      let dataLine = line;
      if (line.startsWith('USER ')) {
        dataLine = line.substring(5).trim();
      } else if (table === 'OPERLOG') {
        // Skip operational logs like OPLOG or FP or BIOPHOTO
        continue;
      }

      const parts = dataLine.split('\t');
      const userObj = {};
      for (const part of parts) {
        const eqIdx = part.indexOf('=');
        if (eqIdx !== -1) {
          const key = part.substring(0, eqIdx).trim();
          const value = part.substring(eqIdx + 1).trim();
          userObj[key] = value;
        }
      }

      const userId = userObj.PIN;
      const userName = userObj.Name;
      const privilege = userObj.Pri; // 0=user, 14=admin

      if (userId && userName) {
        const role = privilege === '14' ? 'admin' : 'student';
        const userPayload = {
          id: parseInt(userId),
          name: userName,
          role: role,
          fingerprint_id: String(userId)
        };

        if (mongoose.connection.readyState === 1) {
          try {
            await User.findOneAndUpdate(
              { id: parseInt(userId) },
              userPayload,
              { upsert: true }
            );
            console.log(`💾 Synced User ${userId} (${userName}) to MongoDB`);
          } catch (dbErr) {
            console.error('❌ Error saving user from device sync:', dbErr.message);
          }
        } else {
          const localUsers = getLocalUsers();
          const existingIndex = localUsers.findIndex(u => u.id === parseInt(userId));
          if (existingIndex > -1) {
            localUsers[existingIndex] = { ...localUsers[existingIndex], ...userPayload };
          } else {
            localUsers.push(userPayload);
          }
          saveLocalUsers(localUsers);
          console.log(`💾 Synced User ${userId} (${userName}) to local JSON`);
        }
      }
    }
  }

  res.send("OK");
});

// --- HTTP API Endpoints ---

// Get server LAN details for biometric devices
app.get('/api/info', (req, res) => {
  res.json({
    ip: getLocalIp(),
    port: PORT
  });
});

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
    const localUsers = getLocalUsers();
    const totalUsers = localUsers.length;
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const localPunches = getLocalPunches();
    const punchedTodayIds = new Set();
    localPunches.forEach(p => {
      const pDate = new Date(p.timestamp);
      if (pDate >= startOfToday && pDate <= endOfToday) {
        punchedTodayIds.add(String(p.userId));
      }
    });

    const todayAttendCount = punchedTodayIds.size;
    const todayAttendPercent = totalUsers > 0 ? Math.round((todayAttendCount / totalUsers) * 100) : 0;

    return res.json({
      stats: {
        totalUsers,
        todayAttend: todayAttendPercent,
        pendingForms: 18,
        approvedForms: 45,
        activeTeachers: localUsers.filter(u => u.role === 'teacher').length,
        totalStudents: localUsers.filter(u => u.role === 'student').length
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
    return res.json(getLocalUsers());
  }

  try {
    const users = await User.find({}).sort({ id: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add or update a user (both DB and local JSON database fallback supported)
app.post('/api/users', async (req, res) => {
  const { id, name, role, fingerprint_id } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const userPayload = {
    id: parseInt(id),
    name,
    role: role || 'student',
    fingerprint_id: fingerprint_id || String(id)
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

// User ID -> Name mapping for Live Sync Feed
app.get('/api/users/map', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const localUsers = getLocalUsers();
    const map = {};
    localUsers.forEach(u => {
      map[String(u.id)] = u.name;
      map[String(u.fingerprint_id)] = u.name;
    });
    return res.json(map);
  }
  try {
    const users = await User.find({});
    const map = {};
    users.forEach(u => {
      map[String(u.id)] = u.name;
      map[String(u.fingerprint_id)] = u.name;
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all punches recorded (supports both MongoDB and local JSON fallback)
app.get('/api/punches', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const localPunches = getLocalPunches();
    const sorted = [...localPunches].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json(sorted);
  }

  try {
    const punches = await Punch.find({}).sort({ timestamp: -1 });
    res.json(punches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all punches recorded today (supports both MongoDB and local JSON fallback)
app.get('/api/punches/today', async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (mongoose.connection.readyState !== 1) {
    const localPunches = getLocalPunches();
    // Filter punches recorded today
    const todayPunches = localPunches.filter(p => {
      const pDate = new Date(p.timestamp);
      return pDate >= startOfToday && pDate <= endOfToday;
    });
    // Sort by timestamp descending
    todayPunches.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return res.json(todayPunches);
  }

  try {
    const punches = await Punch.find({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: -1 });
    res.json(punches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Biometric Webhook (Simulator punches)
app.post('/api/biometric/webhook', async (req, res) => {
  const { fingerprint_id, timestamp, direction } = req.body;
  
  let userName = `User ${fingerprint_id}`;

  if (mongoose.connection.readyState === 1) {
    try {
      const dbUser = await User.findOne({ fingerprint_id });
      if (dbUser) {
        userName = dbUser.name;
      } else {
        const dbUserById = await User.findOne({ id: parseInt(fingerprint_id) });
        if (dbUserById) userName = dbUserById.name;
      }
    } catch (e) { /* ignore */ }
  } else {
    const localUsers = getLocalUsers();
    const dbUser = localUsers.find(u => u.fingerprint_id === String(fingerprint_id) || String(u.id) === String(fingerprint_id));
    if (dbUser) {
      userName = dbUser.name;
    }
  }
  
  // Emit live punch to frontend via socket immediately (enables real-time simulator updates)
  io.emit('live_punch', {
    userId: fingerprint_id,
    userName,
    timestamp: new Date(timestamp).toLocaleString(),
    deviceSn: 'Simulator'
  });

  // Graceful Fallback if MongoDB is offline
  if (mongoose.connection.readyState !== 1) {
    const localPunches = getLocalPunches();
    localPunches.push({
      userId: fingerprint_id,
      timestamp: new Date(timestamp).toISOString(),
      deviceSn: 'Simulator',
      direction: direction || 'in',
      createdAt: new Date().toISOString()
    });
    saveLocalPunches(localPunches);
    console.log(`💾 Simulated punch saved to local JSON: User ${fingerprint_id} (${direction})`);
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

// Sync Users command queue API
app.post('/api/devices/sync-users', (req, res) => {
  const { serialNumber } = req.body;
  if (!serialNumber) {
    return res.status(400).json({ error: 'serialNumber is required' });
  }

  const cmdId = Date.now();
  const cmdText = `C:${cmdId}:DATA QUERY USERINFO`;
  queueCommand(serialNumber, cmdText);

  console.log(`🎟️ Queued command for device ${serialNumber}: ${cmdText}`);
  res.json({ success: true, message: 'Sync command queued. Waiting for device to pull...' });
});

const os = require('os');

function getLocalIp() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Start unified server on ALL interfaces so LAN devices (eSSL) can reach it
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`🚀 Unified Backend & ADMS Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📡 LAN accessible at http://${localIp}:${PORT}`);
  console.log(`🔬 ADMS endpoint: POST http://${localIp}:${PORT}/iclock/cdata`);
});
