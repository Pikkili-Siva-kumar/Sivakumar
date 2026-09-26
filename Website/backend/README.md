# Backend Foundation (Flask + SQLAlchemy + MySQL)

This is the backend REST API service for the personal-brand and business website. It provides the foundation connecting the React/Vite frontend to a Python Flask API with MySQL via SQLAlchemy.

---

## Architecture

```
React/Vite Frontend (Port 5173)
        ↓  REST API (CORS enabled)
Flask REST API (Port 5000)
        ↓  SQLAlchemy ORM + PyMySQL
MySQL Database (Port 3306)
```

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py         # Flask application factory (create_app)
│   ├── config.py           # Configuration loaded from environment variables
│   ├── extensions.py       # Extension instances (db, cors)
│   ├── routes/
│   │   ├── __init__.py     # Blueprint registration
│   │   └── health.py       # Health check routes (/api/health, /api/health/database)
│   ├── models/
│   │   ├── __init__.py     # Database models export & safe schema initialization
│   │   ├── user.py         # User model (users table)
│   │   ├── project_request.py # ProjectRequest model (project_requests table)
│   │   └── contact_message.py # ContactMessage model (contact_messages table)
│   └── services/
│       └── __init__.py     # Business logic services package (for upcoming features)
├── run.py                  # Server entry point
├── requirements.txt        # Backend dependencies
├── .env.example            # Environment variables template
└── README.md               # Backend documentation and setup guide
```

---

## Setup Instructions

### 1. Create a MySQL Database
Open your MySQL client or command line and create a database:
```sql
CREATE DATABASE sivakumar_portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Copy `.env.example` to `.env`
In the `backend` folder (or project root), copy the example environment file:
```bash
cp .env.example .env
```
*(On Windows PowerShell)*:
```powershell
Copy-Item .env.example .env
```

### 3. Add Local MySQL Credentials
Edit your `backend/.env` file with your local MySQL credentials:
```env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=generate-a-secure-random-key
PORT=5000

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sivakumar_portfolio
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 4. Install Backend Dependencies
Make sure you are in the `backend/` directory or project root, then install the dependencies:
```bash
pip install -r requirements.txt
```

Required packages:
- `Flask` (>=3.1.0)
- `Flask-CORS` (>=6.0.0)
- `Flask-SQLAlchemy` (>=3.1.0)
- `PyMySQL` (>=1.1.0)
- `python-dotenv` (>=1.0.0)

### 5. Start Flask
Run the backend server:
```bash
python run.py
```
Or from the project root:
```bash
python backend/run.py
```
The server will start at `http://localhost:5000`.

### 6. Test `/api/health`
Open your browser or run:
```bash
curl http://localhost:5000/api/health
```
**Expected Response (HTTP 200)**:
```json
{
  "status": "ok",
  "service": "backend"
}
```

### 7. Test `/api/health/database`
Run:
```bash
curl http://localhost:5000/api/health/database
```
**Expected Response when Connected (HTTP 200)**:
```json
{
  "status": "ok",
  "database": "connected"
}
```
**Expected Response if Database is Unavailable (HTTP 503)**:
```json
{
  "status": "error",
  "database": "disconnected"
}
```
### 8. Test `/api/health/schema`
Run:
```bash
curl http://localhost:5000/api/health/schema
```
**Expected Response when Connected and Tables Exist (HTTP 200)**:
```json
{
  "status": "ok",
  "tables": [
    "users",
    "project_requests",
    "contact_messages"
  ]
}
```
**Expected Response if Unavailable (HTTP 503)**:
```json
{
  "status": "error",
  "schema": "unavailable"
}
```

---

## API Endpoints Reference

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status index | `200` |
| `GET` | `/api/health` | Backend service health check | `200` |
| `GET` | `/api/health/database` | MySQL connection health check | `200` / `503` |
| `GET` | `/api/health/schema` | Schema verification health check | `200` / `503` |
| `POST` | `/api/auth/register` | Register new user account | `201` / `400` / `409` |
| `POST` | `/api/auth/login` | Authenticate user & return token | `200` / `400` / `401` |
| `GET` | `/api/auth/me` | Current authenticated user profile | `200` / `401` |
| `POST` | `/api/auth/logout` | Client session logout | `200` |

---

## Error Handling
All HTTP errors (e.g., 404, 405, 500) return consistent JSON responses:
```json
{
  "status": "error",
  "error": "Not Found",
  "message": "The requested resource was not found on this server."
}
```

---

## Security Guidelines
- Never commit `.env` to Git. (It is listed in `.gitignore`.)
- Never hardcode database passwords in code or config files.
- Credentials and database connection strings are never exposed in error responses.
