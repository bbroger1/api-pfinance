from ..database import db


class SubCategory(db.Model):
    __tablename__ = "subcategories"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"))
    status = db.Column(db.Integer, default=1)

    category = db.relationship(
        "Category", backref=db.backref("subcategories", lazy=True)
    )

    def __init__(self, name: str, category, status=1):
        self.name = name
        self.category = category
        self.status = status

    def to_dict(self):
        return {"id": self.id, "name": self.name, "status": self.status}
