import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from './api';

const socket = io('http://localhost:8080');
const AuthContext = React.createContext(null);

// --- LOGIN PAGE ---
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', width: '350px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '10px' }}>🔐 BioAttend</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Admin Login</p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }} required />
          {error && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '10px' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#667eea', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>Demo: admin@school.com / admin123</div>
      </div>
    </div>
  );
};

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// --- SIDEBAR & LAYOUT ---
const Sidebar = ({ logout, user }) => {
  const [enqOpen, setEnqOpen] = useState(false);
  const [admOpen, setAdmOpen] = useState(false);
  const [acadOpen, setAcadOpen] = useState(false);
  const [finOpen, setFinOpen] = useState(false);
  const [insOpen, setInsOpen] = useState(false);
  return (
    <div style={{ width: '250px', background: '#2c3e50', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ color: 'white', padding: '20px', margin: 0 }}>📊 BioAttend</h2>
      <div style={{ padding: '0 20px 20px', color: '#bdc3c7', fontSize: '14px' }}>Welcome, <strong style={{ color: '#ffffff' }}>{user?.name}</strong></div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li><Link to="/" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>📈 Dashboard</Link></li>
        
        {/* Enquiries Dropdown */}
        <li>
          <div onClick={() => setEnqOpen(!enqOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: enqOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>👥 Enquiries</span>
            <span>{enqOpen ? '▲' : '▼'}</span>
          </div>
          {enqOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
              <li><Link to="/enquiries/new" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ New Enquiry</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Bulk Upload</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Enquiry List</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Enquiry Summary</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Enquiry Activities</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Next Follow Ups</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Missed Follow Ups</Link></li>
            </ul>
          )}
        </li>

        {/* Admissions Dropdown */}
        <li>
          <div onClick={() => setAdmOpen(!admOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: admOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>📝 Admissions</span>
            <span>{admOpen ? '▲' : '▼'}</span>
          </div>
          {admOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Enroll Student</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Bulk Upload</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Student List</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Cancelled List</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Absentees</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Defaulters</Link></li>
              <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Birthdays</Link></li>
            </ul>
          )}
        </li>

        {/* Academics Dropdown */}
        <li>
          <div onClick={() => setAcadOpen(!acadOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: acadOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>🎓 Academics</span>
            <span>{acadOpen ? '▲' : '▼'}</span>
          </div>
          {acadOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Planner</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Timeline</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Punches</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Lectures</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Exams</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Paper Tracker</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Exam Report</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Syllabus Deadlines</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Syllabus Tracker</Link></li>
              <li><Link to="/academics" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Assignments</Link></li>
            </ul>
          )}
        </li>

        {/* Finances Dropdown */}
        <li>
          <div onClick={() => setFinOpen(!finOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: finOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>💰 Finances</span>
            <span>{finOpen ? '▲' : '▼'}</span>
          </div>
          {finOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Cleared Fees</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Overdues</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Outstanding</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Unverified</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Unscheduled</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ PDCs</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Transactions</Link></li>
              <li><Link to="/finances" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Daily Expenses</Link></li>
            </ul>
          )}
        </li>

        {/* Insights Dropdown */}
        <li>
          <div onClick={() => setInsOpen(!insOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: insOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>📊 Insights</span>
            <span>{insOpen ? '▲' : '▼'}</span>
          </div>
          {insOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Syllabus Report</Link></li>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Course Report</Link></li>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Batch Report</Link></li>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Student Report</Link></li>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Revenue Report</Link></li>
              <li><Link to="/insights" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Cashflow Report</Link></li>
            </ul>
          )}
        </li>

        <li><Link to="/attendance" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>📋 Attendance</Link></li>
        <li><Link to="/teachers" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>👨🏫 Teachers</Link></li>
        <li><Link to="/devices" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>🔒 Devices</Link></li>
        <li><Link to="/simulator" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>🔬 Simulator</Link></li>
        <li style={{ padding: '15px 20px' }}>
          <button onClick={logout} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', background: '#e74c3c', color: 'white', width: '100%' }}>🚪 Logout</button>
        </li>
      </ul>
    </div>
  );
};

const Layout = ({ children, logout, user }) => (
  <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
    <Sidebar logout={logout} user={user} />
    <div style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
      <div className="header">
        <div>
            <h1>🏫 BioAttend Pro</h1>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Biometric Attendance Management System</span>
        </div>
        <div className="header-actions">
            <div className="badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer' }} onClick={logout}>
                <span style={{ fontSize: '16px', lineHeight: '1' }}>👤</span>
                <span style={{ fontSize: '12px', lineHeight: '1' }}>{user?.name || 'Admin'}</span>
            </div>
            <div className="badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <span style={{ fontSize: '16px', lineHeight: '1' }}>📅</span>
                <span style={{ fontSize: '12px', lineHeight: '1' }}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <span style={{ fontSize: '16px', lineHeight: '1' }}>🔄</span>
                <span style={{ fontSize: '12px', lineHeight: '1' }}>Live • {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
      </div>
      {children}
    </div>
  </div>
);

// --- PAGES ---
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [livePunches, setLivePunches] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [lastScanToast, setLastScanToast] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => {
      setStats(res.data.stats);
      setRecent(res.data.recentAttendance);
    });

    // Load user ID → name map
    api.get('/users/map').then(res => setUserMap(res.data)).catch(() => {});

    const handlePunch = (data) => {
      const entry = { ...data, id: Date.now(), time: new Date().toLocaleTimeString() };
      setLivePunches(prev => [entry, ...prev].slice(0, 10));
      setLastScanToast(entry);
      if (toastRef.current) clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setLastScanToast(null), 5000);
    };

    socket.on('live_punch', handlePunch);
    return () => {
      socket.off('live_punch', handlePunch);
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '??';
  const resolvedName = (punch) => punch.userName || userMap[String(punch.userId)] || `User ${punch.userId}`;

  return (
    <div>
      {/* LIVE TOAST */}
      {lastScanToast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          color: 'white', borderRadius: '16px', padding: '18px 22px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: '300px',
          border: '1px solid rgba(102,126,234,0.5)',
          animation: 'toastIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          display: 'flex', alignItems: 'center', gap: '14px'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
          }}>👆</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', color: '#a0a8d0', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
              🔴 LIVE FINGERPRINT SCAN
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800 }}>{resolvedName(lastScanToast)}</div>
            <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '2px' }}>
              📟 {lastScanToast.deviceSn} &nbsp;•&nbsp; 🕐 {lastScanToast.time}
            </div>
          </div>
          <button onClick={() => setLastScanToast(null)} style={{ background: 'none', border: 'none', color: '#8892b0', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <style>{`
        @keyframes toastIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes punchSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.6)} }
        .live-dot-red { width:10px;height:10px;border-radius:50%;background:#e74c3c;animation:pulseDot 1.2s infinite;display:inline-block;margin-right:8px; }
        .live-dot-green { width:10px;height:10px;border-radius:50%;background:#27ae60;animation:pulseDot 1.5s infinite;display:inline-block;margin-right:6px; }
        .punch-row { animation: punchSlide 0.35s ease-out; }
      `}</style>

      <div className="stats-grid">
        <div className="stat-card">
            <h3>👨‍🎓 Total Users</h3>
            <div className="number">{stats.totalUsers}</div>
            <div className="change">↑ 12 new today</div>
        </div>
        <div className="stat-card">
            <h3>✅ Today's Attendance</h3>
            <div className="number" style={{ color: '#27ae60' }}>{stats.todayAttend}%</div>
            <div className="change">↑ 2% from yesterday</div>
        </div>
        <div className="stat-card pending">
            <h3>📝 Pending Forms</h3>
            <div className="number">{stats.pendingForms}</div>
            <div className="change">⏳ 5 urgent</div>
        </div>
        <div className="stat-card alert">
            <h3>⚡ Active Biometrics</h3>
            <div className="number">1/1</div>
            <div className="change" style={{ color: '#27ae60' }}>✅ All online</div>
        </div>
      </div>

      {/* LIVE SYNC FEED - FULL WIDTH */}
      <div className="dashboard-card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={livePunches.length > 0 ? 'live-dot-red' : 'live-dot-green'}></span>
            Live Sync Feed
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 12px',
              background: livePunches.length > 0 ? '#e74c3c' : '#27ae60',
              color: 'white', borderRadius: '20px', letterSpacing: '0.5px'
            }}>{livePunches.length > 0 ? `${livePunches.length} SCANS TODAY` : 'WAITING...'}</span>
          </h2>
          <button className="btn" style={{ background: '#eee', fontSize: '13px' }} onClick={() => setLivePunches([])}>🗑 Clear</button>
        </div>

        {livePunches.length === 0 ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            background: 'linear-gradient(135deg, #f8f9ff, #f0f4ff)',
            borderRadius: '10px', margin: '0'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>👆</div>
            <div style={{ fontSize: '17px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Waiting for fingerprint scan...</div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              Scan your finger on <strong>Bio System (x 2006)</strong> • Scans appear here in real time
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span className="live-dot-green"></span>
              <span style={{ fontSize: '13px', color: '#27ae60', fontWeight: 600 }}>Socket connected → 192.168.0.106:8080</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '4px 0' }}>
            {livePunches.map((punch, idx) => (
              <div key={punch.id || idx} className="punch-row" style={{
                flex: '1 1 220px', maxWidth: '260px',
                background: idx === 0
                  ? 'linear-gradient(135deg, #667eea15, #764ba215)'
                  : '#f8f9fa',
                border: idx === 0 ? '2px solid #667eea60' : '1px solid #eee',
                borderRadius: '12px', padding: '14px', position: 'relative'
              }}>
                {idx === 0 && (
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: '#667eea', color: 'white',
                    fontSize: '9px', fontWeight: 800, padding: '2px 7px',
                    borderRadius: '20px', letterSpacing: '1px'
                  }}>NEW</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: idx === 0 ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#bdc3c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 800, fontSize: '14px'
                  }}>{getInitials(resolvedName(punch))}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{resolvedName(punch)}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>ID: {punch.userId}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>🕐 {punch.time || punch.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="main-grid">
        <div className="dashboard-card">
            <div className="card-header">
                <h2>📋 Live Attendance - Today</h2>
                <div className="actions">
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>🔄 Refresh</button>
                    <button className="btn btn-success">📥 Export</button>
                </div>
            </div>
            
            <div className="tabs">
                <span className="tab active">All</span>
                <span className="tab">Students</span>
                <span className="tab">Teachers</span>
                <span className="tab">Staff</span>
                <span className="tab">Late</span>
            </div>
            
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>In Time</th>
                        <th>Out Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody id="attendanceTable">
                    <tr>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">A</div> Ahmed Khan</div></td>
                        <td>Teacher</td>
                        <td>08:15 AM</td>
                        <td>--:-- --</td>
                        <td><span className="status present">Present</span></td>
                    </tr>
                    <tr>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">S</div> Sarah Ali</div></td>
                        <td>Student</td>
                        <td>08:45 AM</td>
                        <td>02:30 PM</td>
                        <td><span className="status present">Present</span></td>
                    </tr>
                    <tr>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">R</div> Rahul Sharma</div></td>
                        <td>Student</td>
                        <td>09:20 AM</td>
                        <td>--:-- --</td>
                        <td><span className="status late">Late (20 min)</span></td>
                    </tr>
                    <tr>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar" style={{ background: '#e74c3c' }}>M</div> Mrs. Patel</div></td>
                        <td>Teacher</td>
                        <td>--:-- --</td>
                        <td>--:-- --</td>
                        <td><span className="status absent">Absent</span></td>
                    </tr>
                    <tr>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">J</div> John Doe</div></td>
                        <td>Staff</td>
                        <td>08:00 AM</td>
                        <td>05:00 PM</td>
                        <td><span className="status present">Present</span></td>
                    </tr>
                </tbody>
            </table>
            
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', alignItems: 'center' }}>
                <span>Showing 5 of 124 entries</span>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn" style={{ background: '#eee' }}>Previous</button>
                    <button className="btn btn-primary">1</button>
                    <button className="btn" style={{ background: '#eee' }}>2</button>
                    <button className="btn" style={{ background: '#eee' }}>3</button>
                    <button className="btn" style={{ background: '#eee' }}>Next</button>
                </div>
            </div>
        </div>

        <div className="widget-sidebar">
            <div className="dashboard-card">
                <div className="card-header">
                    <h2>📝 Admission Forms</h2>
                    <button className="btn btn-primary" style={{ fontSize: '12px', padding: '4px 12px' }}>+ New</button>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <div className="admission-item">
                        <div><div className="name">Ayesha Fatima</div><div className="class">Class 10-A • Parent: Mr. Khan</div></div>
                        <span className="status pending">Pending</span>
                    </div>
                    <div className="admission-item">
                        <div><div className="name">Rohan Mehta</div><div className="class">Class 8-B • Parent: Mrs. Mehta</div></div>
                        <span className="status pending">Pending</span>
                    </div>
                    <div className="admission-item">
                        <div><div className="name">Priya Singh</div><div className="class">Class 9-C • Parent: Mr. Singh</div></div>
                        <span className="status approved">Approved</span>
                    </div>
                    <div className="admission-item">
                        <div><div className="name">Ali Hassan</div><div className="class">Class 7-A • Parent: Mrs. Hassan</div></div>
                        <span className="status pending">Pending</span>
                    </div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                    <span>📊 18 pending • 45 approved this month</span>
                </div>
            </div>

            <div className="dashboard-card">
                <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>🔒 Biometric Devices</h2>
                <div className="biometric-status">
                    <span className="dot online"></span>
                    <div>
                        <strong>Bio System (x 2006)</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>SN: NYU7260401606</div>
                        <div style={{ fontSize: '11px', color: '#27ae60' }}>Last sync: just now</div>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#27ae60', fontWeight: 600 }}>✓ Online</span>
                </div>
            </div>

            <div className="dashboard-card">
                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>📨 SMS Notifications</h2>
                <div className="sms-log">
                    <div className="time">10:25 AM • Sent</div>
                    <div className="message">✅ Ayesha Fatima marked present at 8:30 AM</div>
                    <div style={{ fontSize: '11px', color: '#27ae60' }}>Sent to: +91 98765 43210</div>
                </div>
                <div className="sms-log">
                    <div className="time">09:45 AM • Sent</div>
                    <div className="message">⚠️ Rahul Sharma arrived late (9:20 AM)</div>
                    <div style={{ fontSize: '11px', color: '#e67e22' }}>Sent to: +91 87654 32109</div>
                </div>
                <div style={{ marginTop: '10px' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>📱 Send Manual SMS</button>
                </div>
            </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '20px' }}>
        <div className="card-header">
            <h2>📅 Today's Teacher Schedule</h2>
            <div className="actions">
                <button className="btn btn-warning">Edit Schedule</button>
                <button className="btn btn-primary">View Full</button>
            </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                <strong>Ahmed Khan</strong>
                <div style={{ fontSize: '13px', color: '#666' }}>Math • Class 10-A</div>
                <div style={{ fontSize: '12px', color: '#27ae60' }}>🕐 9:00 AM - 10:30 AM</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
                <strong>Mrs. Patel</strong>
                <div style={{ fontSize: '13px', color: '#666' }}>Science • Class 9-B</div>
                <div style={{ fontSize: '12px', color: '#e74c3c' }}>⚠️ Absent - Substitute needed</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
                <strong>Dr. Khan</strong>
                <div style={{ fontSize: '13px', color: '#666' }}>Physics • Class 11-A</div>
                <div style={{ fontSize: '12px', color: '#27ae60' }}>🕐 10:30 AM - 12:00 PM</div>
            </div>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                <strong>Ms. Sharma</strong>
                <div style={{ fontSize: '13px', color: '#666' }}>English • Class 8-A</div>
                <div style={{ fontSize: '12px', color: '#f39c12' }}>🕐 1:00 PM - 2:30 PM</div>
            </div>
        </div>
      </div>
    </div>
  );
};

const AttendancePage = () => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
          <h2>📋 Full Attendance Log</h2>
          <div className="actions">
              <button className="btn btn-primary">🔄 Sync DB</button>
              <button className="btn btn-success">📥 Export PDF</button>
          </div>
      </div>
      <table className="dashboard-table">
          <thead>
              <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Status</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>20 June 2026</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">A</div> Ahmed Khan</div></td>
                  <td>Teacher</td>
                  <td>08:15 AM</td>
                  <td>--:-- --</td>
                  <td><span className="status present">Present</span></td>
              </tr>
              <tr>
                  <td>20 June 2026</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">S</div> Sarah Ali</div></td>
                  <td>Student</td>
                  <td>08:45 AM</td>
                  <td>02:30 PM</td>
                  <td><span className="status present">Present</span></td>
              </tr>
              <tr>
                  <td>19 June 2026</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">R</div> Rahul Sharma</div></td>
                  <td>Student</td>
                  <td>09:20 AM</td>
                  <td>03:10 PM</td>
                  <td><span className="status late">Late</span></td>
              </tr>
              <tr>
                  <td>19 June 2026</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar" style={{ background: '#e74c3c' }}>M</div> Mrs. Patel</div></td>
                  <td>Teacher</td>
                  <td>--:-- --</td>
                  <td>--:-- --</td>
                  <td><span className="status absent">Absent</span></td>
              </tr>
          </tbody>
      </table>
    </div>
  );
};

