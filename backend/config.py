import os

class Config:
    DEBUG = os.environ.get("DEBUG", "True").lower() == "true"
    PORT = int(os.environ.get("PORT", 5000))
    SECRET_KEY = os.environ.get("SECRET_KEY", "glucotwin-dev-key")
    CORS_HEADERS = "Content-Type"
