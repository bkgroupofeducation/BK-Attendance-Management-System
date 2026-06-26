const fs = require('fs');

// 1. Fix backend server.js
let serverFile = 'backend/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

content = content.replace(
  /await User\.insertMany\([\s\S]*?\]\);/g,
  `console.log('Skipping fake user seeding. Clean database ready.');`
);

content = content.replace(
  /const fallbackNames = \{[\s\S]*?\};/g,
  `const fallbackNames = {};`
);

const dashboardRegex = /const todayAttendPercent = [^;]+;[\s\S]*?res\.json\(\{\s*stats: \{\s*totalUsers,\s*todayAttend:[^}]+\},\s*recentAttendance: \[\]\s*\}\);\s*\} catch \(err\) \{/g;

content = content.replace(dashboardRegex, `const todayAttendPercent = totalUsers > 0 ? Math.round((todayAttendCount / totalUsers) * 100) : 0;

    const todayPunches = await Punch.find({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ timestamp: 1 });
    
    const userGroups = {};
    for (const p of todayPunches) {
      if (!userGroups[p.userId]) userGroups[p.userId] = { inTime: p.timestamp, outTime: null, name: p.userName, photo: p.userPhoto };
      userGroups[p.userId].outTime = p.timestamp;
    }

    const recentAttendance = [];
    for (const uid of Object.keys(userGroups)) {
      const inTimeStr = userGroups[uid].inTime ? new Date(userGroups[uid].inTime).toLocaleTimeString('en-IN') : '--:-- --';
      const outTimeStr = userGroups[uid].outTime && userGroups[uid].outTime.getTime() !== userGroups[uid].inTime.getTime() 
        ? new Date(userGroups[uid].outTime).toLocaleTimeString('en-IN') 
        : '--:-- --';
      
      let dbUser = await User.findOne({ id: parseInt(uid) }) || await User.findOne({ fingerprint_id: String(uid) });
      
      recentAttendance.push({
        userId: uid,
        name: dbUser ? dbUser.name : (userGroups[uid].name || \`User \${uid}\`),
        role: dbUser ? dbUser.role : 'Unknown',
        photo: dbUser ? dbUser.photo : (userGroups[uid].photo || null),
        inTime: inTimeStr,
        outTime: outTimeStr,
        status: 'Present'
      });
    }

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
  } catch (err) {`);

fs.writeFileSync(serverFile, content);
console.log('Fixed backend server.js');

// 2. Fix frontend App.js
let appFile = 'frontend/src/App.js';
let appContent = fs.readFileSync(appFile, 'utf8');

const tableRegex = /<tbody id="attendanceTable">[\s\S]*?<\/tbody>/;
const dynamicTable = `<tbody id="attendanceTable">
                    {recent.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No attendance records yet today. Waiting for machine sync...</td></tr>
                    ) : recent.map((r, i) => (
                      <tr key={i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {r.photo ? (
                                <img src={r.photo.startsWith('http') ? r.photo : \`http://\${backendHost}:8080\${r.photo}\`} alt="Face" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
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
                </tbody>`;

appContent = appContent.replace(tableRegex, dynamicTable);
fs.writeFileSync(appFile, appContent);
console.log('Fixed frontend App.js');

// 3. Clear JSON DBs
fs.writeFileSync('backend/users.json', '[]');
fs.writeFileSync('backend/punches.json', '[]');
console.log('Cleared local JSON databases.');

// 4. Wipe MongoDB
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