const AdmissionsPage = () => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
          <h2>📝 Admission Forms Manager</h2>
          <div className="actions">
              <button className="btn btn-primary">+ New Form</button>
          </div>
      </div>
      <div className="tabs">
          <span className="tab active">Pending</span>
          <span className="tab">Approved</span>
          <span className="tab">Rejected</span>
      </div>
      <table className="dashboard-table">
          <thead>
              <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Parent Info</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>Ayesha Fatima</td>
                  <td>Class 10-A</td>
                  <td>Mr. Khan (+91 98765 43210)</td>
                  <td>18 June 2026</td>
                  <td><span className="status pending">Pending</span></td>
                  <td>
                      <button className="btn btn-success" style={{ padding: '4px 10px', marginRight: '5px' }}>Approve</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }}>Reject</button>
                  </td>
              </tr>
              <tr>
                  <td>Rohan Mehta</td>
                  <td>Class 8-B</td>
                  <td>Mrs. Mehta (+91 87654 32109)</td>
                  <td>19 June 2026</td>
                  <td><span className="status pending">Pending</span></td>
                  <td>
                      <button className="btn btn-success" style={{ padding: '4px 10px', marginRight: '5px' }}>Approve</button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px' }}>Reject</button>
                  </td>
              </tr>
              <tr>
                  <td>Priya Singh</td>
                  <td>Class 9-C</td>
                  <td>Mr. Singh (+91 78901 23456)</td>
                  <td>15 June 2026</td>
                  <td><span className="status approved">Approved</span></td>
                  <td><span style={{ color: '#666', fontSize: '13px' }}>No actions</span></td>
              </tr>
          </tbody>
      </table>
    </div>
  );
};

