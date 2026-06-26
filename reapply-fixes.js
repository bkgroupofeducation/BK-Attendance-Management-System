const fs = require('fs');

let appFile = 'frontend/src/App.js';
let appContent = fs.readFileSync(appFile, 'utf8');

// Fix users in Dashboard
appContent = appContent.replace(
  `const [userMap, setUserMap] = useState({});`,
  `const [users, setUsers] = useState([]);`
);

appContent = appContent.replace(
  `api.get('/users/map').then(res => setUserMap(res.data)).catch(() => {});`,
  `api.get('/users').then(res => setUsers(res.data)).catch(() => {});`
);

// Remove setPunches from Dashboard handlePunchPhoto
const setPunchesRegex = /setPunches\(prev => prev\.map\(p => \{\s*if \(String\(p\.userId\) === String\(data\.userId\)\) \{\s*return \{ \.\.\.p, userPhoto: data\.userPhoto \};\s*\}\s*return p;\s*\}\)\);/g;
appContent = appContent.replace(setPunchesRegex, '');

fs.writeFileSync(appFile, appContent);
console.log('Fixed users and setPunches in App.js');
