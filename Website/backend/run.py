import os
import sys

# Ensure backend directory is in sys.path when running from any location
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = app.config.get("PORT", 5000)
    debug = app.config.get("DEBUG", False)
    env = app.config.get("FLASK_ENV", "development")
    print(f"Starting Flask API server on port {port} (env={env}, debug={debug})...")
    app.run(host="0.0.0.0", port=port, debug=debug)
