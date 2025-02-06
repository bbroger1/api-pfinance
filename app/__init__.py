from flask import Flask
from flask_cors import CORS
from .database import db
from config import Config

from .routes import main

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializa o logging
    # Config.init_app(app)
    
    CORS(app, origins=["*"], expose_headers=["Content-Type", "X-CSRFToken"])
    app.register_blueprint(main)

    db.init_app(app)

    return app
