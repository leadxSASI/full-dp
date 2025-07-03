# 🟢 Levanter WhatsApp DP Uploader

Generate and set a full-screen TikTok-style WhatsApp profile picture using Puppeteer & WhatsApp Web.

👉 Upload an image  
👉 Generate QR pairing code  
👉 Automatically set WhatsApp DP (without cropping)  

---

## ⚡ Features

- ✅ Upload TikTok-size vertical photo
- ✅ Link to WhatsApp via QR code (pairing)
- ✅ Set uploaded image as WhatsApp DP using [Baileys](https://github.com/WhiskeySockets/Baileys)
- ✅ Compatible with all devices

---

## 🛠️ Tech Stack

- **Node.js** + Express
- **Baileys** (WhatsApp Web socket lib)
- **Multer** for image upload
- **Plain HTML/JS** frontend
- **Deployable on Vercel & Railway**

---

## 🚀 One-click Deploy

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/leadxSASI/leadx-sasi-project)

> 📝 After deploying, remember to:
> - Set your backend (Baileys server) using [Railway](https://railway.app/)
> - Update your frontend `index.html` with the backend URL

---

## 📦 Local Development

### Backend (Baileys server)

```bash
cd backend
npm install
npm start
