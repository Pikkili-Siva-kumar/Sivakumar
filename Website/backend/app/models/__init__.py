import logging
from app.extensions import db
from app.models.user import User
from app.models.project_request import ProjectRequest
from app.models.contact_message import ContactMessage
from app.models.project import Project
from app.models.service import Service
from app.models.blog_post import BlogPost
from app.models.analytics_event import AnalyticsEvent
from app.models.site_setting import SiteSetting

logger = logging.getLogger(__name__)

__all__ = [
    "User",
    "ProjectRequest",
    "ContactMessage",
    "Project",
    "Service",
    "BlogPost",
    "AnalyticsEvent",
    "SiteSetting",
    "init_db",
    "seed_existing_projects",
    "seed_existing_services",
    "seed_existing_settings",
]

EXISTING_VERIFIED_PROJECTS = [
    {
        "title": "Federated Learning for 6G Networks",
        "slug": "federated-learning-6g",
        "category": "Machine Learning • Backend • 6G",
        "short_description": "Developed a federated learning-based system for decentralized model training without sharing raw data, with the goal of improving privacy and reducing latency.",
        "description": "Developed a federated learning-based system for decentralized model training without sharing raw data, with the goal of improving privacy and reducing latency. Built with Python, Flask, MySQL, and evaluated across RF, CNN, MLP, and XGBoost models.",
        "technologies": ["Python", "Flask", "MySQL", "Scikit-learn", "XGBoost"],
        "featured": True,
        "status": "published",
        "case_study_route": "/work/federated-learning-6g",
        "image_url": "",
    },
    {
        "title": "Luxury Hotel Management System",
        "slug": "luxury-hotel-management",
        "category": "Full Stack • Backend • Database",
        "short_description": "Built a full-stack hotel management system for room booking, user management, food ordering, and administrative operations.",
        "description": "Built a full-stack hotel management system for room booking, user management, food ordering, and administrative operations. Handled booking edge-case protection, user authentication, and admin reporting.",
        "technologies": ["Python", "Flask", "SQLite", "HTML", "CSS"],
        "featured": True,
        "status": "published",
        "case_study_route": "/work/luxury-hotel-management",
        "image_url": "",
    },
]


def seed_existing_projects():
    """
    Migrates existing verified website projects into database if not already present.
    Never duplicates existing records or creates fake projects.
    """
    try:
        migrated_count = 0
        for data in EXISTING_VERIFIED_PROJECTS:
            existing = Project.query.filter_by(slug=data["slug"]).first()
            if not existing:
                project = Project(
                    title=data["title"],
                    slug=data["slug"],
                    category=data["category"],
                    short_description=data["short_description"],
                    description=data.get("description", ""),
                    technologies=data["technologies"],
                    featured=data.get("featured", True),
                    status=data.get("status", "published"),
                    case_study_route=data.get("case_study_route"),
                    image_url=data.get("image_url", ""),
                )
                db.session.add(project)
                migrated_count += 1
        if migrated_count > 0:
            db.session.commit()
            logger.info("Migrated %d verified projects into database.", migrated_count)
    except Exception as e:
        db.session.rollback()
        logger.warning("Project migration deferred: %s", type(e).__name__)


EXISTING_VERIFIED_SERVICES = [
    {
        "title": "Web Application Development",
        "slug": "web-application-development",
        "short_description": "End-to-end web applications built around real business workflows, from frontend interfaces to backend logic and databases.",
        "description": "End-to-end web applications built around real business workflows, from frontend interfaces to backend logic and databases.",
        "technologies": ["Python", "Flask", "JavaScript", "HTML", "CSS"],
        "featured": True,
        "status": "published",
        "display_order": 1,
    },
    {
        "title": "Backend Development",
        "slug": "backend-development",
        "short_description": "Structured backend systems for applications that need reliable business logic, APIs, database operations, and validation.",
        "description": "Structured backend systems for applications that need reliable business logic, APIs, database operations, and validation.",
        "technologies": ["Python", "Flask", "REST APIs", "SQL", "Database Design"],
        "featured": True,
        "status": "published",
        "display_order": 2,
    },
    {
        "title": "Database & SQL Solutions",
        "slug": "database-sql-solutions",
        "short_description": "Design and implementation of structured database systems for applications that depend on consistent and reliable data.",
        "description": "Design and implementation of structured database systems for applications that depend on consistent and reliable data.",
        "technologies": ["MySQL", "SQLite", "SQL", "Database Design", "CRUD Operations"],
        "featured": False,
        "status": "published",
        "display_order": 3,
    },
    {
        "title": "Project Development",
        "slug": "project-development",
        "short_description": "Practical software projects developed from requirements to working implementation, with clear structure and documented functionality.",
        "description": "Practical software projects developed from requirements to working implementation, with clear structure and documented functionality.",
        "technologies": ["Requirement Analysis", "System Design", "Implementation", "Testing", "Documentation"],
        "featured": False,
        "status": "published",
        "display_order": 4,
    },
]


