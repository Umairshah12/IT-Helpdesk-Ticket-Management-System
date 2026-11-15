const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   HELPDESK PRO – ENTERPRISE ITSM PLATFORM        ');
console.log('\x1b[36m%s\x1b[0m', '   Starting Backend (Port 5000) & Frontend (5173)');
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

// 1. Spawn Backend
const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' },
});

// 2. Spawn Frontend
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\nShutting down Helpdesk Pro servers...');
  if (isWindows) {
    if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
    if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
  } else {
    backend.kill();
    frontend.kill();
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Backend process exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Frontend process exited with code ${code}`);
  }
});
