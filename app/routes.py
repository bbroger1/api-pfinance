from flask import jsonify, Blueprint

from .controllers.transaction_controller import *

main = Blueprint("main", __name__)


@main.route("/pfinance/categories", methods=["GET", "POST"])
def list_categories():
    try:
        categories = get_categories()
        return response_json("success", "Lista de categorias", categories)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de categorias não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/subcategories/<int:category_id>", methods=["GET", "POST"])
def list_subCategories(category_id):
    try:
        subCategories = get_subCategories(category_id)
        return response_json("success", "Lista de Subcategorias", subCategories)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de subcategorias não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/transactions", methods=["GET", "POST"])
def list_transcations():
    try:
        transactions = None
        return response_json("success", "Lista de transações", transactions)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/transactions/filter", methods=["GET", "POST"])
def filter_transcations():
    try:
        transactions = None
        return response_json("success", "Lista de transações", transactions)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/transactions/insert", methods=["GET", "POST"])
def insert_transcation():
    try:
        transaction = None
        return response_json("success", "Lista de transações", transaction)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/transactions/update", methods=["GET", "POST"])
def update_transcation():
    try:
        transaction = None
        return response_json("success", "Lista de transações", transaction)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)


@main.route("/pfinance/transactions/delete", methods=["GET", "POST"])
def delete_transcation():
    try:
        transaction = None
        return response_json("success", "Lista de transações", transaction)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)


def response_json(status, message, data):
    return jsonify({"status": status, "message": message, "data": data})
