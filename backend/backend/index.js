const express = require('express');
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Map to store sockets by phone number (for demo)
const sockets = new Map();

app.post('/pair', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send("Missing phone");

  if (sockets.has(phone)) {
    return res.json({ pairingCode: 'Already paired or pairing...' });
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`auth_${phone}`);
    const sock = makeWASocket({ auth: state });
    sockets.set(phone, sock);

    sock.ev.on('connection.update', (update) => {
      if (update.qr) {
        res.json({ pairingCode: update.qr });
      }
      if (update.connection === 'open') {
        saveCreds();
        console.log(`Paired with ${phone}`);
      }
    });

    sock.ev.on('creds.update', saveCreds);
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to pair");
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const targetPath = path.join(__dirname, '..', 'frontend', 'assets', 'uploaded.jpg');

  fs.rename(req.file.path, targetPath, (err) => {
    if (err) return res.status(500).send("Error saving image");
    res.json({ message: "Image uploaded", path: '/assets/uploaded.jpg' });
  });
});

app.post('/setdp', express.json(), async (req, res) => {
  const { phone } = req.body;
  if (!phone || !sockets.has(phone)) {
    return res.status(400).send("Phone not paired");
  }
  const sock = sockets.get(phone);

  const imagePath = path.join(__dirname, '..', 'frontend', 'assets', 'uploaded.jpg');
  if (!fs.existsSync(imagePath)) {
    return res.status(400).send("No uploaded image found");
  }
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    await sock.updateProfilePicture('me', imageBuffer);
    res.json({ message: "Profile picture updated" });
  } catch (e) {
    console.error(e);
    res.status(500).send("Failed to update profile picture");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
