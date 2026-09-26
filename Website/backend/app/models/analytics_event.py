from datetime import datetime, timezone
from sqlalchemy import func
from app.extensions import db


class AnalyticsEvent(db.Model):
    """
    AnalyticsEvent model representing first-party application events.
    Step 24: Real Analytics Foundation.
    Does NOT store sensitive credentials, secrets, or full user submissions.
    """
    __tablename__ = "analytics_events"

    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(100), nullable=False, index=True)
    path = db.Column(db.String(500), nullable=True)
    referrer = db.Column(db.String(1000), nullable=True)
    session_id = db.Column(db.String(128), nullable=True, index=True)
    user_id = db.Column(db.Integer, nullable=True)
    event_metadata = db.Column("metadata", db.JSON, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
    )

    def to_dict(self):
        """Return safe, non-sensitive dictionary representation."""
        return {
            "id": self.id,
            "event_type": self.event_type,
            "path": self.path,
            "referrer": self.referrer,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "metadata": self.event_metadata or {},
        }

    def __repr__(self):
        return f"<AnalyticsEvent id={self.id} type='{self.event_type}' path='{self.path}'>"
