import logging
from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.models.project import Project
from app.models.service import Service
from app.models.blog_post import BlogPost

logger = logging.getLogger(__name__)

search_bp = Blueprint("search", __name__)

# Verified public website pages
PUBLIC_PAGES = [
    {
        "title": "Home",
        "description": "Portfolio landing page, core competencies, and featured highlights.",
        "url": "/",
        "keywords": ["home", "siva kumar", "overview", "introduction"],
    },
    {
        "title": "About",
        "description": "Professional background, MCA education, and technology stack.",
        "url": "/about",
        "keywords": ["about", "bio", "education", "mca", "background", "experience"],
    },
    {
        "title": "Work / Projects",
        "description": "Featured software engineering projects, case studies, and architecture.",
        "url": "/work",
        "keywords": ["work", "portfolio", "projects", "case studies", "applications"],
    },
    {
        "title": "Services",
        "description": "Web application development, backend systems, database architecture.",
        "url": "/services",
        "keywords": ["services", "web development", "backend", "api", "databases", "consulting"],
    },
    {
        "title": "Lab / Experiments",
        "description": "Interactive technical prototypes, algorithms, and sandbox experiments.",
        "url": "/lab",
        "keywords": ["lab", "experiments", "prototypes", "research", "algorithms"],
    },
    {
        "title": "Blog / Articles",
        "description": "Technical insights on Python, distributed systems, and backend engineering.",
        "url": "/blog",
        "keywords": ["blog", "articles", "writing", "insights", "tutorials"],
    },
    {
        "title": "Pricing & Engagement",
        "description": "Transparent project tiers, hourly consultation, and engagement models.",
        "url": "/pricing",
        "keywords": ["pricing", "cost", "rates", "engagement", "tiers", "quote"],
    },
    {
        "title": "Contact",
        "description": "Get in touch directly for inquiries, project requests, and collaborations.",
        "url": "/contact",
        "keywords": ["contact", "email", "phone", "message", "hire", "reach out"],
    },
    {
        "title": "Start a Project",
        "description": "Submit a scoped project inquiry with technical requirements and timeline.",
        "url": "/start-a-project",
        "keywords": ["start a project", "inquiry", "request", "hire", "proposal", "scope"],
    },
]

# Verified real skills and technologies
PUBLIC_SKILLS = [
    {
        "name": "Python",
        "category": "Language",
        "url": "/about",
        "description": "Primary language for backend systems, automation, and full-stack web applications.",
    },
    {
        "name": "SQL",
        "category": "Database",
        "url": "/about",
        "description": "Relational query language for complex schemas, indexing, and data integrity.",
    },
    {
        "name": "JavaScript",
        "category": "Frontend",
        "url": "/about",
        "description": "Client-side interactivity, DOM handling, and asynchronous API communication.",
    },
    {
        "name": "HTML",
        "category": "Frontend",
        "url": "/about",
        "description": "Semantic markup, accessibility, and modern structural web layouts.",
    },
    {
        "name": "CSS",
        "category": "Styling",
        "url": "/about",
        "description": "Responsive design, CSS grid/flexbox, custom design systems, and animations.",
    },
    {
        "name": "Flask",
        "category": "Framework",
        "url": "/about",
        "description": "Lightweight, scalable Python web framework for RESTful APIs and microservices.",
    },
    {
        "name": "MySQL",
        "category": "Database",
        "url": "/about",
        "description": "High-performance relational database for structured application persistence.",
    },
    {
        "name": "SQLite",
        "category": "Database",
        "url": "/about",
        "description": "Embedded SQL engine for lightweight storage and standalone application data.",
    },
    {
        "name": "Scikit-learn",
        "category": "Machine Learning",
        "url": "/work/federated-learning-6g",
        "description": "Machine learning algorithms, Random Forest, classification, and evaluation metrics.",
    },
    {
        "name": "XGBoost",
        "category": "Machine Learning",
        "url": "/work/federated-learning-6g",
        "description": "Gradient boosting framework for tabular machine learning pipelines.",
    },
    {
        "name": "Git",
        "category": "Tooling",
        "url": "/about",
        "description": "Distributed version control system for code tracking and collaboration.",
    },
    {
        "name": "GitHub",
        "category": "Tooling",
        "url": "/contact",
        "description": "Source code hosting, repository management, and code collaboration.",
    },
    {
        "name": "VS Code",
        "category": "Tooling",
        "url": "/about",
        "description": "Primary development environment and code editor.",
    },
]