const TeachersPage = () => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
          <h2>👨🏫 Teachers & Salary Panel</h2>
          <div className="actions">
              <button className="btn btn-primary">Add Teacher</button>
              <button className="btn btn-warning">Run Payroll</button>
          </div>
      </div>
      <table className="dashboard-table">
          <thead>
              <tr>
                  <th>Teacher Name</th>
                  <th>Department</th>
                  <th>Base Salary</th>
                  <th>Monthly Attendance</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">A</div> Ahmed Khan</div></td>
                  <td>Mathematics</td>
                  <td>₹ 45,000</td>
                  <td><span style={{ color: '#27ae60', fontWeight: 'bold' }}>20/22 Days</span></td>
                  <td><button className="btn btn-warning" style={{ padding: '4px 10px' }}>💰 Calculate Cut</button></td>
              </tr>
              <tr>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar" style={{ background: '#e74c3c' }}>M</div> Mrs. Patel</div></td>
                  <td>Science</td>
                  <td>₹ 48,000</td>
                  <td><span style={{ color: '#e74c3c', fontWeight: 'bold' }}>15/22 Days</span></td>
                  <td><button className="btn btn-warning" style={{ padding: '4px 10px' }}>💰 Calculate Cut</button></td>
              </tr>
              <tr>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">D</div> Dr. Khan</div></td>
                  <td>Physics</td>
                  <td>₹ 55,000</td>
                  <td><span style={{ color: '#27ae60', fontWeight: 'bold' }}>22/22 Days</span></td>
                  <td><button className="btn btn-warning" style={{ padding: '4px 10px' }}>💰 Calculate Cut</button></td>
              </tr>
          </tbody>
      </table>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #27ae60' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Preview Calculation: Mrs. Patel</h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Base: ₹48,000 | Absences: 7 Days | Deduction: ₹15,272 | <strong>Net Payable: ₹32,728</strong></p>
      </div>
    </div>
  );
};

