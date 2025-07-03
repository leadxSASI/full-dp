const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const upload = multer({ dest: 'uploads/' });
const sockets = new Map();

app.post('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send("Missing phone");

  if (sockets.has(phone)) return res.json({ pairingCode: 'Already pairing' });

  const { state, saveCreds } = await useMultiFileAuthState(`auth_${phone}`);
  const sock = makeWASocket({ auth: state });
  sockets.set(phone, sock);

  sock.ev.on('connection.update', (update) => {
    if (update.pairingCode) {
      return res.json({ pairingCode: update.pairingCode });
    }
    if (update.connection === 'open') {
      console.log(`✅ Paired with ${phone}`);
      saveCreds();
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

app.post('/upload', upload.single('image'), (req, res) => {
  const target = path.join(__dirname, '../frontend/assets/uploaded.jpg');
  fs.renameSync(req.file.path, target);
  res.json({ path: '/assets/uploaded.jpg' });
});

app.post('/setdp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !sockets.has(phone)) return res.status(400).send("Invalid");

  const sock = sockets.get(phone);
  const imagePath = path.join(__dirname, '../frontend/assets/uploaded.jpg');
  if (!fs.existsSync(imagePath)) return res.status(404).send("Image missing");

  try {
    const buffer = fs.readFileSync(imagePath);
    await sock.updateProfilePicture('me', buffer);
    res.json({ message: "✅ DP Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to update DP");
  }
});

app.listen(PORT, () => console.log(`🌐 Backend running at http://localhost:${PORT}`));const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const upload = multer({ dest: 'uploads/' });
const sockets = new Map();

app.post('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send("Missing phone");

  if (sockets.has(phone)) return res.json({ pairingCode: 'Already pairing' });

  const { state, saveCreds } = await useMultiFileAuthState(`auth_${phone}`);
  const sock = makeWASocket({ auth: state });
  sockets.set(phone, sock);

  sock.ev.on('connection.update', (update) => {
    if (update.pairingCode) {
      return res.json({ pairingCode: update.pairingCode });
    }
    if (update.connection === 'open') {
      console.log(`✅ Paired with ${phone}`);
      saveCreds();
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

app.post('/upload', upload.single('image'), (req, res) => {
  const target = path.join(__dirname, '../frontend/assets/uploaded.jpg');
  fs.renameSync(req.file.path, target);
  res.json({ path: '/assets/uploaded.jpg' });
});

app.post('/setdp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !sockets.has(phone)) return res.status(400).send("Invalid");

  const sock = sockets.get(phone);
  const imagePath = path.join(__dirname, '../frontend/assets/uploaded.jpg');
  if (!fs.existsSync(imagePath)) return res.status(404).send("Image missing");

  try {
    const buffer = fs.readFileSync(imagePath);
    await sock.updateProfilePicture('me', buffer);
    res.json({ message: "✅ DP Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to update DP");
  }
});

app.listen(PORT, () => console.log(`🌐 Backend running at http://localhost:${PORT}`));
