import json
from datetime import datetime, timezone
from sqlalchemy import func
from app.extensions import db


class BlogPost(db.Model):
    """
    BlogPost model representing articles and technical writing.
    Step 23: Blog / Content Management System.
    """
    __tablename__ = "blog_posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    excerpt = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=True)
    tags = db.Column(db.JSON, nullable=True)
    cover_image_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="draft", server_default="draft")
    featured = db.Column(db.Boolean, nullable=False, default=False, server_default=db.text("0"))
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )

    def get_tags_list(self):
        """Helper to return tags reliably as a list of strings."""
        if not self.tags:
            return []
        if isinstance(self.tags, list):
            return [str(t) for t in self.tags]
        if isinstance(self.tags, str):
            try:
                parsed = json.loads(self.tags)
                if isinstance(parsed, list):
                    return [str(t) for t in parsed]
            except Exception:
                pass
            return [t.strip() for t in self.tags.split(",") if t.strip()]
        return []

    def to_dict(self):
        """Return safe, structured dictionary representation."""
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt or "",
            "content": self.content or "",
            "category": self.category or "",
            "tags": self.get_tags_list(),
            "cover_image_url": self.cover_image_url or "",
            "status": self.status,
            "featured": bool(self.featured),
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<BlogPost id={self.id} slug='{self.slug}' status='{self.status}'>"
