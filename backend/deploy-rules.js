const { exec } = require('child_process');
const path = require('path');

const rulesPath = path.join(__dirname, 'firestore.rules');

exec(`firebase deploy --only firestore:rules`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error deploying rules: ${error}`);
    return;
  }
  console.log(`Rules deployed successfully:\n${stdout}`);
}); 