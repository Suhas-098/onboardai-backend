# 🚀 **OnboardAI — Intelligent Employee Onboarding System**

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge\&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-green?style=for-the-badge\&logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-336791?style=for-the-badge\&logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge\&logo=tailwindcss)

</div>

> **OnboardAI** is an AI-powered onboarding and employee management platform that streamlines HR operations, automates risk assessment, task assignment, and provides intelligent insights through analytics and AI-driven decision-making.

---

## 🎯 **Why OnboardAI?**

| Problem                 | Our Solution                        |
| ----------------------- | ----------------------------------- |
| Manual onboarding       | ✅ AI-assisted onboarding workflows  |
| Scattered employee data | ✅ Centralized employee system       |
| No risk detection       | ✅ AI-based risk & compliance checks |
| No analytics            | ✅ Visual dashboards & insights      |
| Poor task tracking      | ✅ Smart task assignment & reminders |

---

## 🧠 **Core Features**

### 👥 Employee Management

* Create, update, and manage employee profiles
* Role-based access (Admin, HR, Employee)
* Secure authentication & authorization

### 🤖 AI-Powered Risk & Insights

* AI-based risk assessment for employees
* Smart compliance monitoring
* Automated alerts & recommendations

### 📋 Task & Workflow Automation

* Assign tasks to employees
* Set priorities & due dates
* Track completion & progress

### 📊 Analytics & Dashboards

* Employee performance insights
* Risk trends visualization
* Department-wise analytics

---

## 🏗️ **System Architecture (High-Level)**

```mermaid
graph TD
A[Frontend - React + Tailwind] -->|REST API| B[Flask Backend]
B --> C[(PostgreSQL Database)]
B --> D[AI/ML Services]
B --> E[Authentication Service]
B --> F[Risk & Compliance Engine]
```

### 🔹 Layered Architecture

```
Frontend (React)
      ↓
API Gateway (Flask)
      ↓
Services Layer (Business Logic)
      ↓
Models Layer (DB ORM)
      ↓
PostgreSQL Database
```

---

## 🔄 **How the App Flow Works**

### ✅ Admin / HR Flow

1. Login → Dashboard
2. Create Employee → Stored in DB
3. Assign Task → Notifies Employee
4. AI Risk Analysis → Generates Insights
5. HR Reviews & Acts

### ✅ Employee Flow

1. Login → View Tasks
2. Complete Assigned Work
3. View Feedback & Insights

---

## 🛠️ **Tech Stack**

### 🔹 Backend

* 🐍 Python + Flask
* 🗄️ PostgreSQL
* 🔐 JWT Authentication
* 📦 SQLAlchemy ORM

### 🔹 Frontend

* ⚛️ React.js
* 🎨 Tailwind CSS
* 📡 Axios (API calls)
* 📊 Charts & Visualizations

---

## 📂 **Project Structure**

```
onboardai-backend-main/
│
├── Backend/
│   ├── app.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── seed_db.py
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
```

---

## 🚀 **Getting Started (Local Setup)**

### 🔹 Backend Setup

```bash
cd Backend
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Backend runs on: 👉 `http://localhost:5000`
Frontend runs on: 👉 `http://localhost:5173`

---

## 🔐 Environment Variables (Create a `.env` file)

```
DATABASE_URL=postgresql://user:password@localhost/onboardai
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
```

---

## 🧪 Testing

Run backend tests:

```bash
pytest
```

---

## 📌 Future Roadmap

* ✅ AI Chatbot for HR
* ✅ Automated Interview Screening
* ✅ Advanced Analytics Dashboard
* ✅ Real-time Notifications
* ✅ Role-based AI recommendations

---



