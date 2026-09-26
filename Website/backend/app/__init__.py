import logging
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from app.config import Config
from app.extensions import cors, db
from app.routes import register_blueprints
from app.models import seed_existing_projects, seed_existing_services, seed_existing_settings  # Register SQLAlchemy database models


def create_app(config_class=Config):
    """
    Application factory pattern for Flask application.
    Configures extensions, routes, CORS, and structured JSON error handlers.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure logging
    logging.basicConfig(
        level=logging.INFO if not app.config.get("DEBUG") else logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    # Configure MySQL connect timeout only when connecting to MySQL
    db_uri = str(app.config.get("SQLALCHEMY_DATABASE_URI", ""))
    if "mysql" in db_uri:
        engine_options = dict(app.config.get("SQLALCHEMY_ENGINE_OPTIONS", {}))
        connect_args = dict(engine_options.get("connect_args", {}))
        connect_args.setdefault("connect_timeout", 5)
        engine_options["connect_args"] = connect_args
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options

    # Initialize extensions
    db.init_app(app)

    # Configure CORS - environment-driven allowed origins on /api/* routes
    default_allowed = ["https://pikkilisivakumar.com"] if app.config.get("IS_PRODUCTION") else ["http://localhost:5173", "http://127.0.0.1:5173"]
    allowed_origins = app.config.get("CORS_ORIGINS") or default_allowed
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=True,
    )

    # Register API Blueprints
    register_blueprints(app)

    # Register Structured JSON Error Handlers
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        """Standardized JSON response for all HTTP errors (400, 404, 405, etc.)."""
        return (
            jsonify({
                "status": "error",
                "error": e.name,
                "message": e.description,
            }),
            e.code,
        )

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        """Catch-all error handler ensuring no internal stack traces leak in API responses."""
        app.logger.error("Unhandled server exception: %s", str(e), exc_info=True)
        return (
            jsonify({
                "status": "error",
                "error": "Internal Server Error",
                "message": "An unexpected server error occurred.",
            }),
            500,
        )

    def _migrate_user_columns():
        """Ensure password reset columns exist on the users table."""
        try:
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            if "users" in inspector.get_table_names():
                columns = [c["name"] for c in inspector.get_columns("users")]
                with db.engine.begin() as conn:
                    if "reset_token_hash" not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(64) NULL"))
                        try:
                            conn.execute(text("CREATE INDEX idx_users_reset_token_hash ON users (reset_token_hash)"))
                        except Exception:
                            pass
                    if "reset_token_expires_at" not in columns:
                        conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL"))
        except Exception as err:
            app.logger.warning("User columns migration skipped or failed: %s", type(err).__name__)

    # Safe database schema initialization (non-destructive; executes only if DB is reachable)
    with app.app_context():
        try:
            with db.engine.connect():
                db.create_all()
                _migrate_user_columns()
                seed_existing_projects()
                seed_existing_services()
                seed_existing_settings()
                app.logger.info("Database schema initialized and verified projects/services/settings synced.")
        except Exception as e:
            app.logger.warning(
                "Database auto-initialization deferred (database offline or unreachable): %s",
                type(e).__name__,
            )

    # CLI command for manual table creation
    @app.cli.command("init-db")
    def init_db_command():
        """Create database tables if they do not exist."""
        with app.app_context():
            db.create_all()
            seed_existing_projects()
            seed_existing_services()
            seed_existing_settings()
            print("Database tables initialized and verified projects/services/settings synced successfully.")

    # Root welcome / info endpoint
    @app.route("/", methods=["GET"])
    def index():
        return (
            jsonify({
                "status": "ok",
                "service": "Personal Brand & Business API",
                "health": "/api/health",
                "database_health": "/api/health/database",
                "schema_health": "/api/health/schema",
            }),
            200,
        )

    return app
