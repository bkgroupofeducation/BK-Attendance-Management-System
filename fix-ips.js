const fs = require('fs');

// Fix api.js
let apiFile = 'frontend/src/api.js';
let apiContent = fs.readFileSync(apiFile, 'utf8');
apiContent = apiContent.replace(
  /const backendHost = '.*?';/,
  `const backendHost = window.location.hostname;`
);
fs.writeFileSync(apiFile, apiContent);

// Fix App.js
let appFile = 'frontend/src/App.js';
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = appContent.replace(
  /const backendHost = '.*?';/,
  `const backendHost = window.location.hostname;`
);
fs.writeFileSync(appFile, appContent);

console.log('Fixed IP to window.location.hostname');
