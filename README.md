# OTESS DATA - Enterprise Bulk SMS Management System

Production-ready Bulk SMS Management Web Application designed for OTESS DATA to message agents, manage contact lists with Excel/CSV auto-detection, design variable templates, send scheduled broadcasts via Arkesel SMS API, and analyze campaign performance.

---

## 🚀 Key Features

- **JWT Authentication & Security**: Password hashing with bcrypt, Rate Limiter, Helmet HTTP headers.
- **Dashboard**: Metrics cards (Total Contacts, SMS Sent Today, SMS Failed Today, Arkesel Balance), Group breakdown, and recent activity logs.
- **Contact Management**: Excel (.xlsx) and CSV import with header auto-detection, pagination, search, group filter, bulk delete, and ExcelJS export.
- **Groups**: Organizes agents and customers into categories (Agents, Customers, VIP, Inactive Agents).
- **Dynamic Templates**: Insert variables `{{name}}`, `{{phone}}`, `{{email}}`, `{{group}}` with real-time mobile preview.
- **Bulk SMS Dispatch**: Group send, individual numbers, or uploaded Excel list with progress tracking and scheduled sending.
- **Arkesel SMS Gateway Integration**: Configurable API Keys and Sender ID saved in database with live balance lookup and interactive Sandbox mode.
- **SMS History & Audit Logs**: Detailed logs of every sent SMS with cost tracking, search, filtering, and Excel export.
- **Campaigns**: Save, duplicate, delete, and view delivery success statistics.
- **Analytics**: Interactive Recharts area chart for daily volume trends and pie chart for delivery success rate.
- **Dark Mode & Blue/White UI**: Fully responsive Tailwind CSS design system with smooth animations and dark theme.

---

## 📦 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router v6, React Hook Form, Axios, Recharts, Lucide React.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose ORM), JWT, bcryptjs, Helmet, Express Rate Limit, Multer, XLSX, ExcelJS, Axios.

---

## 🛠 Local Setup & Running Instructions

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
# Server will run at http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Frontend will run at http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### MongoDB Atlas Setup
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your MongoDB Connection String.
3. Update `MONGO_URI` in `server/.env`.

### Render (Backend Deployment)
1. Push project repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node index.js`
6. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `ARKESEL_API_KEY`, `ARKESEL_SENDER_ID`).

### Vercel (Frontend Deployment)
1. Create a project on [Vercel](https://vercel.com).
2. Set Framework Preset to **Vite**.
3. Set Root Directory to `client`.
4. Deploy!
