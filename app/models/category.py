from ..database import db


class Category(db.Model):
    __tablename__ = "categories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Integer, default=1)

    def __init__(self, name: str, status=1):
        self.name = name
        self.status = status

    def to_dict(self):
        return {"id": self.id, "name": self.name, "status": self.status}
