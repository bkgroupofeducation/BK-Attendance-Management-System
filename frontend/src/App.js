import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import ReceiptPrintView from './ReceiptPrintView';
import { io } from 'socket.io-client';
import api from './api';
import logo from './logo.jpeg';

const backendHost = 'localhost';
const socket = io(`http://${backendHost}:8080`);
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
        <h1 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <img src={logo} alt="BioAttend Logo" style={{ height: '48px', width: '48px', borderRadius: '6px', objectFit: 'cover' }} />
          BioAttend
        </h1>
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
      </div >
    </div >
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

    const [admOpen, setAdmOpen] = useState(false);
    const [acadOpen, setAcadOpen] = useState(false);
    const [finOpen, setFinOpen] = useState(false);
    const [insOpen, setInsOpen] = useState(false);
    return (
        <div style={{ width: '250px', background: '#2c3e50', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ color: 'white', padding: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="BioAttend Logo" style={{ height: '42px', width: '42px', borderRadius: '4px', objectFit: 'cover' }} />
        BioAttend
      </h2>
      <div style={{ padding: '0 20px 20px', color: '#bdc3c7', fontSize: '14px' }}>Welcome, <strong style={{ color: '#ffffff' }}>{user?.name}</strong></div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li><Link to="/" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>📈 Dashboard</Link></li>



    {/* Admissions Dropdown */ }
    <li>
        <div onClick={() => setAdmOpen(!admOpen)} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', color: '#ffffff', cursor: 'pointer', borderBottom: '1px solid #34495e', background: admOpen ? '#34495e' : 'transparent', fontWeight: '500', fontSize: '15px' }}>
            <span>📝 Admissions</span>
            <span>{admOpen ? '▲' : '▼'}</span>
        </div>
        {admOpen && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: '#1a252f' }}>
                <li><Link to="/enroll-student" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Enroll Student</Link></li>
                <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Bulk Upload</Link></li>
                <li><Link to="/admissions" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Student List</Link></li>
                <li><Link to="/birthdays" style={{ display: 'block', padding: '12px 20px 12px 40px', color: '#ecf0f1', textDecoration: 'none', fontSize: '14px', borderBottom: '1px solid #2c3e50', fontWeight: '400' }}>○ Birthday Reminders</Link></li>
            </ul>
        )}
    </li>

    {/* Academics Dropdown */ }
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

    {/* Finances Dropdown */ }
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

    {/* Insights Dropdown */ }
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
        <li><Link to="/teachers" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>👨‍🏫 Teachers & Staff</Link></li>
        <li><Link to="/devices" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>🔒 Devices</Link></li>
        <li><Link to="/simulator" style={{ display: 'block', padding: '15px 20px', color: '#ffffff', textDecoration: 'none', borderBottom: '1px solid #34495e', fontWeight: '500', fontSize: '15px' }}>🔬 Simulator</Link></li>
        <li style={{ padding: '15px 20px' }}>
          <button onClick={logout} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', background: '#e74c3c', color: 'white', width: '100%' }}>🚪 Logout</button>
        </li>
      </ul >
    </div >
  );
};

const Layout = ({ children, logout, user }) => (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Sidebar logout={logout} user={user} />
        <div style={{ flex: 1, padding: '20px', overflowX: 'hidden' }}>
            <div className="header">
                <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={logo} alt="BioAttend Logo" style={{ height: '48px', width: '48px', borderRadius: '6px', objectFit: 'cover' }} />
              BioAttend Pro
            </h1>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Biometric Attendance Management System</span>
        </div >
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
      </div >
    { children }
    </div >
  </div >
);

