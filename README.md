# Mini CRM - Client Lead Management System
# 📋 Mini CRM — Client Lead Management System
**Future Interns FS-02**

A full-stack CRM to capture leads from contact forms, track status, and manage follow-ups.

---

## 🌐 Live Demo
🔗 [Admin Dashboard](#) · [Contact Form](#/contact)

**Admin login:** `admin` / `Admin@2024`

---

## ✅ Features
- Lead capture via public contact form
- Secure admin login (JWT)
- Status tracking: new → contacted → converted → lost
- Follow-up notes per lead
- Search & filter leads
- Analytics overview

---

## 🛠️ Stack
React · Node.js · Express · MongoDB · JWT

---

## ⚙️ Setup
```bash
# Backend
cd mini-crm/backend && npm install && npm start

# Frontend
cd mini-crm/frontend && npm install && npm run dev
```

**backend/.env**
PORT=5000
MONGO_URI=mongodb://harini:Hh200611%21@ac-yxsrfwd-shard-00-00.y5lfovr.mongodb.net:27017,ac-yxsrfwd-shard-00-01.y5lfovr.mongodb.net:27017,ac-yxsrfwd-shard-00-02.y5lfovr.mongodb.net:27017/?ssl=true&replicaSet=atlas-hu00qd-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=supersecretkey123
> Create admin: `POST /api/auth/register` with `{ "username": "admin", "password": "Admin@2024" }`