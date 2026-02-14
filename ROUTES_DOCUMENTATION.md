# API Routes Documentation

## Authentication Routes
- `POST /api/auth/register` - Register a new user (Open to all?)
- `POST /api/auth/login` - Authenticate user and get token (Open)
- `POST /api/auth/reset-password` - Reset user password (Auth required)

## Employee Routes
- `GET /api/employees` - Get list of all employees (Auth required)
- `GET /api/employees/<id>` - Get details of a specific employee (Auth required)
- `GET /api/employees/<id>/tasks` - Get tasks assigned to an employee (Auth required)
- `GET /api/employees/<id>/activity` - Get activity log for an employee (Auth required)
- `POST /api/employees/<id>/send-alert` - Send an in-app alert to an employee (Admin/HR only)
- `POST /api/employees/<id>/send-email` - Send an email to an employee (Admin/HR only)

## Template Routes
- `GET /api/templates` - Get all templates (Admin/HR only)
- `POST /api/templates` - Create a new template (Admin/HR only)
- `GET /api/templates/<id>` - Get template details (Admin/HR only)
- `PUT /api/templates/<id>` - Update a template (Admin/HR only)
- `DELETE /api/templates/<id>` - Delete a template (Admin/HR only)
- `POST /api/employees/<id>/assign-template/<template_id>` - Assign a template to an employee (Admin/HR only)

## Task Routes
- `POST /api/tasks` - Create a new task (Admin/HR)
- `PUT /api/tasks/<id>` - Update a task (Admin/HR)
- `DELETE /api/tasks/<id>` - Delete a task (Admin/HR)
- `POST /api/tasks/<id>/complete` - Mark a task as complete (Auth required)
- `GET /api/tasks/<id>/messages` - Get messages for a task (Auth required)
- `POST /api/tasks/<id>/messages` - Post a message to a task (Auth required)

## Dashboard Routes
- `GET /api/dashboard/summary` - Get high-level dashboard stats (Admin/HR)
- `GET /api/dashboard/risk-trend` - Get risk trend data (Admin/HR)
- `GET /api/dashboard/risk-heatmap` - Get risk heatmap data (Admin/HR)
- `GET /api/dashboard/top-improved` - Get top improved employees (Admin/HR)
- `GET /api/dashboard/critical-focus` - Get employees needing critical focus (Admin/HR)

## Risk Routes
- `GET /api/risks` - Get all risk data (Admin/HR)
- `GET /api/risks/stats` - Get risk statistics (Admin/HR)

## Alert Routes
- `GET /api/alerts` - Get all system alerts (Admin/HR)
- `POST /api/alerts` - Create a manual alert (Admin/HR)

## Report Routes
- `GET /api/reports/summary` - Get report summary (Admin/HR)
- `GET /api/reports/weekly-risk-trend` - Get weekly risk trend (Admin/HR)
- `GET /api/reports/download/pdf` - Download report as PDF (Admin/HR)
- `GET /api/reports/download/csv` - Download report as CSV (Admin/HR)
- `GET /api/reports/download/excel` - Download report as Excel (Admin/HR)

## Notification Routes
- `GET /api/notifications` - Get user notifications (Auth required)
- `PUT /api/notifications/<id>/read` - Mark notification as read (Auth required)

## Search Routes
- `GET /api/search` - Search for users, tasks, etc. (Auth required)

## Admin Routes
- `GET /api/admin/stats` - Get admin-specific stats (Admin/HR)
- `GET /api/admin/users` - Manage users (Admin/HR)

## AI Routes
- `POST /api/predict-risk` - Predict employee risk (Admin/HR)
- `GET /api/ml/prediction-summary` - Get ML prediction summary (Admin/HR)