const Simulator = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [direction, setDirection] = useState('in');
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [result, setResult] = useState(null);
  useEffect(() => { api.get('/users').then(res => { setUsers(res.data); if (res.data.length) setSelected(res.data[0]); }); }, []);
  const simulate = async () => {
    if (!selected) return;
    const now = new Date(); const [h, m, s] = time.split(':').map(Number); now.setHours(h, m, s || 0);
    try {
      const res = await api.post('/biometric/webhook', { fingerprint_id: selected.fingerprint_id, timestamp: now.toISOString(), direction });
      setResult({ success: true, msg: `✅ ${selected.name} marked ${direction === 'in' ? 'IN' : 'OUT'} at ${time}`, data: res.data });
    } catch (err) { setResult({ success: false, msg: `❌ Error: ${err.response?.data?.error || err.message}` }); }
  };
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>🔍 Biometric Simulator</h2>
      <select style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }} onChange={(e) => setSelected(users.find(u => u.id === parseInt(e.target.value)))}>
        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
      </select>
      <div style={{ marginBottom: '15px' }}><label>Direction: </label><input type="radio" value="in" checked={direction === 'in'} onChange={() => setDirection('in')} /> IN <input type="radio" value="out" checked={direction === 'out'} onChange={() => setDirection('out')} /> OUT</div>
      <input type="time" step="1" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }} />
      <button onClick={simulate} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#667eea', color: 'white', fontSize: '16px', cursor: 'pointer' }}>🖐️ Simulate Scan</button>
      {result && <div style={{ marginTop: '15px', padding: '15px', borderRadius: '6px', background: result.success ? '#d4edda' : '#f8d7da', color: result.success ? '#155724' : '#721c24' }}>{result.msg}</div>}
    </div>
  );
};

