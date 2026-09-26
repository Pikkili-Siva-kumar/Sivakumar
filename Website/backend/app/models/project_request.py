from datetime import datetime, timezone
from sqlalchemy import func
from app.extensions import db


class ProjectRequest(db.Model):
    """
    ProjectRequest model representing project inquiries submitted from the website.
    Optionally associated with an authenticated registered user via user_id.
    """
    __tablename__ = "project_requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    project_type = db.Column(db.String(100), nullable=False)
    project_name = db.Column(db.String(255), nullable=False)
    requirement = db.Column(db.Text, nullable=False)
    features = db.Column(db.Text, nullable=True)
    technology_preference = db.Column(db.Text, nullable=True)
    timeline = db.Column(db.String(100), nullable=True)
    budget_range = db.Column(db.String(100), nullable=True)
    additional_requirements = db.Column(db.Text, nullable=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    preferred_contact = db.Column(db.String(50), nullable=True)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="new", server_default="new")
    admin_notes = db.Column(db.Text, nullable=True)
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

    # Optional relationship to User model
    user = db.relationship("User", backref=db.backref("project_requests", lazy="dynamic"))

    def to_dict(self):
        """Return admin project request dictionary representation."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_type": self.project_type,
            "project_name": self.project_name,
            "requirement": self.requirement,
            "features": self.features,
            "technology_preference": self.technology_preference,
            "timeline": self.timeline,
            "budget_range": self.budget_range,
            "additional_requirements": self.additional_requirements,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "preferred_contact": self.preferred_contact,
            "message": self.message,
            "status": self.status,
            "admin_notes": self.admin_notes or "",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_client_dict(self):
        """
        Return safe project request dictionary for client dashboard.
        Strictly excludes admin_notes, credentials, and internal fields.
        """
        return {
            "id": self.id,
            "project_type": self.project_type,
            "project_name": self.project_name,
            "requirement": self.requirement,
            "features": self.features,
            "technology_preference": self.technology_preference,
            "timeline": self.timeline,
            "budget_range": self.budget_range,
            "additional_requirements": self.additional_requirements,
            "preferred_contact": self.preferred_contact,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<ProjectRequest id={self.id} project_name='{self.project_name}' status='{self.status}'>"
