from app.models import Transaction, Category, SubCategory
from sqlalchemy import extract, Date, cast, desc, String
from ..database import db


def get_categories():
    try:
        categories = Category.query.order_by(Category.name).all()
        return [category.to_dict() for category in categories]
    except Exception as error:
        print("Error get_transactions: ", error)
        return None


def get_subCategories(category_id):
    try:
        subcategories = SubCategory.query.filter_by(category_id=category_id).order_by(SubCategory.name).all()
        return [subcategory.to_dict() for subcategory in subcategories]
    except Exception as error:
        print("Error get_transctions: ", error)
        return None


def get_transactions(year, month):
    try:
        transactions = (
            Transaction.query.order_by(desc(cast(Transaction.transaction_date, Date)))
            .filter(
                extract("year", cast(Transaction.transaction_date, Date)) == year,
                extract("month", cast(Transaction.transaction_date, Date)) == month,
            )
            .all()
        )
        return transactions
    except Exception as error:
        print("Error get_transactions: ", error)
        return None


def get_all_transactions():
    try:
        transactions = Transaction.query.order_by(
            desc(cast(Transaction.transaction_date, Date))
        ).all()
        return transactions
    except Exception as error:
        print("Error get_all_transactions: ", error)
        return None


def filter_transactions_controller(filters):
    try:
        query = Transaction.query.order_by(desc(cast(Transaction.transaction_date, Date)))

        if filters:
            if "category_id" in filters:
                query = query.filter_by(category_id=filters["category_id"])
            if "subCategory_id" in filters:
                query = query.filter_by(subCategory_id=filters["subCategory_id"])
            if "transaction_type" in filters:
                query = query.filter_by(transaction_type=filters["transaction_type"])
            if "year" in filters:
                query = query.filter(
                    extract('year', cast(Transaction.transaction_date, Date)) == filters["year"]
                )
            if "month" in filters:
                query = query.filter(
                    extract('month', cast(Transaction.transaction_date, Date)) == filters["month"]
                )

        transactions = query.all()
        return transactions
    except Exception as error:
        print("Error filter_transactions: ", error)
        return None


def save_transaction_controller(transaction_data):
    try:
        transaction = Transaction(**transaction_data)
        db.session.add(transaction)
        db.session.commit()

        return transaction
    except Exception as error:
        print("Error save_transctions: ", error)
        return None


def save_transaction_file_controller(transaction_data):
    try:
        db.session.add(transaction_data)
        db.session.commit()

        return True
    except Exception as error:
        print("Error save_transactions: ", error)
        return None


def delete_transaction_controller(id):
    try:
        transaction = Transaction.query.get(id)
        if transaction:
            db.session.delete(transaction)
            db.session.commit()
            return True
        else:
            return False
    except Exception as error:
        print("Error delete_transction: ", error)
        return False


def get_transaction_controller(id):
    try:
        transaction = Transaction.query.get(id)
        return transaction
    except Exception as error:
        print("Error get_transction: ", error)
        return None


def update_transaction_controller(transaction_data):
    try:
        transaction_id = transaction_data.get("id")

        if transaction_id:
            transaction = Transaction.query.get(transaction_id)

            if transaction:
                for key, value in transaction_data.items():
                    setattr(transaction, key, value)

                db.session.commit()
                return True
            else:
                return False
        else:
            return False
    except Exception as error:
        print("Error update_transaction: ", error)
        return False
