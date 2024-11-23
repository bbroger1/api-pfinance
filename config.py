import logging

class Config(object):
    SQLALCHEMY_DATABASE_URI = (
        "postgresql+psycopg2://postgres:root@localhost:5432/pfinance"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = "pfinance_secret"
    UPLOAD_FOLDER = "app/extratos"
    ALLOWED_EXTENSIONS = ["txt", "csv", "xlsx", "pdf", "png", "jpg", "jpeg"]
    MAX_CONTENT_LENGTH = 16 * 1000 * 1000

    # Configuração do Logging para SQLAlchemy
    @staticmethod
    def init_app(app):
        logging.basicConfig()
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
