from app.database import db
from enum import Enum
from flask_wtf import FlaskForm
from wtforms import SelectField, DecimalField, validators
import datetime

from app.models import category, subCategory


class TransactionType(Enum):
    receita = "income"
    despesa = "expense"


class TransactionForm(FlaskForm):
    category_id = SelectField("Categoria", validators=[validators.DataRequired()])
    subCategory_id = SelectField("Subcategoria", validators=[validators.DataRequired()])
    transaction_type = SelectField(
        "Tipo de Transação",
        choices=[("income", "Receita"), ("expense", "Despesa")],
        validators=[validators.DataRequired()],
    )
    amount = DecimalField(
        "Valor",
        validators=[validators.DataRequired(), validators.NumberRange(min=0.01)],
    )


class Transaction(db.Model):
    __tablename__ = "transaction"
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    subCategory_id = db.Column(
        db.Integer, db.ForeignKey("subcategories.id"), nullable=False
    )
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())

    # Define relationships
    category = db.relationship(
        "Category", backref=db.backref("transactions", lazy=True)
    )
    subCategory = db.relationship(
        "SubCategory", backref=db.backref("transactions", lazy=True)
    )

    def __init__(self, **kwargs):
        form = TransactionForm(**kwargs)

        if form.validate():
            self.category_id = form.category_id.data
            self.subCategory_id = form.subCategory_id.data
            self.transaction_type = form.transaction_type.data
            self.amount = form.amount.data
        else:
            raise ValueError(form.errors)
