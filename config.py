from flask_sqlalchemy import SQLAlchemy


class Config(object):
    SQLALCHEMY_DATABASE_URI = (
        "postgresql+psycopg2://postgres:root@localhost:5432/pfinance"
    )
