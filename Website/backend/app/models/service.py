import json
from datetime import datetime, timezone
from sqlalchemy import func
from app.extensions import db


class Service(db.Model):
    """
    Service model representing services offered on the website.
    Step 21: Services Management CRUD.
    """
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    short_description = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    technologies = db.Column(db.JSON, nullable=True)
    featured = db.Column(db.Boolean, default=False, nullable=False, server_default=db.text("0"))
    status = db.Column(db.String(50), default="published", nullable=False, server_default="published")
    display_order = db.Column(db.Integer, default=0, nullable=False, server_default="0")
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

    def get_technologies_list(self):
        """Helper to return technologies reliably as a list of strings."""
        if not self.technologies:
            return []
        if isinstance(self.technologies, list):
            return [str(t) for t in self.technologies]
        if isinstance(self.technologies, str):
            try:
                parsed = json.loads(self.technologies)
                if isinstance(parsed, list):
                    return [str(t) for t in parsed]
            except Exception:
                pass
            return [t.strip() for t in self.technologies.split(",") if t.strip()]
        return []

    def to_dict(self):
        """Return safe, structured dictionary representation."""
        tech_list = self.get_technologies_list()
        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "short_description": self.short_description,
            "description": self.description or self.short_description,
            "technologies": tech_list,
            "tags": tech_list,  # Alias for frontend ServicesPage compatibility
            "featured": bool(self.featured),
            "status": self.status,
            "display_order": self.display_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Service id={self.id} slug='{self.slug}' title='{self.title}'>"
