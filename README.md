# 💊 Pharmacy Management System

A full-featured Pharmacy Management Web App built with the **MERN Stack (MongoDB, Express.js, React, Node.js)**. Designed for pharmacies to manage medicine inventories, supplier relationships, purchase records, and employee access — with advanced authentication and admin controls.

---

## 🚀 Features

### 👨‍⚕️ Role-Based Access
- **Admins**
  - Manage employees
  - Set pharmacy-wide discounts
  - Update pharmacy settings
  - View reports and statistics
- **Pharmacists**
  - Add & manage medicines
  - Record purchases from suppliers
  - Handle customer sales
  - Generate sales reports

### 📦 Inventory & Purchase Management
- Add/update medicine stock
- Low-stock and expired medicine alerts
- Track supplier purchases
- Invoice-based sales management and Printing

### 🛡️ Authentication & Security
- Secure login with JWT
- Role-based authorization
- Protected API routes
- Token expiration with optional cron job cleanup

### 📊 Reports & Automation
- Daily sales and inventory reports
- Top-selling medicines
- Cron jobs for auto-report generation

---

## 🛠️ Tech Stack

| Technology    | Usage                       |
|---------------|-----------------------------|
| React.js      | Frontend UI (with Ant Design) |
| Node.js       | Backend runtime             |
| Express.js    | Backend framework           |
| MongoDB       | Database                    |
| Mongoose      | ODM for MongoDB             |
| JWT           | Authentication              |
| Formik + Yup  | Form handling and validation |
| Cron          | Scheduled background tasks  |



## 📂 Project Structure

backend/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── config/
└── server.js

frontend/
│
├── components/
├── pages/
├── redux/
├── utils/
└── App.jsx


## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pharmacy-management-system.git
cd pharmacy-management-system

cd server
npm install
# Add .env file with your MongoDB URI, JgWT secret, etc.
npm start

cd ../client
npm install
npm run dev

```

### 1.Environment Variables server 

```bash
DB_CONNECT= db_url
JWT_SECRET=your_jwt_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_emmail
EMAIL_PASS=your_email_app_password


FRONTEND_URL= frontend url
```

### 🙌 Contribution
Pull requests are welcome! Feel free to submit issues or suggest new features.
