import logging
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import OperationalError
from app.extensions import db
from app.models.blog_post import BlogPost

logger = logging.getLogger(__name__)

blog_bp = Blueprint("blog", __name__)


@blog_bp.route("/blog", methods=["GET"])
def get_public_posts():
    """
    Retrieve all published blog posts.
    Sorted by published_at DESC, created_at DESC.
    Draft posts are excluded from this endpoint.
    """
    try:
        query = BlogPost.query.filter_by(status="published")

        # Optional category filter
        category = request.args.get("category", "").strip()
        if category:
            query = query.filter(BlogPost.category.ilike(category))

        # Optional search query across title, excerpt, content
        search = request.args.get("search", "").strip()
        if search:
            like_pat = f"%{search}%"
            query = query.filter(
                db.or_(
                    BlogPost.title.ilike(like_pat),
                    BlogPost.excerpt.ilike(like_pat),
                    BlogPost.content.ilike(like_pat),
                )
            )

        posts = query.order_by(
            BlogPost.published_at.desc(),
            BlogPost.created_at.desc(),
        ).all()

        return (
            jsonify({
                "status": "ok",
                "count": len(posts),
                "posts": [p.to_dict() for p in posts],
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database connection error fetching blog posts: %s", type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error retrieving blog posts: %s", type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve blog posts.",
            }),
            500,
        )


@blog_bp.route("/blog/<slug>", methods=["GET"])
def get_public_post_by_slug(slug):
    """
    Retrieve a single published blog post by unique slug.
    Draft posts return 404 to ensure drafts are never publicly accessible.
    """
    if not slug or not isinstance(slug, str):
        return jsonify({"status": "error", "message": "Valid slug is required."}), 400

    clean_slug = slug.strip().lower()

    try:
        post = BlogPost.query.filter_by(slug=clean_slug, status="published").first()
        if not post:
            return (
                jsonify({
                    "status": "error",
                    "message": "Blog post not found.",
                }),
                404,
            )

        return (
            jsonify({
                "status": "ok",
                "post": post.to_dict(),
            }),
            200,
        )
    except OperationalError as db_err:
        logger.warning("Database error fetching blog post slug '%s': %s", clean_slug, type(db_err).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Database connection is currently unavailable.",
            }),
            503,
        )
    except Exception as e:
        logger.error("Error fetching blog post '%s': %s", clean_slug, type(e).__name__)
        return (
            jsonify({
                "status": "error",
                "message": "Could not retrieve blog post.",
            }),
            500,
        )
