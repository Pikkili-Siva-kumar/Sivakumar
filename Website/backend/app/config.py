import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Explicitly locate and load backend/.env or root .env with override
current_file_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/app
backend_dir = os.path.dirname(current_file_dir)                # .../backend
root_dir = os.path.dirname(backend_dir)                        # .../Website

backend_env_path = os.path.join(backend_dir, ".env")
root_env_path = os.path.join(root_dir, ".env")

if os.path.isfile(backend_env_path):
    load_dotenv(backend_env_path, override=False)
elif os.path.isfile(root_env_path):
    load_dotenv(root_env_path, override=False)
else:
    load_dotenv(override=False)


class Config:
    """Base application configuration loaded from environment variables."""

    FLASK_ENV = os.getenv("FLASK_ENV", "development").strip().lower()
    IS_PRODUCTION = FLASK_ENV == "production"
    DEBUG = (os.getenv("FLASK_DEBUG", "0" if IS_PRODUCTION else "1") == "1") and not IS_PRODUCTION

    raw_secret = os.getenv("SECRET_KEY", "").strip()
    if IS_PRODUCTION and (not raw_secret or raw_secret == "dev-secret-key-change-in-production"):
        raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY environment variable must be set to a secure unique value in production.")
    SECRET_KEY = raw_secret or "dev-secret-key-change-in-production"

    raw_port_env = os.getenv("PORT", "5000").strip()
    try:
        PORT = int(raw_port_env) if raw_port_env else 5000
    except (ValueError, TypeError):
        PORT = 5000

    # Database Configuration
    # Reads primary DB_* variables with backward-compatible MYSQL_* fallbacks
    DB_HOST = os.getenv("DB_HOST") or os.getenv("MYSQL_HOST") or "localhost"

    raw_port = os.getenv("DB_PORT") or os.getenv("MYSQL_PORT") or "3306"
    try:
        DB_PORT = int(str(raw_port).strip()) if str(raw_port).strip() else 3306
    except (ValueError, TypeError):
        DB_PORT = 3306

    DB_NAME = os.getenv("DB_NAME") or os.getenv("MYSQL_DATABASE") or "sivakumar_portfolio"
    DB_USER = os.getenv("DB_USER") or os.getenv("MYSQL_USER") or "root"
    DB_PASSWORD = os.getenv("DB_PASSWORD") or os.getenv("MYSQL_PASSWORD") or ""

    # Legacy aliases for backward compatibility
    MYSQL_HOST = DB_HOST
    MYSQL_PORT = DB_PORT
    MYSQL_DATABASE = DB_NAME
    MYSQL_USER = DB_USER
    MYSQL_PASSWORD = DB_PASSWORD

    # Flag indicating whether DB_PASSWORD is provided
    IS_DB_PASSWORD_CONFIGURED = bool(DB_PASSWORD)

    # Construct SQLAlchemy MySQL connection URI safely escaping credentials
    # Format: mysql+pymysql://<user>:<encoded_password>@<host>:<port>/<database>?charset=utf8mb4
    if DB_USER and DB_PASSWORD:
        encoded_password = quote_plus(DB_PASSWORD)
        user_auth = f"{DB_USER}:{encoded_password}@"
    elif DB_USER:
        user_auth = f"{DB_USER}@"
    else:
        user_auth = ""

    db_path = f"/{DB_NAME}" if DB_NAME else ""

    # Allow explicit override via DATABASE_URL if supplied
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{user_auth}{DB_HOST}:{DB_PORT}{db_path}?charset=utf8mb4",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Connection pooling and liveness settings for MySQL
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    # CORS Origins (comma-separated string converted to list)
    default_cors = "https://pikkilisivakumar.com" if IS_PRODUCTION else "http://localhost:5173,http://127.0.0.1:5173"
    cors_origins_env = os.getenv("CORS_ORIGINS", "").strip() or default_cors
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

    # Google Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()

    # Email / SMTP Configuration
    MAIL_ENABLED = os.getenv("MAIL_ENABLED", "false").strip().lower() in ("true", "1", "yes")
    MAIL_HOST = os.getenv("MAIL_HOST", "").strip()
    raw_mail_port = os.getenv("MAIL_PORT", "587").strip()
    try:
        MAIL_PORT = int(raw_mail_port) if raw_mail_port else 587
    except (ValueError, TypeError):
        MAIL_PORT = 587
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "").strip()
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "").strip()
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "true").strip().lower() in ("true", "1", "yes")
    MAIL_FROM = os.getenv("MAIL_FROM", "").strip()
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Siva Kumar").strip()
    ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", "").strip()

    # Frontend Base URL (for email links such as password reset)
    default_frontend_url = "https://pikkilisivakumar.com" if IS_PRODUCTION else "http://localhost:5173"
    FRONTEND_BASE_URL = (os.getenv("FRONTEND_BASE_URL", "").strip() or default_frontend_url).rstrip("/")


