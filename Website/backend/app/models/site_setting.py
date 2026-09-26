from datetime import datetime
from app.extensions import db


class SiteSetting(db.Model):
    """
    SiteSetting model for global website configuration.
    Stores key-value configurations with public visibility control.
    Never stores passwords, secrets, or database credentials.
    """
    __tablename__ = "site_settings"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False, index=True)
    value = db.Column(db.Text, nullable=True)
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def to_dict(self):
        """Returns standard serialized dictionary."""
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "is_public": self.is_public,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
