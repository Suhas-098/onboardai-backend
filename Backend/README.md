# OnboardAI Backend

Flask-based backend for the OnboardAI application, managing employee onboarding, templates, risk assessment, and AI nudges.

## Features

- **Employee Management**: CRUD operations for employees.
- **Onboarding Templates**: Create and assign standardized onboarding plans (Engineering, Sales, etc.).
- **Task Management**: Track task progress, due dates, and status.
- **Risk Assessment (ML)**: Predict employee dropout risk based on progress and engagement.
- **AI Nudges**: Automated reminders and insights for employees and HR.
- **Authentication**: JWT-based auth with Role-Based Access Control (RBAC).

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Initialize Database**:
    The application uses SQLite (`onboardai.db`).
    ```bash
    python config/init_db.py
    ```

3.  **Seed Data**:
    Populate the database with realistic test data (users, templates, tasks, etc.).
    ```bash
    python seed_db.py
    ```

4.  **Run Server**:
    ```bash
    python app.py
    ```
    The server runs on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login user.
- `POST /api/auth/signup`: Register new user.

### Employees
- `GET /api/employees`: List all employees (Admin/HR).
- `GET /api/employees/<id>`: Get employee details.
- `GET /api/employees/<id>/tasks`: Get employee tasks.

### Templates
- `GET /api/templates`: List all templates.
- `POST /api/templates`: Create a new template.
- `POST /api/employees/<id>/assign-template/<template_id>`: Assign a template to an employee.

### Risk & ML
- `GET /api/risks/stats`: Get risk distribution stats.
- `GET /api/ml/prediction-summary`: Get ML-driven risk summary (On Track, At Risk, Delayed).

### Alerts & Notifications
- `GET /api/alerts`: Get system alerts.
- `POST /api/alerts`: Create a new alert.
