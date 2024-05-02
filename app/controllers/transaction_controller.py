from app.models import Transaction, Category, SubCategory


def get_categories():
    try:
        categories = Category.query.all()
        return [category.to_dict() for category in categories]
    except Exception as error:
        print("Error get_transactions: ", error)
        return None


def get_subCategories(category_id):
    try:
        subcategories = SubCategory.query.filter_by(category_id=category_id).all()
        return [subcategory.to_dict() for subcategory in subcategories]
    except Exception as error:
        print("Error get_transctions: ", error)
        return None


def get_transactions():
    try:
        transactions = Transaction.query.all()
        return transactions
    except Exception as error:
        print("Error get_transctions: ", error)
        return None


def filter_transactions(filters):
    try:
        query = Transaction.query

        if filters:
            # Build the query based on filter criteria
            if "category_id" in filters:
                query = query.filter_by(category_id=filters["category_id"])
            if "subCategory_id" in filters:
                query = query.filter_by(subCategory_id=filters["subCategory_id"])
            if "transaction_type" in filters:
                query = query.filter_by(transaction_type=filters["transaction_type"])
            if "start_date" in filters and "end_date" in filters:
                query = query.filter(
                    Transaction.created_at >= filters["start_date"],
                    Transaction.created_at <= filters["end_date"],
                )

        transactions = query.all()
        return transactions
    except Exception as error:
        print("Error get_transctions: ", error)
        return None
