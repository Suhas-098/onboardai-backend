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

3.  **Run Server**:
    ```bash
    python app.py
    ```
    The server runs on `http://localhost:5000`.

## API Documentation

For a complete list of API endpoints, please refer to **[ROUTES_DOCUMENTATION.md](ROUTES_DOCUMENTATION.md)** located in this directory.

It covers:
- Authentication
- Employee Management
- Template & Task Management
- Dashboard & Risk Analytics
- Reporting & Notifications
