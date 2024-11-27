from ..database import db
from sqlalchemy import Date, DateTime, Integer, String
from datetime import datetime
import datetime


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(String(255), nullable=False)
    category_id = db.Column(Integer, db.ForeignKey("categories.id"), nullable=False)
    subcategory_id = db.Column(
        db.Integer, db.ForeignKey("subcategories.id"), nullable=False
    )
    transaction_type: str = db.Column(String(100), nullable=False)
    amount: float = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(DateTime, default=datetime.datetime.now)
    transaction_date = db.Column(Date, nullable=False)
   

    # Define relationships
    category = db.relationship(
        "Category", backref=db.backref("transactions", lazy=True)
    )
    subcategory = db.relationship(
        "SubCategory", backref=db.backref("transactions", lazy=True)
    )

    def __init__(
        self,
        description,
        category_id,
        subcategory_id,
        transaction_type,
        amount,
        transaction_date,
    ):
        self.description = description
        self.category_id = category_id
        self.subcategory_id = subcategory_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.transaction_date = transaction_date

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "category": self.category.name,
            "subcategory": self.subcategory.name,
            "transaction_type": self.transaction_type,
            "amount": self.amount,
            "created_at": self.created_at,
            "transaction_date": self.transaction_date,
        }

    def to_dict_id(self):
        return {
            "id": self.id,
            "description": self.description,
            "category_id": self.category.id,
            "subcategory_id": self.subcategory.id,
            "transaction_type": self.transaction_type,
            "amount": self.amount,
            "created_at": self.created_at,
            "transaction_date": self.transaction_date,
        }
    
    
