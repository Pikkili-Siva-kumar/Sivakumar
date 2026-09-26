from app.routes.health import health_bp
from app.routes.auth import auth_bp
from app.routes.admin import admin_bp
from app.routes.projects import projects_bp
from app.routes.project_requests import project_requests_bp
from app.routes.contact_messages import contact_messages_bp
from app.routes.services import services_bp
from app.routes.blog import blog_bp
from app.routes.analytics import analytics_bp
from app.routes.settings import settings_bp
from app.routes.search import search_bp
from app.routes.client import client_bp
from app.routes.ai import ai_bp

def register_blueprints(app):
    """Register all API blueprints under the /api prefix."""
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(projects_bp, url_prefix="/api")
    app.register_blueprint(project_requests_bp, url_prefix="/api")
    app.register_blueprint(contact_messages_bp, url_prefix="/api")
    app.register_blueprint(services_bp, url_prefix="/api")
    app.register_blueprint(blog_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(client_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")