@search_bp.route("/search", methods=["GET"])
def search():
    """
    Public Global Search endpoint.
    Searches published projects, services, blog articles, skills, and pages.
    Never exposes draft items, admin data, or user records.
    """
    raw_query = request.args.get("q", "")
    query = raw_query.strip()
    type_filter = request.args.get("type", "all").strip().lower()

    # Enforce minimum query length
    if len(query) < 2:
        return jsonify({
            "status": "ok",
            "query": query,
            "count": 0,
            "results": [],
            "message": "Type at least 2 characters.",
        }), 200

    # Truncate overly long queries safely
    if len(query) > 100:
        query = query[:100]

    q_lower = query.lower()
    search_term = f"%{query}%"
    results = []

    try:
        # 1. Published Projects
        if type_filter in ("all", "projects"):
            projects = (
                Project.query.filter(
                    Project.status == "published",
                    or_(
                        Project.title.ilike(search_term),
                        Project.category.ilike(search_term),
                        Project.short_description.ilike(search_term),
                        Project.description.ilike(search_term),
                    ),
                )
                .limit(10)
                .all()
            )

            # Also check technologies in projects
            all_published_projects = Project.query.filter_by(status="published").all()
            matched_project_ids = {p.id for p in projects}

            for p in all_published_projects:
                if p.id not in matched_project_ids:
                    techs = p.technologies or []
                    if any(q_lower in str(t).lower() for t in techs):
                        projects.append(p)
                        matched_project_ids.add(p.id)

            for p in projects:
                url = p.case_study_route if p.case_study_route else f"/work/{p.slug}"
                results.append({
                    "type": "project",
                    "title": p.title,
                    "description": p.short_description or "",
                    "url": url,
                    "category": p.category or "",
                })

        # 2. Published Services
        if type_filter in ("all", "services"):
            services = (
                Service.query.filter(
                    Service.status == "published",
                    or_(
                        Service.title.ilike(search_term),
                        Service.short_description.ilike(search_term),
                        Service.description.ilike(search_term),
                    ),
                )
                .limit(10)
                .all()
            )

            all_published_services = Service.query.filter_by(status="published").all()
            matched_service_ids = {s.id for s in services}

            for s in all_published_services:
                if s.id not in matched_service_ids:
                    techs = s.technologies or []
                    if any(q_lower in str(t).lower() for t in techs):
                        services.append(s)
                        matched_service_ids.add(s.id)

            for s in services:
                results.append({
                    "type": "service",
                    "title": s.title,
                    "description": s.short_description or "",
                    "url": "/services",
                })

        # 3. Published Blog Posts
        if type_filter in ("all", "blog"):
            posts = (
                BlogPost.query.filter(
                    BlogPost.status == "published",
                    or_(
                        BlogPost.title.ilike(search_term),
                        BlogPost.excerpt.ilike(search_term),
                        BlogPost.content.ilike(search_term),
                        BlogPost.category.ilike(search_term),
                    ),
                )
                .limit(10)
                .all()
            )

            all_published_posts = BlogPost.query.filter_by(status="published").all()
            matched_post_ids = {p.id for p in posts}

            for p in all_published_posts:
                if p.id not in matched_post_ids:
                    tags = p.tags or []
                    if any(q_lower in str(t).lower() for t in tags):
                        posts.append(p)
                        matched_post_ids.add(p.id)

            for p in posts:
                results.append({
                    "type": "blog",
                    "title": p.title,
                    "description": p.excerpt or "",
                    "url": f"/blog/{p.slug}",
                    "category": p.category or "",
                })

        # 4. Public Pages
        if type_filter in ("all", "pages"):
            for page in PUBLIC_PAGES:
                matches_title = q_lower in page["title"].lower()
                matches_desc = q_lower in page["description"].lower()
                matches_kw = any(q_lower in kw.lower() for kw in page.get("keywords", []))

                if matches_title or matches_desc or matches_kw:
                    results.append({
                        "type": "page",
                        "title": page["title"],
                        "description": page["description"],
                        "url": page["url"],
                    })

        # 5. Skills & Technologies
        if type_filter in ("all", "skills"):
            for skill in PUBLIC_SKILLS:
                matches_name = q_lower in skill["name"].lower()
                matches_desc = q_lower in skill["description"].lower()
                matches_cat = q_lower in skill["category"].lower()

                if matches_name or matches_desc or matches_cat:
                    results.append({
                        "type": "skill",
                        "title": skill["name"],
                        "description": skill["description"],
                        "url": skill["url"],
                        "category": skill["category"],
                    })

        return jsonify({
            "status": "ok",
            "query": query,
            "count": len(results),
            "results": results,
        }), 200

    except Exception as e:
        logger.error("Error during search execution: %s", str(e))
        return jsonify({
            "status": "error",
            "message": "Search is temporarily unavailable.",
        }), 500
