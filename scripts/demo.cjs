const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { randomBytes, createHash } = require('node:crypto');
const { spawn, execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.demo');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const mongoPort = 27117;
const mongoUri = `mongodb://127.0.0.1:${mongoPort}/learning-platform-demo?replicaSet=collegeDemo`;

function install(directory) {
  const cwd = path.join(root, directory);
  const fingerprint = createHash('sha256').update(fs.readFileSync(path.join(cwd, 'package-lock.json'))).digest('hex');
  const stamp = path.join(local, directory + '-dependencies');
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  if (!fs.existsSync(path.join(cwd, 'node_modules')) || !fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8') !== fingerprint) {
    console.log(`Installing ${directory} dependencies (first run or updated branch)...`);
    execFileSync(process.execPath, [npmCli, 'ci', '--no-audit', '--no-fund'], { cwd, stdio: 'inherit' });
    fs.writeFileSync(stamp, fingerprint);
  }
  console.log(`Building ${directory}...`);
  execFileSync(process.execPath, [npmCli, 'run', 'build'], {
    cwd, stdio: 'inherit', env: { ...process.env, VITE_API_URL: '/api' },
  });
}

async function isListening(port) {
  return new Promise(resolve => {
    const socket = net.connect(port, '127.0.0.1');
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

async function startMongo(executable, children) {
  if (await isListening(mongoPort)) throw Error(`Port ${mongoPort} is already in use. Close the other demo window first.`);
  const dbpath = path.join(local, 'database');
  fs.mkdirSync(dbpath, { recursive: true });
  const child = spawn(executable, ['--dbpath', dbpath, '--port', String(mongoPort), '--bind_ip', '127.0.0.1',
    '--replSet', 'collegeDemo', '--logpath', path.join(local, 'mongodb.log'), '--logappend'], { windowsHide: true, stdio: 'ignore' });
  children.push(child);
  let launchError;
  child.on('error', error => { launchError = error; });
  for (let n = 0; n < 90; n++) {
    if (launchError || child.exitCode !== null) throw Error('MongoDB could not start. See .demo/mongodb.log. If Windows reports a missing DLL, install Microsoft Visual C++ 2015-2022 Redistributable (x64).');
    if (await isListening(mongoPort)) return;
    await sleep(500);
  }
  throw Error('MongoDB startup timed out. Check .demo/mongodb.log.');
}

async function prepareDatabase() {
  const { MongoClient } = require('../server/node_modules/mongodb');
  const direct = new MongoClient(`mongodb://127.0.0.1:${mongoPort}/?directConnection=true`, { serverSelectionTimeoutMS: 1000 });
  try {
    await direct.connect();
    const admin = direct.db('admin');
    try { await admin.command({ replSetGetStatus: 1 }); }
    catch (error) {
      if (error.codeName !== 'NotYetInitialized') throw error;
      await admin.command({ replSetInitiate: { _id: 'collegeDemo', members: [{ _id: 0, host: `127.0.0.1:${mongoPort}` }] } });
    }
    for (let n = 0; n < 60; n++) {
      if ((await admin.command({ hello: 1 })).isWritablePrimary) return;
      await sleep(500);
    }
    throw Error('MongoDB did not become ready for transactions.');
  } finally { await direct.close(); }
}

function sessionSecret() {
  const file = path.join(local, 'session-secret');
  if (!fs.existsSync(file)) fs.writeFileSync(file, randomBytes(48).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(file, 'utf8');
}

async function main() {
  fs.mkdirSync(local, { recursive: true });
  const children = [];
  const stop = () => { for (const child of children) { if (child.exitCode === null) child.kill(); } };
  process.on('SIGINT', () => { stop(); process.exit(0); });
  process.on('SIGTERM', () => { stop(); process.exit(0); });
  process.on('exit', stop);
  try {
    if (await isListening(mongoPort)) throw Error('The demo database port is busy. Close the other demo window before starting again.');
    install('server');
    install('client');
    await startMongo(process.argv[2], children);
    await prepareDatabase();
    process.env.MONGODB_URI = mongoUri;
    const { seedDemo } = require('../server/dist/demo/seed');
    const accountsFile = path.join(local, 'accounts.json');
    if (!fs.existsSync(accountsFile)) fs.writeFileSync(accountsFile, JSON.stringify({
      saif: randomBytes(12).toString('base64url'), maaly: randomBytes(12).toString('base64url'),
    }), { mode: 0o600 });
    const credentials = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
    await seedDemo(mongoUri, credentials);
    const loginDetails = path.join(local, 'Login details.txt');
    fs.writeFileSync(loginDetails, `Saif\r\nEmail: saif@demo.example.test\r\nPassword: ${credentials.saif}\r\n\r\nMaaly\r\nEmail: maaly@demo.example.test\r\nPassword: ${credentials.maaly}\r\n`, { mode: 0o600 });
    let port = 5000;
    while (await isListening(port)) { if (++port > 5010) throw Error('No free application port from 5000 to 5010.'); }
    const server = spawn(process.execPath, ['dist/server.js'], { cwd: path.join(root, 'server'), windowsHide: true, stdio: 'inherit',
      env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', SESSION_SECRET: sessionSecret(), NODE_ENV: 'development', SERVE_CLIENT: 'true' } });
    children.push(server);
    const url = `http://127.0.0.1:${port}`;
    for (let n = 0; n < 60; n++) {
      if (server.exitCode !== null) throw Error('The application server stopped unexpectedly.');
      try { if ((await fetch(url + '/health')).ok) {
        console.log(`\nReady: ${url}\nYour sign-in details are in .demo/Login details.txt.\nKeep this window open. Press Ctrl+C here to stop the app and database.\n`);
        if (!process.env.DEMO_NO_BROWSER) {
          spawn('notepad.exe', [loginDetails], { windowsHide: true, stdio: 'ignore' });
          spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { windowsHide: true, stdio: 'ignore' });
        }
        await new Promise(resolve => server.once('exit', resolve));
        return;
      } } catch { /* The server may still be connecting to MongoDB. */ }
      await sleep(500);
    }
    throw Error('The app did not become ready in time.');
  } finally { stop(); }
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { mongoUri, isListening };