const NewEnquiryPage = () => {
  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', minHeight: '600px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '50px' }}>
        <span style={{ marginRight: '8px' }}>👤+</span> Enroll New Enquiry
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '15%', right: '15%', height: '2px', background: '#e0e0e0', zIndex: 1 }}>
          <div style={{ width: '30%', height: '100%', background: '#8b5cf6' }}></div>
        </div>
        
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, background: 'white', padding: '0 10px', flex: 1 }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '6px solid #8b5cf6', background: 'white', margin: '0 auto 10px' }}></div>
          <div style={{ fontWeight: 'bold', color: '#555', marginTop: '10px' }}>Basic Details</div>
          <div style={{ fontSize: '12px', color: '#888' }}>Setup Basic Details</div>
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, background: 'white', padding: '0 10px', flex: 1 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #e0e0e0', background: 'white', margin: '4px auto 10px' }}></div>
          <div style={{ fontWeight: 'bold', color: '#888', marginTop: '10px' }}>Class Details</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Setup Class Details</div>
        </div>
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, background: 'white', padding: '0 10px', flex: 1 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #e0e0e0', background: 'white', margin: '4px auto 10px' }}></div>
          <div style={{ fontWeight: 'bold', color: '#888', marginTop: '10px' }}>Academic Details</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Setup Academic Details</div>
        </div>
      </div>

      <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px' }}>
        👤 Basic Detail
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '10px' }}>
        <div>
          <input type="text" placeholder="Student Name*" style={{ width: '100%', padding: '14px', border: '1px solid #e74c3c', borderRadius: '6px', outline: 'none', color: '#e74c3c' }} />
          <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '6px' }}>Please enter student name</div>
        </div>
        <div>
          <input type="text" placeholder="Aadhar Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Enquiry Date*</label>
          <input type="date" defaultValue="2026-06-20" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Gender</label>
          <select style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div style={{ position: 'relative' }}>
          <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Date of Birth</label>
          <input type="date" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#999' }} />
        </div>
        <div>
          <input type="email" placeholder="Email Id" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
        </div>

        <div>
          <input type="text" placeholder="Father Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
        </div>
        <div>
          <input type="text" placeholder="Mother Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
        </div>
        <div>
          <input type="text" placeholder="Student Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
        </div>
      </div>
    </div>
  );
};

