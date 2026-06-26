const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

// 1. Local DB functions
content = content.replace(/<<<<<<< Updated upstream\r?\n=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1');

// 2. Schema photo fields
content = content.replace(/<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1$2');

// 3. seedUsers logic
content = content.replace(/<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1$2');

// 4. fallbackNames vs userPhoto
content = content.replace(/<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1$2');

// 5. photoUrl vs userPhoto in ATTLOG
content = content.replace(/<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, `              photoUrl = dbUser.photoUrl || '';
              userPhoto = dbUser.photo;
            }
          } catch (e) { /* ignore */ }
        } else {
          const localUsers = getLocalUsers();
          const dbUser = localUsers.find(u => u.id === parseInt(userId) || String(u.id) === String(userId) || u.fingerprint_id === String(userId));
          if (dbUser) {
            userName = dbUser.name;
            userPhoto = dbUser.photo;
            photoUrl = dbUser.photoUrl || '';
          } else {
            userName = fallbackNames[userId] || fallbackNames[String(parseInt(userId))] || \`User \${userId}\`;
          }
`);

// 6. POST /api/users
content = content.replace(/<<<<<<< Updated upstream\r?\n=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1');

// 7. io.emit live_punch in webhook
content = content.replace(/<<<<<<< Updated upstream\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$2');

// 8. sync-users APIs
content = content.replace(/<<<<<<< Updated upstream\r?\n=======\r?\n([\s\S]*?)>>>>>>> Stashed changes\r?\n/, '$1');

fs.writeFileSync('backend/server.js', content);
console.log("Resolved");
