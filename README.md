# 🏛️ SCMS - Smart Complaint Management System

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## 📋 Overview

A **production-ready complaint management system** that bridges the gap between citizens and government departments. Features advanced PostgreSQL database design, role-based access control (Citizen/Officer/Admin/Super Admin), real-time notifications, and complete audit logging. Built with FastAPI backend + React frontend.

### 🎯 Key Features

| Role | Capabilities |
|------|--------------|
| **Citizen** | Submit complaints, upload evidence, track status, receive notifications |
| **Officer** | View assigned complaints, update status, resolve issues |
| **Admin** | Manage categories, assign officers, oversee department complaints |
| **Super Admin** | Full system control, manage departments, user analytics |

### 🗄️ Advanced Database Features
- ✅ **10+ Tables** with complex relationships
- ✅ **8+ Views** for analytics and summaries
- ✅ **6+ Triggers** for automation (status updates, logging, notifications)
- ✅ **15+ Indexes** for query optimization
- ✅ **Partial Unique Index** for active assignments only
- ✅ **Complete Audit Trail** tracking every change

## 🚀 Tech Stack

**Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT, Bcrypt, Uvicorn

**Frontend:** React 18, Vite, TailwindCSS, Axios, React Router, Context API

## 📁 Project Structure
scms-Smart-Complaint-Management-System/
│
├── database/ # All SQL files
│ ├── schema.sql # 10+ tables definition
│ ├── indexes.sql # 15+ performance indexes
│ ├── views.sql # 8+ analytics views
│ ├── functions.sql # Business logic functions
│ ├── triggers.sql # 6+ automation triggers
│ └── seed.sql # Sample data
│
├── backend/ # FastAPI Backend
│ ├── app/
│ │ ├── routers/ # API endpoints (auth, complaints, admin)
│ │ ├── services/ # Business logic
│ │ ├── auth/ # JWT & security
│ │ └── models/ # Pydantic schemas
│ └── requirements.txt
│
├── frontend/ # React Frontend
│ ├── src/
│ │ ├── components/ # Role-based (admin, citizen, officer)
│ │ ├── contexts/ # AuthContext
│ │ ├── layouts/ # Sidebar, MainLayout
│ │ └── utils/ # Helper functions
│ └── package.json
│
└── docs/ # Documentation

text

## 🚀 Quick Start

### Prerequisites
- PostgreSQL 16+
- Python 3.11+
- Node.js 18+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Muhammad-AtifKhan/scms-Smart-Complaint-Management-System-.git
cd scms-Smart-Complaint-Management-System-

# 2. Database Setup
createdb scms_db
psql -d scms_db -f database/schema.sql
psql -d scms_db -f database/indexes.sql
psql -d scms_db -f database/functions.sql
psql -d scms_db -f database/triggers.sql
psql -d scms_db -f database/views.sql
psql -d scms_db -f database/seed.sql

# 3. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
Default Login Credentials
Role	Email	Password
Super Admin	admin@example.com	admin123
Citizen	john@example.com	citizen123
Officer	sarah@example.com	officer123
📊 Sample SQL Queries
sql
-- Complaint summary by department
SELECT * FROM complaint_summary;

-- Track complaint timeline
SELECT * FROM complaint_timeline WHERE complaint_id = 1;

-- Active complaints with assigned officers
SELECT * FROM complaints_with_officers WHERE status != 'Resolved';

-- User notifications
SELECT * FROM user_notifications WHERE user_id = 2;
🔐 Security Features
✅ JWT authentication with refresh tokens

✅ Password hashing (bcrypt)

✅ Role-based access control (RBAC)

✅ SQL injection prevention

✅ Input validation (Pydantic)

✅ CORS protection

✅ Rate limiting

📈 Future Enhancements
Mobile app (React Native)

Real-time WebSocket notifications

AI-based complaint categorization

Docker containerization

CI/CD pipeline (GitHub Actions)

Analytics dashboard with charts

👨‍💻 Author
Muhammad Atif Khan

GitHub: @Muhammad-AtifKhan

📝 License
MIT License - feel free to use for learning and production!

⭐ Show Your Support
If you found this project helpful, please give it a star!

Built with ❤️ by Muhammad Atif Khan
