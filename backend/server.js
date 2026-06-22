const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS so the frontend can hit this API
app.use(cors());
// Parse JSON body
app.use(express.json());

// Mock Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic mock authentication check
  if (email && password) {
    res.json({
      token: 'mock-jwt-token-12345',
      user: {
        id: 1,
        name: 'Admin User',
        email: email,
        role: 'admin' // can be customized based on what the frontend expects
      }
    });
  } else {
    res.status(400).json({ message: 'Email and password are required' });
  }
});

// Mock user endpoint if frontend needs it
app.get('/api/users/me', (req, res) => {
  res.json({
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  });
});

// Mock Admin Dashboard
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    stats: {
      totalUsers: 150,
      todayAttend: 92,
      pendingForms: 18,
      approvedForms: 45,
      activeTeachers: 4,
      totalStudents: 140
    },
    recentAttendance: []
  });
});

// Mock Users
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Admin User', role: 'admin', fingerprint_id: '111' },
    { id: 2, name: 'John Doe', role: 'student', fingerprint_id: '222' }
  ]);
});

// Mock Biometric Webhook
app.post('/api/biometric/webhook', (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