def seed_existing_services():
    """
    Migrates existing verified website services into database if not already present.
    Never duplicates existing records or creates fake services.
    """
    try:
        migrated_count = 0
        for data in EXISTING_VERIFIED_SERVICES:
            existing = Service.query.filter_by(slug=data["slug"]).first()
            if not existing:
                service = Service(
                    title=data["title"],
                    slug=data["slug"],
                    short_description=data["short_description"],
                    description=data.get("description", data["short_description"]),
                    technologies=data.get("technologies", []),
                    featured=data.get("featured", False),
                    status=data.get("status", "published"),
                    display_order=data.get("display_order", 0),
                )
                db.session.add(service)
                migrated_count += 1
        if migrated_count > 0:
            db.session.commit()
            logger.info("Migrated %d verified services into database.", migrated_count)
    except Exception as e:
        db.session.rollback()
        logger.warning("Service migration deferred: %s", type(e).__name__)


EXISTING_INITIAL_SETTINGS = [
    {
        "key": "site_name",
        "value": "Siva Kumar",
        "is_public": True,
    },
    {
        "key": "site_description",
        "value": "Python Full Stack Developer building practical web applications and reliable backend systems.",
        "is_public": True,
    },
    {
        "key": "contact_email",
        "value": "pikkilisivakumar07@gmail.com",
        "is_public": True,
    },
    {
        "key": "contact_phone",
        "value": "939867XXXX",
        "is_public": True,
    },
    {
        "key": "linkedin_url",
        "value": "https://linkedin.com/in/siva-kumar",
        "is_public": True,
    },
    {
        "key": "github_url",
        "value": "https://github.com/SivaKumarPikkili",
        "is_public": True,
    },
    {
        "key": "seo_title",
        "value": "Siva Kumar | Professional Brand & Business",
        "is_public": True,
    },
    {
        "key": "seo_description",
        "value": "Siva Kumar - Professional Personal-Brand & Business",
        "is_public": True,
    },
    {
        "key": "maintenance_mode",
        "value": "false",
        "is_public": True,
    },
]


def seed_existing_settings():
    """
    Migrates initial verified website configuration settings into database if not already present.
    Never duplicates existing records or overwrites existing admin settings.
    """
    try:
        migrated_count = 0
        for item in EXISTING_INITIAL_SETTINGS:
            existing = SiteSetting.query.filter_by(key=item["key"]).first()
            if not existing:
                setting = SiteSetting(
                    key=item["key"],
                    value=item["value"],
                    is_public=item["is_public"],
                )
                db.session.add(setting)
                migrated_count += 1
        if migrated_count > 0:
            db.session.commit()
            logger.info("Migrated %d verified settings into database.", migrated_count)
    except Exception as e:
        db.session.rollback()
        logger.warning("Settings migration deferred: %s", type(e).__name__)


def init_db(app=None):
    """
    Safely creates application tables if they do not already exist
    and ensures existing verified projects, services, and settings are migrated without duplicates.
    """
    ctx = app.app_context() if app else None
    if ctx:
        ctx.push()

    try:
        db.create_all()
        logger.info("Database tables initialized successfully (if not existing).")
        seed_existing_projects()
        seed_existing_services()
        seed_existing_settings()
    except Exception as e:
        logger.warning(
            "Database table initialization deferred or failed: %s",
            type(e).__name__,
        )
    finally:
        if ctx:
            ctx.pop()
