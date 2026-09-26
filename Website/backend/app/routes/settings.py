import logging
from flask import Blueprint, jsonify
from app.models.site_setting import SiteSetting

logger = logging.getLogger(__name__)

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/site-settings", methods=["GET"])
def get_public_settings():
    """
    Public endpoint returning only settings marked is_public=True.
    Never exposes internal/admin-only settings, secrets, or credentials.
    """
    try:
        public_records = SiteSetting.query.filter_by(is_public=True).all()
        settings_dict = {}

        for rec in public_records:
            if rec.key == "maintenance_mode":
                settings_dict[rec.key] = (rec.value or "").strip().lower() in ("true", "1")
            else:
                settings_dict[rec.key] = rec.value or ""

        # Ensure safe defaults if database was not yet seeded
        if "maintenance_mode" not in settings_dict:
            settings_dict["maintenance_mode"] = False
        if "site_name" not in settings_dict:
            settings_dict["site_name"] = "Siva Kumar"

        return jsonify({
            "status": "ok",
            "settings": settings_dict,
        }), 200

    except Exception as e:
        logger.error("Error retrieving public site settings: %s", str(e))
        return jsonify({
            "status": "error",
            "message": "Failed to retrieve site settings.",
        }), 500
