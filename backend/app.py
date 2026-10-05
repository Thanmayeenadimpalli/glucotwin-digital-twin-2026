import os
import sys

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask
from flask_cors import CORS
from backend.config import Config
from backend.routes.api import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes (supporting local Vite frontend development at localhost:5173 / localhost:3000)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return {
            "name": "GlucoTwin - Digital Twin API Server",
            "version": "1.0.0",
            "status": "Running",
            "documentation": "/api/health"
        }

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
