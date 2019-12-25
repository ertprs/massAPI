const { exec } = require('child_process');

exec('stripe listen --forward-to localhost:1337/webhook', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});