// --- PAGES ---
const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [recent, setRecent] = useState([]);
    const [livePunches, setLivePunches] = useState([]);

    const [lastScanToast, setLastScanToast] = useState(null);
    const toastRef = React.useRef(null);

    useEffect(() => {
        api.get('/users').then(res => setUsers(res.data)).catch(() => { });
        api.get('/admin/dashboard').then(res => {
            setStats(res.data.stats);
            setRecent(res.data.recentAttendance);
        });

        // Load user ID → name map
        api.get('/users').then(res => setUsers(res.data)).catch(() => { });

        const handlePunch = (data) => {
            const entry = { ...data, id: Date.now(), time: new Date().toLocaleTimeString() };
            setLivePunches(prev => [entry, ...prev].slice(0, 10));
            
            setRecent(prev => {
                const updated = [...prev];
                const existingIndex = updated.findIndex(r => r.name === data.userName);
                const formatTime = (d) => new Date(d || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
                const punchTime = formatTime(data.timestamp);

                if (existingIndex > -1) {
                    updated[existingIndex] = { ...updated[existingIndex], outTime: punchTime };
                    // Move to top
                    const item = updated.splice(existingIndex, 1)[0];
                    updated.unshift(item);
                } else {
                    updated.unshift({
                        name: data.userName || `User ${data.userId}`,
                        role: 'User',
                        photo: data.userPhoto || null,
                        inTime: punchTime,
                        outTime: '--:-- --',
                        status: 'Present'
                    });
                }
                return updated;
            });

            setLastScanToast(entry);
            if (toastRef.current) clearTimeout(toastRef.current);
            toastRef.current = setTimeout(() => setLastScanToast(null), 5000);
        };

        const handlePunchPhoto = (data) => {
            setLivePunches(prev => prev.map(p => {
                if (String(p.userId) === String(data.userId)) {
                    return { ...p, userPhoto: data.userPhoto };
                }
                return p;
            }));

            setLastScanToast(prev => {
                if (prev && String(prev.userId) === String(data.userId)) {
                    return { ...prev, userPhoto: data.userPhoto };
                }
                return prev;
            });



            setUsers(prev => prev.map(u => {
                if (String(u.id) === String(data.userId) || String(u.fingerprint_id) === String(data.userId)) {
                    return { ...u, photo: data.userPhoto };
                }
                return u;
            }));
        };

        socket.on('live_punch', handlePunch);
        socket.on('live_punch_photo', handlePunchPhoto);
        return () => {
            socket.off('live_punch', handlePunch);
            socket.off('live_punch_photo', handlePunchPhoto);
            if (toastRef.current) clearTimeout(toastRef.current);
        };
    }, []);

    if (!stats) return <div>Loading dashboard...</div>;

    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

    const resolvedName = (punch) => {
        const user = users.find(u => String(u.id) === String(punch.userId) || String(u.fingerprint_id) === String(punch.userId));
        return user ? user.name : (punch.userName || `User ${punch.userId}`);
    };

    const resolvedPhoto = (punch) => {
        let photo = null;
        if (punch.userPhoto) {
            photo = punch.userPhoto;
        } else {
            const user = users.find(u => String(u.id) === String(punch.userId) || String(u.fingerprint_id) === String(punch.userId));
            photo = user ? user.photo : null;
        }
        if (photo) {
            if (photo.startsWith('http')) return photo;
            return `http://${backendHost}:8080${photo}`;
        }
        return null;
    };

    const isFaceScan = (punch) => String(punch.verifyMode) === '15';

    const getUpcomingBirthdays = () => {
        const today = new Date();
        const upcoming = users.filter(u => {
            if (!u.dob) return false;
            const dobDate = new Date(u.dob);
            if (isNaN(dobDate)) return false;

            const bdayThisYear = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
            let diffTime = bdayThisYear.getTime() - today.getTime();

            if (diffTime < -86400000) {
                bdayThisYear.setFullYear(today.getFullYear() + 1);
                diffTime = bdayThisYear.getTime() - today.getTime();
            }
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 30;
        }).map(u => {
            const dobDate = new Date(u.dob);
            const bdayThisYear = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
            let diffTime = bdayThisYear.getTime() - today.getTime();
            if (diffTime < -86400000) {
                bdayThisYear.setFullYear(today.getFullYear() + 1);
            }
            const diffDays = Math.ceil((bdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const age = bdayThisYear.getFullYear() - dobDate.getFullYear();
            return { ...u, diffDays, age };
        }).sort((a, b) => a.diffDays - b.diffDays);
        return upcoming;
    };

    const upcomingBirthdays = getUpcomingBirthdays();


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
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {resolvedPhoto(lastScanToast) ? (
                            <img src={resolvedPhoto(lastScanToast)} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            isFaceScan(lastScanToast) ? '👤' : '👆'
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#a0a8d0', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
                            🔴 {isFaceScan(lastScanToast) ? 'LIVE FACE SCAN' : 'LIVE FINGERPRINT SCAN'}
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
    <span style={{ fontSize: '13px', color: '#27ae60', fontWeight: 600 }}>Socket connected → 192.168.0.107:8080</span>
            </div >
          </div >
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
                        color: 'white', fontWeight: 800, fontSize: '14px', overflow: 'hidden'
                    }}>
                        {resolvedPhoto(punch) ? (
                            <img src={resolvedPhoto(punch)} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            isFaceScan(punch) ? '👤' : '👆'
                        )}
                    </div>
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
      </div >

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
                    {recent.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No attendance records yet today. Waiting for machine sync...</td></tr>
                    ) : recent.map((r, i) => (
                      <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {r.photo ? (
                                <img src={r.photo.startsWith('http') ? r.photo : `http://${backendHost}:8080${r.photo}`} alt="Face" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div className="avatar" style={{ background: '#bdc3c7' }}>{r.name.charAt(0)}</div>
                              )}
                              {r.name}
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{r.role}</td>
                          <td>{r.inTime}</td>
                          <td>{r.outTime}</td>
                          <td><span className="status present">{r.status}</span></td>
                      </tr>
                    ))}
                </tbody>
            </table>
            
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', alignItems: 'center' }}>
                <span>Showing {recent.length} entries</span>
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

            
            <div className="dashboard-card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #fff, #fff9fb)', border: '1px solid #ffe3ec' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎉 Upcoming Birthdays</h2>
                
                {upcomingBirthdays.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                    No birthdays in the next 30 days.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {upcomingBirthdays.map(u => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(255,192,203,0.2)', border: '1px solid #ffe3ec' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                          {getInitials(u.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: '#e84393' }}>
                            {u.diffDays === 0 ? '🎂 TODAY! Turning ' + u.age : `In ${u.diffDays} days (${new Date(u.dob).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })})`} • <span style={{textTransform:'capitalize'}}>{u.role}</span>
                          </div>
                        </div>
                        <button style={{ background: '#e84393', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Wish</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="dashboard-card" style={{ marginTop: '20px' }}>
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
    </div >
  );
};

const AttendancePage = () => {
    const [livePunches, setLivePunches] = useState([]);
    const [userMap, setUserMap] = useState({});

    useEffect(() => {
        api.get('/users/map').then(res => setUserMap(res.data)).catch(() => { });
        const handlePunch = (data) => {
            const entry = { ...data, id: Date.now(), time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) };
            setLivePunches(prev => [entry, ...prev]);
        };
        socket.on('live_punch', handlePunch);
        return () => socket.off('live_punch', handlePunch);
    }, []);

    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
    const resolvedName = (punch) => punch.userName || userMap[String(punch.userId)] || `User ${punch.userId}`;

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
                    {livePunches.map((punch, idx) => (
                        <tr key={`live-${idx}`} style={{ background: '#f8f9ff', animation: 'punchSlide 0.5s ease-out' }}>
                            <td>{punch.date}</td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                                        {getInitials(resolvedName(punch))}
                                    </div>
                                    {resolvedName(punch)} <span style={{ fontSize: '10px', background: '#667eea', color: 'white', padding: '2px 6px', borderRadius: '10px', marginLeft: '5px' }}>NEW</span>
                                </div>
                            </td>
                            <td>User</td>
                            <td>{punch.time || punch.timestamp}</td>
                            <td>--:-- --</td>
                            <td><span className="status present">Present</span></td>
                        </tr>
                    ))}
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

const NewEnquiryPage = () => {
    return (
        <div style={{ height: 'calc(100vh - 100px)', width: '100%', padding: '0px' }}>
            <iframe src="/enrollment.html" style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }} title="New Enquiry"></iframe>
        </div>
    );
};

const AdmissionsPage = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        api.get('/users').then(res => {
            setStudents(res.data.filter(u => u.role === 'student'));
        }).catch(err => console.error(err));
    }, []);

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h2>📝 Student List & Admissions</h2>
                <div className="actions">
                    <Link to="/enroll-student" className="btn btn-primary">+ New Enrollment</Link>
                </div>
            </div>

            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Register No.</th>
                        <th>Email Address</th>
                        <th>Enrollment Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, idx) => (
                        <tr key={s.id || idx}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar" style={{ background: '#3498db' }}>{s.name.charAt(0)}</div>
                                    {s.name}
                                </div>
                            </td>
                            <td><code style={{ background: '#f0f2f5', padding: '4px 8px', borderRadius: '4px' }}>{s.fingerprint_id}</code></td>
                            <td>{s.email || 'N/A'}</td>
                            <td>{new Date().toLocaleDateString('en-GB')}</td>
                            <td><span className="status approved">Enrolled</span></td>
                            <td>
                                <button className="btn btn-primary" style={{ padding: '4px 10px' }} onClick={() => setSelectedStudent(s)}>Profile</button>
                            </td>
                        </tr>
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No enrolled students found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedStudent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="avatar" style={{ background: '#8b5cf6', width: '50px', height: '50px', fontSize: '24px' }}>{selectedStudent.name.charAt(0)}</div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: '#333' }}>{selectedStudent.name}</h3>
                                    <div style={{ color: '#888', fontSize: '13px' }}>Enrolled • Register No: {selectedStudent.fingerprint_id}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => window.print()} style={{ background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Receipt</button>
                                <button onClick={() => setSelectedStudent(null)} style={{ background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', fontSize: '18px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '14px', color: '#555' }}>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Biometric ID / Reg No</strong> {selectedStudent.fingerprint_id || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Email Id</strong> {selectedStudent.email || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Student Phone</strong> {selectedStudent.studentPhone || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Parent Phone</strong> {selectedStudent.parentPhone || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Aadhar Number</strong> {selectedStudent.aadhar || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Gender</strong> {selectedStudent.gender || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Date of Birth</strong> {selectedStudent.dob || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>10th Marks</strong> {selectedStudent.marks10th ? `${selectedStudent.marks10th}%` : 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>12th Marks</strong> {selectedStudent.marks12th ? `${selectedStudent.marks12th}%` : 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Enquiry Date</strong> {selectedStudent.enquiryDate || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Previous School</strong> {selectedStudent.previousSchool || 'N/A'}</div>
                            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Full Address</strong> {selectedStudent.address || 'N/A'}</div>
                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '5px' }}></div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Branch</strong> {selectedStudent.branch || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Enrolled Courses</strong> {selectedStudent.courses?.join(', ') || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Batch Timing</strong> {selectedStudent.batchTiming || 'N/A'}</div>

                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '5px' }}></div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Bank Name</strong> {selectedStudent.bankName || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Account Holder</strong> {selectedStudent.accountHolder || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Account Number</strong> {selectedStudent.accountNumber || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>IFSC Code</strong> {selectedStudent.ifscCode || 'N/A'}</div>

                            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '5px' }}></div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Installment Enabled</strong> {selectedStudent.installment || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Payment Mode</strong> {selectedStudent.paymentMode || 'N/A'}</div>
                            <div><strong style={{ color: '#333', display: 'block', marginBottom: '4px' }}>Amount Received</strong> {selectedStudent.amountReceived ? `₹${selectedStudent.amountReceived}` : 'N/A'}</div>
                            <div style={{ gridColumn: '1 / -1', background: '#f3e8ff', padding: '15px', borderRadius: '8px', color: '#6b21a8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '15px' }}>Total Net Fees</strong>
                                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹{selectedStudent.fee || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden receipt for printing */}
            <ReceiptPrintView student={selectedStudent} />
        </div>
    );
};

const TeachersPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showGlobalSummary, setShowGlobalSummary] = useState(false);
    const [summarySearchTerm, setSummarySearchTerm] = useState('');

    // Form State
    const [role, setRole] = useState('teacher');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [fingerprintId, setFingerprintId] = useState('');
    const [experience, setExperience] = useState('');
    const [subject, setSubject] = useState('');
    const [timing, setTiming] = useState('');
    const [salary, setSalary] = useState('');
    const [dailySalary, setDailySalary] = useState('');
    const [profession, setProfession] = useState('');
    const [batch, setBatch] = useState('11th PCMB');
    const [otherBatch, setOtherBatch] = useState('');

    const fetchTeachers = () => {
        api.get('/staff/payroll-summary').then(res => {
            setTeachers(res.data);
        }).catch(err => console.error(err));
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalBatch = batch === 'Other' ? otherBatch : batch;
        try {
            await api.post('/users/enroll', { name, email, role, fingerprint_id: fingerprintId, experience, subject, timing, salary, profession, batch: finalBatch });
            setShowModal(false);
            setName(''); setEmail(''); setFingerprintId(''); setExperience(''); setSubject(''); setTiming(''); setSalary(''); setDailySalary(''); setProfession(''); setBatch('11th PCMB'); setOtherBatch('');
            fetchTeachers();
        } catch (err) {
            alert("Error adding " + role + ": " + (err.response?.data?.error || err.message));
        }
    };

    const [inTime, setInTime] = useState('07:30');
    const [outTime, setOutTime] = useState('09:00'); // 1.5 hours standard shift
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const calculatePayout = () => {
        if (!inTime || !outTime) return { minutes: 0, hours: 0, remMins: 0, payout: 0, deduction: 0 };

        // Parse input times
        const [inH, inM] = inTime.split(':').map(Number);
        const [outH, outM] = outTime.split(':').map(Number);

        const actualIn = new Date(); actualIn.setHours(inH, inM, 0);
        const actualOut = new Date(); actualOut.setHours(outH, outM, 0);

        // Shift boundaries
        const shiftStart = new Date(); shiftStart.setHours(7, 30, 0);
        const graceEnd = new Date(); graceEnd.setHours(7, 35, 0);
        const shiftEnd = new Date(); shiftEnd.setHours(9, 0, 0);

        // 1. Calculate Effective In Time
        let effectiveIn = actualIn;
        if (actualIn <= graceEnd) {
            effectiveIn = shiftStart; // Grace period: treat as 07:30
        }

        // 2. Calculate Effective Out Time
        let effectiveOut = actualOut;
        if (actualOut > shiftEnd) {
            effectiveOut = shiftEnd; // Don't pay extra for staying past 09:00
        }

        // 3. Calculate Valid Minutes
        let validDiffMs = effectiveOut - effectiveIn;
        if (validDiffMs < 0) validDiffMs = 0;

        const validMinutes = Math.floor(validDiffMs / 60000);

        // Rate: 700 rupees for 1.5 hours (90 minutes)
        const ratePerMinute = 700 / 90;
        const payout = validMinutes * ratePerMinute;
        const deduction = 700 - payout;

        return {
            minutes: validMinutes,
            hours: Math.floor(validMinutes / 60),
            remMins: validMinutes % 60,
            payout: payout.toFixed(2),
            deduction: deduction > 0 ? deduction.toFixed(2) : 0
        };
    };

    const calc = calculatePayout();
    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h2>👨‍🏫 Teachers & Staff Panel</h2>
                <div className="actions">
                    <button className="btn btn-info" style={{ marginRight: '10px', background: '#3498db', color: '#fff', border: 'none' }} onClick={() => setShowGlobalSummary(true)}>📊 All Summary</button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Teacher/Staff</button>
                    <button className="btn btn-warning">Run Payroll</button>
                </div>
            </div>
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Subject/Profession</th>
                        <th>Today's Status</th>
                        <th>In Time</th>
                        <th>Out Time</th>
                        <th>Working Hours</th>
                        <th>Base Salary</th>
                        <th>Today's Pay</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map(t => (
                        <tr key={t.id}>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="avatar">{t.name.charAt(0)}</div> {t.name}</div></td>
                            <td style={{ textTransform: 'capitalize' }}>{t.role}</td>
                            <td>{t.role === 'teacher' ? `${t.subject || 'N/A'} ${t.batch ? `(${t.batch})` : ''}` : (t.profession || 'N/A')}</td>
                            <td>
                                {t.status === 'Present' && <span className="badge badge-success">Present</span>}
                                {t.status === 'Late' && <span className="badge badge-warning">Late ({t.lateMinutes}m)</span>}
                                {t.status === 'Absent' && <span className="badge badge-danger">Absent</span>}
                            </td>
                            <td>
                                {t.inTime && t.inTime !== '--:--' ? (
                                    <span style={{ background: '#e8f8f5', color: '#16a085', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', border: '1px solid #d1f2eb' }}>
                                        ↓ {t.inTime}
                                    </span>
                                ) : (
                                    <span style={{ color: '#ccc', fontSize: '12px' }}>--:--</span>
                                )}
                            </td>
                            <td>
                                {t.outTime && t.outTime !== '--:--' ? (
                                    <span style={{ background: '#fdf2e9', color: '#d35400', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', border: '1px solid #fae5d3' }}>
                                        ↑ {t.outTime}
                                    </span>
                                ) : (
                                    <span style={{ color: '#ccc', fontSize: '12px' }}>--:--</span>
                                )}
                            </td>
                            <td>
                                {t.workingHours && t.workingHours !== '--' ? (
                                    <span style={{ background: '#f4f6f7', color: '#2c3e50', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', border: '1px solid #e5e8e8', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                                        ⏱ {t.workingHours}
                                    </span>
                                ) : (
                                    <span style={{ color: '#ccc', fontSize: '12px' }}>--</span>
                                )}
                            </td>
                            <td>₹ {t.salary ? t.salary.toLocaleString('en-IN') : '0'} / mo</td>
                            <td><strong style={{ color: '#27ae60' }}>₹ {t.dayPay ? Math.round(t.dayPay) : '0'}</strong></td>
                            <td><button className="btn btn-warning" style={{ padding: '4px 10px' }} onClick={() => setSelectedTeacher(t)}>💰 Calculate Pay</button></td>
                        </tr>
                    ))}
                    {teachers.length === 0 && (
                        <tr>
                            <td colSpan="10" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No teachers or staff found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>👤 Add New Member</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <label style={{ flex: 1 }}>
                                    Role:
                                    <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }}>
                                        <option value="teacher">Teacher</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </label>
                                <label style={{ flex: 1 }}>
                                    Biometric ID: *
                                    <input type="number" value={fingerprintId} onChange={e => setFingerprintId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginTop: '5px' }} required />
                                </label>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <input type="text" placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} required />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                            </div>

                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Salary Information</h4>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input type="number" placeholder="Monthly Salary (₹)" value={salary} onChange={e => setSalary(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    <button type="button" className="btn btn-warning" style={{ padding: '8px 15px', fontWeight: 'bold' }} onClick={() => {
                                        if (salary && !dailySalary) setDailySalary((parseFloat(salary) / 30).toFixed(2));
                                        else if (dailySalary && !salary) setSalary((parseFloat(dailySalary) * 30).toFixed(2));
                                        else if (salary && dailySalary) setDailySalary((parseFloat(salary) / 30).toFixed(2)); // default overwrite daily
                                    }}>Calculate</button>
                                    <input type="number" placeholder="Daily Salary (₹)" value={dailySalary} onChange={e => setDailySalary(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                </div>
                            </div>

                            {role === 'teacher' && (
                                <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #d9e2ec' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Teacher Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <input type="text" placeholder="Topic / Subject" value={subject} onChange={e => setSubject(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="Timing (e.g. 9 AM - 1 PM)" value={timing} onChange={e => setTiming(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        <select value={batch} onChange={e => setBatch(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', gridColumn: batch === 'Other' ? 'span 1' : 'span 2' }}>
                                            <option value="11th PCMB">11th PCMB</option>
                                            <option value="12th PCMB">12th PCMB</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {batch === 'Other' && (
                                            <input type="text" placeholder="Enter custom batch" value={otherBatch} onChange={e => setOtherBatch(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {role === 'staff' && (
                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #eee' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555', textTransform: 'uppercase' }}>Staff Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                                        <input type="text" placeholder="Profession (e.g. Receptionist, Security)" value={profession} onChange={e => setProfession(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" className="btn" style={{ background: '#eee', color: '#333' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Summary Modal */}
            {showGlobalSummary && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '40px' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '1000px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'sticky', top: '-30px', background: '#fff', padding: '20px 0', zIndex: 10, borderBottom: '1px solid #eaeaea' }}>
                            <h3 style={{ margin: 0, color: '#2c3e50' }}>📊 Comprehensive Staff Attendance Summary</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    placeholder="🔍 Search by name or role..." 
                                    value={summarySearchTerm} 
                                    onChange={(e) => setSummarySearchTerm(e.target.value)}
                                    style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #d1d8e0', outline: 'none', width: '250px', fontSize: '13px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}
                                />
                                <button className="btn" style={{ padding: '6px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px' }} onClick={() => setShowGlobalSummary(false)}>Close</button>
                            </div>
                        </div>
                        
                        {teachers.filter(t => t.name.toLowerCase().includes(summarySearchTerm.toLowerCase()) || t.role.toLowerCase().includes(summarySearchTerm.toLowerCase())).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No data available.</div>
                        ) : (
                            teachers.filter(t => t.name.toLowerCase().includes(summarySearchTerm.toLowerCase()) || t.role.toLowerCase().includes(summarySearchTerm.toLowerCase())).map(teacher => (
                                <div key={teacher.id} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e1e8ed', borderRadius: '8px', background: '#fdfdfe' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, color: '#2980b9', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '14px', background: '#3498db', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>{teacher.name.charAt(0)}</div>
                                            {teacher.name} <span style={{ fontSize: '13px', color: '#7f8c8d', fontWeight: 'normal' }}>({teacher.role === 'teacher' ? teacher.subject : teacher.profession})</span>
                                        </h4>
                                        <div style={{ fontSize: '13px', background: '#e8f8f5', color: '#16a085', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                            {teacher.daysPresent || 0} Days Present
                                        </div>
                                    </div>
                                    
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f4f6f7', zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#555' }}>Date</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#555' }}>Status</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#555' }}>In Time</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#555' }}>Out Time</th>
                                                    <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#555' }}>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teacher.monthlyLog && teacher.monthlyLog.length > 0 ? (
                                                    teacher.monthlyLog.map((log, idx) => (
                                                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', background: log.status === 'Sunday' ? '#fafafa' : 'transparent' }}>
                                                            <td style={{ padding: '10px', color: '#444', fontWeight: '500' }}>{log.date}</td>
                                                            <td style={{ padding: '10px' }}>
                                                                {log.status === 'Present' && <span style={{ color: '#27ae60', fontWeight: '600' }}>Present</span>}
                                                                {log.status === 'Absent' && <span style={{ color: '#e74c3c', fontWeight: '600' }}>Absent</span>}
                                                                {log.status === 'Sunday' && <span style={{ color: '#f39c12' }}>Sunday</span>}
                                                                {log.status === 'Late' && <span style={{ color: '#e67e22', fontWeight: '600' }}>Late</span>}
                                                            </td>
                                                            <td style={{ padding: '10px', color: '#666' }}>{log.inTime}</td>
                                                            <td style={{ padding: '10px', color: '#666' }}>{log.outTime}</td>
                                                            <td style={{ padding: '10px', color: '#666', fontWeight: '500' }}>
                                                                {log.workingHours !== '--' ? `⏱ ${log.workingHours}` : '--'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                                                            No attendance records for this month.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {selectedTeacher && typeof selectedTeacher === 'object' && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '5px solid #27ae60' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>Professional Payroll Calculator: {selectedTeacher.name}</h4>
                        <button className="btn" style={{ padding: '2px 8px', background: 'transparent', color: '#666' }} onClick={() => setSelectedTeacher(null)}>✕</button>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Payroll Statistics */}
                        <div style={{ display: 'flex', gap: '20px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#888' }}>Month-to-Date Pay</div>
                                <strong style={{ fontSize: '18px', color: '#2980b9' }}>₹ {selectedTeacher.monthPay ? Math.round(selectedTeacher.monthPay).toLocaleString('en-IN') : '0'}</strong>
                            </div>

                            <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>Today's In Time</div>
                                <strong style={{ fontSize: '16px' }}>{selectedTeacher.inTime}</strong>
                            </div>
                            
                            <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>Daily Base Pay</div>
                                <strong style={{ fontSize: '16px' }}>₹ {selectedTeacher.salary ? Math.round(selectedTeacher.salary / 30) : 0}</strong>
                            </div>

                            {selectedTeacher.status === 'Late' && (
                                <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                                    <div style={{ fontSize: '12px', color: '#e74c3c' }}>Late Penalty (-{selectedTeacher.lateMinutes}m)</div>
                                    <strong style={{ fontSize: '16px', color: '#e74c3c' }}>- ₹ {Math.round((selectedTeacher.salary / 30) - selectedTeacher.dayPay)}</strong>
                                </div>
                            )}

                            <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                                <div style={{ fontSize: '12px', color: '#888' }}>Today's Final Payout</div>
                                <strong style={{ fontSize: '20px', color: '#27ae60' }}>₹ {selectedTeacher.dayPay ? Math.round(selectedTeacher.dayPay) : 0}</strong>
                            </div>
                        </div>

                        {/* Professional Attendance Details Box */}
                        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', minWidth: '280px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Attendance Summary</span>
                                <span style={{ color: '#27ae60', background: '#e8f8f5', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                                    {selectedTeacher.daysPresent || 0} Present
                                </span>
                            </div>
                            
                            {selectedTeacher.absentDates && selectedTeacher.absentDates.length > 0 ? (
                                <div>
                                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>
                                        Absent Days ({selectedTeacher.absentDates.length}):
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '85px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {selectedTeacher.absentDates.map((date, i) => (
                                            <span key={i} style={{ background: '#fdf3f2', color: '#e74c3c', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', border: '1px solid #fadbd8', fontWeight: '500' }}>
                                                {date}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop: '10px' }}>
                                    🌟 Perfect attendance so far!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Monthly Log Section */}
                    <div style={{ marginTop: '20px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <h5 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>📅 Detailed Monthly Log</h5>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 1 }}>
                                    <tr>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#666' }}>Date</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#666' }}>Status</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#666' }}>In Time</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#666' }}>Out Time</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd', color: '#666' }}>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedTeacher.monthlyLog && selectedTeacher.monthlyLog.length > 0 ? (
                                        selectedTeacher.monthlyLog.map((log, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '10px', color: '#444', fontWeight: '500' }}>{log.date}</td>
                                                <td style={{ padding: '10px' }}>
                                                    {log.status === 'Present' && <span style={{ background: '#e8f8f5', color: '#16a085', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Present</span>}
                                                    {log.status === 'Absent' && <span style={{ background: '#fdf3f2', color: '#e74c3c', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Absent</span>}
                                                    {log.status === 'Sunday' && <span style={{ background: '#fcf3cf', color: '#d4ac0d', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Sunday</span>}
                                                    {log.status === 'Late' && <span style={{ background: '#fef5e7', color: '#e67e22', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Late</span>}
                                                </td>
                                                <td style={{ padding: '10px', color: '#666' }}>{log.inTime}</td>
                                                <td style={{ padding: '10px', color: '#666' }}>{log.outTime}</td>
                                                <td style={{ padding: '10px', color: '#666', fontWeight: '500' }}>
                                                    {log.workingHours !== '--' ? `⏱ ${log.workingHours}` : '--'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                                                No attendance logs available for this month yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Simulator = () => {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [direction, setDirection] = useState('in');
    const [verifyMode, setVerifyMode] = useState('1'); // 1 = Fingerprint, 15 = Face
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    const [result, setResult] = useState(null);
    useEffect(() => { api.get('/users').then(res => { setUsers(res.data); if (res.data.length) setSelected(res.data[0]); }); }, []);
    const simulate = async () => {
        if (!selected) return;
        const now = new Date(); const [h, m, s] = time.split(':').map(Number); now.setHours(h, m, s || 0);
        try {
            const res = await api.post('/biometric/webhook', {
                fingerprint_id: selected.fingerprint_id,
                timestamp: now.toISOString(),
                direction,
                verifyMode
            });
            setResult({ success: true, msg: `✅ ${selected.name} marked ${direction === 'in' ? 'IN' : 'OUT'} via ${verifyMode === '15' ? 'Face Scan' : 'Fingerprint'} at ${time}`, data: res.data });
        } catch (err) { setResult({ success: false, msg: `❌ Error: ${err.response?.data?.error || err.message}` }); }
    };
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center' }}>🔍 Biometric Simulator</h2>
            <select style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }} onChange={(e) => setSelected(users.find(u => u.id === parseInt(e.target.value)))}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Verify Mode: </label>
                <label style={{ marginRight: '15px' }}><input type="radio" value="1" checked={verifyMode === '1'} onChange={() => setVerifyMode('1')} /> 👆 Fingerprint</label>
                <label><input type="radio" value="15" checked={verifyMode === '15'} onChange={() => setVerifyMode('15')} /> 👤 Face Scan</label>
            </div>
            <div style={{ marginBottom: '15px' }}><label>Direction: </label><input type="radio" value="in" checked={direction === 'in'} onChange={() => setDirection('in')} /> IN <input type="radio" value="out" checked={direction === 'out'} onChange={() => setDirection('out')} /> OUT</div>
            <input type="time" step="1" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd' }} />
            <button onClick={simulate} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#667eea', color: 'white', fontSize: '16px', cursor: 'pointer' }}>🖐️ Simulate Scan</button>
            {result && <div style={{ marginTop: '15px', padding: '15px', borderRadius: '6px', background: result.success ? '#d4edda' : '#f8d7da', color: result.success ? '#155724' : '#721c24' }}>{result.msg}</div>}
        </div>
    );
};

const EnrollStudentPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', aadhar: '', enquiryDate: new Date().toISOString().split('T')[0], gender: 'Male', dob: '', email: '', fingerprint_id: '', address: '',
        fatherContact: '', motherContact: '', studentContact: '',
        branch: '', course: '', batchTiming: '',
        previousSchool: '', tenthPercent: '', twelfthPercent: '',
        bankName: '', accountNumber: '', ifscCode: '', accountHolder: '',
        amountReceived: '', paymentMode: '', installment: 'No', totalFee: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const getStepProgressWidth = () => {
        if (step === 1) return '0%';
        if (step === 2) return '33%';
        if (step === 3) return '66%';
        if (step === 4) return '100%';
        return '0%';
    };

    const numberToWords = (num) => {
        const nStr = num ? num.toString() : '0';
        const nNum = parseInt(nStr, 10);
        if (isNaN(nNum) || nNum === 0) return 'Zero';
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        if (nStr.length > 9) return 'overflow';
        const n = ('000000000' + nStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return 'Zero';
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim() + ' Only';
    };

    const netFee = parseInt(formData.totalFee) || 0;
    const receivedNum = parseInt(formData.amountReceived) || 0;
    const dueFees = Math.max(0, netFee - receivedNum);
    const amountWords = receivedNum ? numberToWords(receivedNum) : 'Zero';

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let receiptNo = null;
            if (receivedNum > 0) {
                const recRes = await api.post('/receipts/generate', {
                    studentName: formData.name,
                    courseName: formData.course,
                    amountReceived: receivedNum,
                    paymentMode: formData.paymentMode
                });
                receiptNo = recRes.data.receiptNo;
            }

            const payload = {
                ...formData,
                role: 'student',
                fee: netFee,
                dueFees,
                amountReceivedWords: amountWords,
                receiptNo
            };
            const res = await api.post('/users/enroll', payload);

            if (receiptNo) {
                alert("Student Enrollment Successful! Receipt No generated: " + receiptNo);
            } else {
                alert('Student Enrollment Successful!');
            }
            window.location.href = '/admissions';
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', minHeight: '600px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '50px' }}>
                <span style={{ marginRight: '8px' }}>👤+</span> Enroll Student
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', left: '12%', right: '12%', height: '2px', background: '#e0e0e0', zIndex: 1 }}>
                    <div style={{ width: getStepProgressWidth(), height: '100%', background: '#8b5cf6', transition: 'width 0.3s' }}></div>
                </div>

                {[
                    { id: 1, title: 'Basic Details', desc: 'Setup Basic Details' },
                    { id: 2, title: 'Class Details', desc: 'Setup Class Details' },
                    { id: 3, title: 'Academic Details', desc: 'Setup Academic Details' },
                    { id: 4, title: 'Banking Details', desc: 'Setup Banking Details' }
                ].map((s) => (
                    <div key={s.id} onClick={() => setStep(s.id)} style={{ textAlign: 'center', position: 'relative', zIndex: 2, background: 'white', padding: '0 10px', flex: 1, cursor: 'pointer' }}>
                        <div style={{
                            width: step === s.id ? '20px' : '24px',
                            height: step === s.id ? '20px' : '24px',
                            borderRadius: '50%',
                            border: step >= s.id ? '6px solid #8b5cf6' : '2px solid #e0e0e0',
                            background: 'white',
                            margin: step === s.id ? '0 auto 10px' : '4px auto 10px',
                            transition: 'all 0.3s'
                        }}></div>
                        <div style={{ fontWeight: 'bold', color: step >= s.id ? '#555' : '#888', marginTop: '10px' }}>{s.title}</div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>{s.desc}</div>
                    </div>
                ))}
            </div>

            {step === 1 && (
                <div>
                    <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px' }}>
                        👤 Basic Detail
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '10px' }}>
                        <div>
                            <input type="text" name="name" value={formData.name} onChange={handleInput} placeholder="Student Name*" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555' }} />
                        </div>
                        <div>
                            <input type="text" name="aadhar" value={formData.aadhar} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 12); handleInput(e); }} placeholder="Aadhar Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Enquiry Date*</label>
                            <input type="date" name="enquiryDate" value={formData.enquiryDate} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555' }} />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Transgender</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#999' }} />
                        </div>
                        <div>
                            <input type="email" name="email" value={formData.email} onChange={handleInput} placeholder="Email Id" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="fingerprint_id" value={formData.fingerprint_id} onChange={handleInput} placeholder="Biometric Registration No." style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>

                        <div>
                            <input type="text" name="fatherContact" value={formData.fatherContact} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); handleInput(e); }} placeholder="Father Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="motherContact" value={formData.motherContact} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); handleInput(e); }} placeholder="Mother Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="studentContact" value={formData.studentContact} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); handleInput(e); }} placeholder="Student Contact Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <textarea name="address" value={formData.address} onChange={handleInput} placeholder="Full Residential Address" rows="3" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', resize: 'vertical' }}></textarea>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px' }}>
                        📚 Class Detail
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '10px' }}>
                        <div>
                            <select name="branch" value={formData.branch} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
                                <option value="" disabled>Select Branch</option>
                                <option>Nashik Main</option>
                            </select>
                        </div>
                        <div>
                            <select name="course" value={formData.course} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
                                <option value="" disabled>Select Course</option>
                                <option>Staff Selection Commission (SSC-CGL)</option>
                                <option>POLICE/ARMY/MILITARY TRAINING BATCH</option>
                                <option>XI - Science PCMB [JEE-NEET-CET]</option>
                                <option>XII - Science PCMB [JEE-NEET-CET]</option>
                                <option>UPSC - Civil Services Examination</option>
                                <option>UGC NET/ MH SET/ CSIR NET</option>
                                <option>MBA Entrance (CAT/MAT/MH CET)</option>
                                <option>MPSC - State Services Examination</option>
                                <option>Maharashtra Engineering Services (MES)</option>
                                <option>Banking [RBI/SBI/NABARD/SSC/IBPS]</option>
                                <option>MPSC (Group B & C)</option>
                                <option>RRB-NTPC</option>
                            </select>
                        </div>
                        <div>
                            <input type="text" name="batchTiming" value={formData.batchTiming} onChange={handleInput} placeholder="Batch Timing" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px' }}>
                        🎓 Academic Detail
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '10px' }}>
                        <div>
                            <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInput} placeholder="Previous School/College Name" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="number" name="tenthPercent" value={formData.tenthPercent} onChange={handleInput} placeholder="10th Percentage" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="number" name="twelfthPercent" value={formData.twelfthPercent} onChange={handleInput} placeholder="12th Percentage" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#8b5cf6', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px' }}>
                        🏦 Banking Detail
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '10px' }}>
                        <div>
                            <input type="text" name="bankName" value={formData.bankName} onChange={handleInput} placeholder="Bank Name" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="accountNumber" value={formData.accountNumber} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); handleInput(e); }} placeholder="Account Number" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInput} placeholder="IFSC Code" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                        <div>
                            <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleInput} placeholder="Account Holder Name" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '25px' }}>
                        <div style={{ fontWeight: 'bold', color: '#555', marginBottom: '15px' }}>Fees & Payment Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
                            <div>
                                <input type="number" name="totalFee" value={formData.totalFee} onChange={handleInput} placeholder="Total Fee (₹)" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                            </div>
                            <div>
                                <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleInput} placeholder="Amount Received (₹)" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none' }} />
                            </div>
                            <div>
                                <input type="text" value={dueFees} readOnly placeholder="Due Fees (₹)" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', background: '#f8f9fa' }} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Payment Mode</label>
                                <select name="paymentMode" value={formData.paymentMode} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
                                    <option value="" disabled>Select Payment Mode</option>
                                    <option>Cash</option>
                                    <option>Online</option>
                                    <option>Net Banking</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <label style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 5px', fontSize: '12px', color: '#666' }}>Installment</label>
                                <select name="installment" value={formData.installment} onChange={handleInput} style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', color: '#555', appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>") no-repeat right 10px center' }}>
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <input type="text" value={amountWords} readOnly placeholder="Amount Received In Words" style={{ width: '100%', padding: '14px', border: '1px solid #e0e0e0', borderRadius: '6px', outline: 'none', background: '#f8f9fa' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} style={{ padding: '12px 24px', marginRight: '15px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', color: '#555', fontWeight: 'bold' }}>
                        Previous
                    </button>
                )}
                {step < 4 && (
                    <button onClick={() => setStep(step + 1)} style={{ padding: '12px 24px', background: '#8b5cf6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)' }}>
                        Next Step
                    </button>
                )}
                {step === 4 && (
                    <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 24px', background: '#27ae60', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(39, 174, 96, 0.2)' }}>
                        {loading ? 'Enrolling...' : 'Enroll Student'}
                    </button>
                )}
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
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState(null);
    const [syncStatus, setSyncStatus] = useState({});
    const toastTimerRef = React.useRef(null);

    const resolvedName = (scan) => {
        const user = users.find(u => String(u.id) === String(scan.userId) || String(u.fingerprint_id) === String(scan.userId));
        return user ? user.name : (scan.userName || `User ${scan.userId}`);
    };

    const resolvedPhoto = (scan) => {
        let photo = null;
        if (scan.userPhoto) {
            photo = scan.userPhoto;
        } else {
            const user = users.find(u => String(u.id) === String(scan.userId) || String(u.fingerprint_id) === String(scan.userId));
            photo = user ? user.photo : null;
        }
        if (photo) {
            if (photo.startsWith('http')) return photo;
            return `http://${backendHost}:8080${photo}`;
        }
        return null;
    };

    const isFaceScan = (scan) => String(scan.verifyMode) === '15';

    const handleSyncUsers = (serialNumber) => {
        setSyncStatus(prev => ({ ...prev, [serialNumber]: 'Syncing...' }));
        api.post('/devices/sync-users', { serialNumber })
            .then(res => {
                setSyncStatus(prev => ({ ...prev, [serialNumber]: 'Command Queued!' }));
                setTimeout(() => {
                    setSyncStatus(prev => ({ ...prev, [serialNumber]: null }));
                }, 5000);
            })
            .catch(err => {
                setSyncStatus(prev => ({ ...prev, [serialNumber]: 'Failed' }));
                setTimeout(() => {
                    setSyncStatus(prev => ({ ...prev, [serialNumber]: null }));
                }, 5000);
                console.error(err);
            });
    };

    const handleSyncPhotos = (serialNumber) => {
        setSyncStatus(prev => ({ ...prev, [serialNumber + '_photo']: 'Syncing...' }));
        api.post('/devices/sync-photos', { serialNumber })
            .then(res => {
                setSyncStatus(prev => ({ ...prev, [serialNumber + '_photo']: 'Command Queued!' }));
                setTimeout(() => {
                    setSyncStatus(prev => ({ ...prev, [serialNumber + '_photo']: null }));
                }, 5000);
            })
            .catch(err => {
                setSyncStatus(prev => ({ ...prev, [serialNumber + '_photo']: 'Failed' }));
                setTimeout(() => {
                    setSyncStatus(prev => ({ ...prev, [serialNumber + '_photo']: null }));
                }, 5000);
                console.error(err);
            });
    };

    const handleRegisterUser = (e) => {
        e.preventDefault();
        if (!registeringUserName.trim() || !registeringUserId) return;
        api.post('/users', {
            id: registeringUserId,
            name: registeringUserName,
            role: registeringUserRole || 'student',
            fingerprint_id: String(registeringUserId)
        })
            .then(() => {
                // Refresh userMap
                api.get('/users/map').then(res => setUserMap(res.data)).catch(() => { });
                setRegisteringUserId(null);
                setRegisteringUserName('');
            })
            .catch(err => console.error(err));
    };

    const fetchDevices = () => {
        setLoading(true);
        api.get('/devices')
            .then(res => { setDevices(res.data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    };

    useEffect(() => {
        fetchDevices();

        // Fetch server LAN IP info
        api.get('/info').then(res => setServerIp(res.data.ip)).catch(() => { });

        // Load users list
        api.get('/users').then(res => setUsers(res.data)).catch(() => { });

        // Load user ID → name map
        api.get('/users/map').then(res => setUserMap(res.data)).catch(() => { });

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

        const handleLivePunchPhoto = (data) => {
            setLiveScans(prev => prev.map(s => {
                if (String(s.userId) === String(data.userId)) {
                    return { ...s, userPhoto: data.userPhoto };
                }
                return s;
            }));

            setToast(prev => {
                if (prev && String(prev.userId) === String(data.userId)) {
                    return { ...prev, userPhoto: data.userPhoto };
                }
                return prev;
            });

            setUsers(prev => prev.map(u => {
                if (String(u.id) === String(data.userId) || String(u.fingerprint_id) === String(data.userId)) {
                    return { ...u, photo: data.userPhoto };
                }
                return u;
            }));
        };

        socket.on('live_punch', handleLivePunch);
        socket.on('live_punch_photo', handleLivePunchPhoto);
        return () => {
            socket.off('live_punch', handleLivePunch);
            socket.off('live_punch_photo', handleLivePunchPhoto);
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

    const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

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
                        color: 'white', fontWeight: '800', fontSize: '16px', flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {resolvedPhoto(toast) ? (
                            <img src={resolvedPhoto(toast)} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            isFaceScan(toast) ? '👤' : '👆'
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: '#a0a8c0', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                            🔴 {isFaceScan(toast) ? 'Live Face Scan Detected' : 'Live Fingerprint Scan Detected'}
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
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '4px 10px', fontSize: '13px', background: '#3498db', border: 'none', marginRight: '8px' }}
                                            disabled={syncStatus[device.serialNumber]}
                                            onClick={() => handleSyncUsers(device.serialNumber)}
                                        >
                                            {syncStatus[device.serialNumber] || '📥 Sync Names'}
                                        </button>
                                        <button
                                            className="btn btn-success"
                                            style={{ padding: '4px 10px', fontSize: '13px', background: '#27ae60', border: 'none' }}
                                            disabled={syncStatus[device.serialNumber + '_photo']}
                                            onClick={() => handleSyncPhotos(device.serialNumber)}
                                        >
                                            {syncStatus[device.serialNumber + '_photo'] || '📸 Sync Photos'}
                                        </button>
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
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑/👆</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
                            Waiting for biometric scan...
                        </div>
                        <div style={{ fontSize: '14px', color: '#888' }}>
                            Ask someone to scan their face or fingerprint on the <strong>eSSL Device</strong>.<br />
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
                                            color: 'white', fontWeight: '800', fontSize: '15px', flexShrink: 0,
                                            overflow: 'hidden'
                                        }}>
                                            {resolvedPhoto(scan) ? (
                                                <img src={resolvedPhoto(scan)} alt="Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                isFaceScan(scan) ? '👤' : '👆'
                                            )}
                                        </div>
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


const BirthdaysPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/users').then(res => {
            setUsers(res.data);
        }).catch(err => console.error(err));
    }, []);

    const today = new Date();

    const upcomingBirthdays = users.filter(u => {
        if (!u.dob) return false;
        const dob = new Date(u.dob);
        if (isNaN(dob)) return false;

        // Check if birthday is coming up in next 30 days
        const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        const nextYearBday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());

        // Use whichever is closest in the future or today
        let bday = thisYearBday;
        if (thisYearBday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            bday = nextYearBday;
        }

        const diffTime = bday - new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        u.daysUntil = diffDays;
        u.ageTurning = bday.getFullYear() - dob.getFullYear();
        return diffDays >= 0 && diffDays <= 30;
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    return (
        <div className="dashboard-card">
            <div className="card-header">
                <h2>🎂 Upcoming Birthdays (Next 30 Days)</h2>
            </div>
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Date of Birth</th>
                        <th>Turning Age</th>
                        <th>Countdown</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {upcomingBirthdays.map((u, idx) => (
                        <tr key={u.id || idx}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="avatar" style={{ background: u.daysUntil === 0 ? '#e74c3c' : '#f39c12' }}>{u.name.charAt(0)}</div>
                                    {u.name}
                                </div>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                            <td>{new Date(u.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                            <td>{u.ageTurning} years</td>
                            <td>
                                {u.daysUntil === 0 ? <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>🎉 TODAY!</span> :
                                    u.daysUntil === 1 ? <span style={{ color: '#f39c12', fontWeight: 'bold' }}>Tomorrow</span> :
                                        `${u.daysUntil} days`}
                            </td>
                            <td>
                                <button className="btn btn-primary" style={{ padding: '4px 10px', background: '#e74c3c', borderColor: '#e74c3c' }}>✉️ Send Wish</button>
                            </td>
                        </tr>
                    ))}
                    {upcomingBirthdays.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No upcoming birthdays found in the next 30 days.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- MAIN APP ---
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    let initialUser = null;
    try { initialUser = JSON.parse(localStorage.getItem('user')); } catch (e) { }
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
                        <Route path="/enroll-student" element={<ProtectedRoute><Layout logout={logout} user={user}><EnrollStudentPage /></Layout></ProtectedRoute>} />
                        <Route path="/birthdays" element={<ProtectedRoute><Layout logout={logout} user={user}><BirthdaysPage /></Layout></ProtectedRoute>} />
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
