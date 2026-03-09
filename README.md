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

> ## 🎥 Project Demo Video

Watch the full walkthrough of OnboardAI here:

👉 [Click to Watch the Demo](https://onboardai-frontend-g95xrinhn-suhas-magadums-projects.vercel.app/)

## 🔐 Demo Access (Test Credentials)

You can explore the live application using the demo accounts below.

### 👨‍💼 HR Account
Email: hr@company.com  
Password: 09845  

Access Includes:
- Dashboard (AI Risk Command Center)
- Employee Management
- Task Assignment
- Templates
- Reports & Analytics
- Risk Insights

---

### 👨‍💻 Employee Account
Email: john@company.com (or any employee_name@company.com)  
Password: 098765432  

Access Includes:
- Personal Onboarding Dashboard
- Assigned Tasks
- Due Dates & Alerts
- Performance Feedback

---

⚠️ Note:
- Please use the credentials above to explore the platform.
- All data shown is for demonstration purposes only.

---

Or preview below with voice over :

## 🎥 Project Demo Video

👉 [Click here to watch the demo](https://drive.google.com/file/d/111UWXS1BZ-U9dDPNKQjelEfcnXDEWX54/view?usp=sharing)

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
npm start
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
🚀 Live Deployment

Frontend (React – Vercel):
👉 [https://your-frontend-link.vercel.app](https://onboardai-frontend-g95xrinhn-suhas-magadums-projects.vercel.app/)

Backend (Flask – Render):
👉 [https://your-backend-link.onrender.com](https://onboardai-backend.onrender.com/)

---

🔎 Why This Deployment Strategy?

🔹 Frontend deployed on Vercel:
- Optimized for React applications
- Fast CDN delivery
- Automatic CI/CD from GitHub

🔹 Backend deployed on Render:
- Supports persistent Flask servers
- Background process support
- Better handling of PostgreSQL connections
- Stable for REST APIs

Render was chosen instead of serverless platforms because:
- Flask requires a persistent server environment
- Serverless cold starts can affect API response time
  
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
## 📸 Screenshots

### HR Dashboard
![Dashboard](.<img width="2555" height="1251" alt="image" src="https://github.com/user-attachments/assets/ae00413d-d1c9-42f1-9385-d9cdf02773e2" />)

![Employee Intelligence]<img width="2554" height="1264" alt="image" src="https://github.com/user-attachments/assets/558ff161-d5e0-4a6c-98c8-cacc635f3e8c" />

![Employee]<img width="2559" height="1255" alt="image" src="https://github.com/user-attachments/assets/abacb711-77fb-4208-b0d3-c094068ae313" />

![Alerts & Insights]<img width="2544" height="1232" alt="image" src="https://github.com/user-attachments/assets/410acb93-5e3d-4638-b856-3744b814fa55" />

![Reports]<img width="2552" height="1249" alt="image" src="https://github.com/user-attachments/assets/0d216f53-0b60-41e5-a802-6cef500cd3a6" />

![Templates]<img width="2553" height="1266" alt="image" src="https://github.com/user-attachments/assets/a5f63784-c208-4ae8-8ac4-75dbfccad988" />

![Employee Management]<img width="2559" height="1254" alt="image" src="https://github.com/user-attachments/assets/1d0e0074-a8eb-4f1d-a274-9d72a81a1960" />


### Employee View
![Employee]<img width="2551" height="1252" alt="image" src="https://github.com/user-attachments/assets/f5798620-fdda-427a-85b9-00ecde33ae1c" />
<img width="2552" height="1264" alt="image" src="https://github.com/user-attachments/assets/b8476369-8444-44ba-9510-eb84ef3f3514" />
<img width="2551" height="1221" alt="image" src="https://github.com/user-attachments/assets/8831b068-8396-41b8-a65a-8810a3854dd5" />





