const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.js', 'utf8');

const parts = content.split(/<<<<<<< Updated upstream\r?\n/);
let result = parts[0];

for (let i = 1; i < parts.length; i++) {
  const stashedSplit = parts[i].split(/=======\r?\n/);
  const upstream = stashedSplit[0];
  const rest = stashedSplit[1];
  
  const restSplit = rest.split(/>>>>>>> Stashed changes\r?\n/);
  const stashed = restSplit[0];
  const after = restSplit[1];

  // We want to keep the Stashed changes for frontend
  result += stashed + after;
}

fs.writeFileSync('frontend/src/App.js', result);
console.log('App.js resolved successfully');