// --- DEVICES PAGE ---
const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newName, setNewName] = useState('');
  const [liveScans, setLiveScans] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimerRef = React.useRef(null);

  const fetchDevices = () => {
    setLoading(true);
    api.get('/devices')
      .then(res => { setDevices(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchDevices();

    // Load user ID → name map
    api.get('/users/map').then(res => setUserMap(res.data)).catch(() => {});

    // Listen for live biometric punches via Socket.io
    const handleLivePunch = (data) => {
      const scanEntry = {
        ...data,
        id: Date.now(),
        receivedAt: new Date().toLocaleTimeString()
      };

      // Add to live feed (keep last 20)
      setLiveScans(prev => [scanEntry, ...prev].slice(0, 20));

      // Show pop-up toast
      setToast(scanEntry);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 5000);

      // Refresh device status to update lastActive
      fetchDevices();
    };

    socket.on('live_punch', handleLivePunch);
    return () => {
      socket.off('live_punch', handleLivePunch);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleRename = (e) => {
    e.preventDefault();
    if (!newName.trim() || !editingDevice) return;
    api.post('/devices/rename', { serialNumber: editingDevice.serialNumber, name: newName })
      .then(() => {
        setDevices(devices.map(d =>
          d.serialNumber === editingDevice.serialNumber ? { ...d, name: newName } : d
        ));
        setEditingDevice(null);
        setNewName('');
      })
      .catch(err => console.error(err));
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '??';
  const resolvedName = (scan) => scan.userName || userMap[String(scan.userId)] || `User ${scan.userId}`;

  const toastStyle = {
    position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white', borderRadius: '16px', padding: '20px 24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', minWidth: '320px',
    border: '1px solid rgba(102,126,234,0.4)',
    animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex', alignItems: 'center', gap: '16px'
  };

  return (
    <div>
      {/* LIVE TOAST NOTIFICATION */}
      {toast && (
        <div style={toastStyle}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0
          }}>{getInitials(resolvedName(toast))}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#a0a8c0', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              🔴 Live Scan Detected
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>
              {resolvedName(toast)}
            </div>
            <div style={{ fontSize: '12px', color: '#8892b0' }}>
              ID: {toast.userId} &nbsp;•&nbsp; 📟 {toast.deviceSn} &nbsp;•&nbsp; 🕐 {toast.receivedAt}
            </div>
          </div>
          <button onClick={() => setToast(null)} style={{
            background: 'transparent', border: 'none', color: '#8892b0',
            fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1
          }}>✕</button>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes scanFadeIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .live-scan-row { animation: scanFadeIn 0.4s ease-out; }
        .pulse-red {
          width: 10px; height: 10px; border-radius: 50%; background: #e74c3c;
          animation: pulse-dot 1.2s ease-in-out infinite;
          display: inline-block; margin-right: 8px;
        }
        .pulse-green {
          width: 10px; height: 10px; border-radius: 50%; background: #27ae60;
          animation: pulse-dot 1.2s ease-in-out infinite;
          display: inline-block; margin-right: 8px;
        }
      `}</style>

      {/* DEVICES TABLE */}
      <div className="dashboard-card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2>🔒 Biometric Devices Manager</h2>
          <div className="actions">
            <button className="btn btn-primary" onClick={fetchDevices}>🔄 Refresh Status</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading devices...</div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Device Name</th>
                <th>Serial Number</th>
                <th>Last Active / Ping</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device, idx) => (
                <tr key={device.serialNumber || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '22px' }}>📟</span>
                      <div>
                        <strong style={{ fontSize: '15px' }}>{device.name}</strong>
                        <div style={{ fontSize: '12px', color: '#888' }}>MAC: 00:17:61:10:35:c5</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ background: '#f0f2f5', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{device.serialNumber}</code></td>
                  <td>{new Date(device.lastActive).toLocaleString()}</td>
                  <td>
                    <span className={`status ${device.status === 'online' ? 'present' : 'absent'}`}>
                      {device.status === 'online' ? '● Online' : '● Offline'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning"
                      style={{ padding: '4px 10px', fontSize: '13px' }}
                      onClick={() => { setEditingDevice(device); setNewName(device.name); }}
                    >✏️ Rename</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LIVE SYNC PANEL */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={liveScans.length > 0 ? 'pulse-red' : 'pulse-green'}></span>
            Live Sync Feed
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '3px 10px',
              background: liveScans.length > 0 ? '#e74c3c' : '#27ae60',
              color: 'white', borderRadius: '20px', letterSpacing: '0.5px'
            }}>
              {liveScans.length > 0 ? `${liveScans.length} SCANS` : 'WAITING FOR SCAN'}
            </span>
          </h2>
          <button className="btn" style={{ background: '#eee', fontSize: '13px' }} onClick={() => setLiveScans([])}>
            🗑 Clear
          </button>
        </div>

        {liveScans.length === 0 ? (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            background: 'linear-gradient(135deg, #f8f9ff, #f0f4ff)',
            borderRadius: '8px', margin: '10px 0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
              Waiting for fingerprint scan...
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Ask someone to scan their fingerprint on the <strong>Bio System (x 2006)</strong> device.<br />
              Their scan will appear here instantly in real time.
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <span className="pulse-green"></span>
              <span style={{ fontSize: '13px', color: '#27ae60', fontWeight: '600' }}>
                Socket connected • Listening on port 8080
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
              padding: '10px 0'
            }}>
              {liveScans.map((scan, idx) => (
                <div key={scan.id || idx} className="live-scan-row" style={{
                  background: idx === 0
                    ? 'linear-gradient(135deg, #667eea22, #764ba222)'
                    : '#f8f9fa',
                  border: idx === 0 ? '2px solid #667eea55' : '1px solid #eee',
                  borderRadius: '12px', padding: '16px',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: '#667eea', color: 'white',
                      fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                      borderRadius: '20px', letterSpacing: '1px'
                    }}>NEW</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: idx === 0
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : 'linear-gradient(135deg, #bdc3c7, #95a5a6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '800', fontSize: '15px', flexShrink: 0
                    }}>{getInitials(resolvedName(scan))}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>
                        {resolvedName(scan)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ID: {scan.userId} &nbsp;•&nbsp; 📟 {scan.deviceSn}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                        🕐 {scan.receivedAt}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RENAME MODAL */}
      {editingDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>✏️ Rename Device</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
              Set a friendly name for: <code>{editingDevice.serialNumber}</code>
            </p>
            <form onSubmit={handleRename}>
              <input
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Main Gate, Library..."
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' }}
                required autoFocus
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" style={{ background: '#eee', color: '#333' }} onClick={() => setEditingDevice(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  let initialUser = null;
  try { initialUser = JSON.parse(localStorage.getItem('user')); } catch (e) {}
  const [user, setUser] = useState(initialUser);

  const login = (t, u) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setToken(t); setUser(u); };
  const logout = () => { localStorage.clear(); setToken(null); setUser(null); };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, login, logout }}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {!token || !user ? (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout logout={logout} user={user}><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Layout logout={logout} user={user}><AttendancePage /></Layout></ProtectedRoute>} />
            <Route path="/admissions" element={<ProtectedRoute><Layout logout={logout} user={user}><AdmissionsPage /></Layout></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><Layout logout={logout} user={user}><TeachersPage /></Layout></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute><Layout logout={logout} user={user}><DevicesPage /></Layout></ProtectedRoute>} />
            <Route path="/simulator" element={<ProtectedRoute><Layout logout={logout} user={user}><Simulator /></Layout></ProtectedRoute>} />
            <Route path="/enquiries/new" element={<ProtectedRoute><Layout logout={logout} user={user}><NewEnquiryPage /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </Router>
    </AuthContext.Provider>
  );
}
export default App;
