from flask import jsonify, Blueprint, render_template, request
from flask_wtf.csrf import generate_csrf
from werkzeug.utils import secure_filename
import csv, os, decimal, tabula, pandas as pd
from config import Config

from .controllers.transaction_controller import *

main = Blueprint("main", __name__)

@main.route("/")
def index():
    balance = get_balance()
    balance_detail = get_balance_detail()
    return render_template("index.html", balance=balance, detail=balance_detail)

@main.route("/get-dashboard", methods=["POST"])
def get_dashboard():
    try:
        balance = get_balance()
        balance_detail = get_balance_detail()
        return response_json("success", "dados para o gráfico", [balance, balance_detail])
    except Exception as error:
        print("Error: ", error)
        message = "Os dados não puderam ser recuperados"
        return response_json("error", message, data=None)

@main.route("/balance-grafhic", methods=["GET"])
def balanceGrafhic():
    try:
        balance_grafhic = get_balance_grafhic()
        return response_json("success", "dados para o gráfico", balance_grafhic)
    except Exception as error:
        print("Error: ", error)
        message = "Dados para o gráfico não puderam ser recuperados"
        return response_json("error", message, data=None)

@main.route("/balance")
def balance():
    return render_template("balance.html")

@main.route("/transactions", methods=["POST"])
def list_transactions():
    try:
        data = request.get_json()
        year = data.get('year')
        month = data.get('month')
        result = get_transactions(year, month)
        return response_json("success", "Lista de transações", result)
    except Exception as error:
        print("Error: ", error)
        return response_json("error", "Lista de transações não pode ser recuperada [2]", data=None)
    
@main.route("/transactions/filter", methods=["POST"])
def filter_transactions():
    try:
        year = request.form.get("year")
        month = request.form.get("month")

        filters = {"year": year, "month": month}

        result = filter_transactions_controller(filters)

        transactions = []

        if result:
            for item in result:
                transaction_dict = item.to_dict()
                transactions.append(transaction_dict)
        #print(transactions[0])
        return response_json("success", "Lista de transações 1", transactions)
    except Exception as error:
        print("Error filter_transactions: ", error)
        message = "Lista de transações não pode ser recuperada"
        return response_json("error", message, data=None)
    
@main.route("/transactions/insert", methods=["POST"])
def save_transaction():
    try:
        transaction_data = request.get_json()
        print(transaction_data)
        if save_transaction_controller(transaction_data):
            return response_json("success", "Transação cadastrada com sucesso", "")

        return response_json("error", "Transação não pode ser registrada.", data=None)
    except Exception as error:
        print("Error: ", error)
        return response_json(
            "error", "Transação não pode ser registrada.[2]", data=None
        )

@main.route("/transactions/<int:id>", methods=["POST"])
def get_transaction(id):
    try:
        transaction = ""
        result = get_transaction_controller(id)
        if result:
            transaction = result.to_dict_id()

        return response_json("success", "Transação recuperada com sucesso", transaction)
    except Exception as error:
        print("Error: ", error)
        return response_json("error", "Transação não pode ser recuperada.", data=None)

@main.route("/transactions/update", methods=["POST"])
def update_transaction():
    try:
        transaction_data = request.get_json()
        update_transaction_controller(transaction_data)
        return response_json("success", "Transação editada com sucesso", "")
    except Exception as error:
        print("Error: ", error)
        return response_json("error", "Transação não pode ser editada", data=None)

@main.route("/transactions/delete/<int:id>", methods=["POST"])
def delete_transaction(id):
    try:
        delete = delete_transaction_controller(id)
        if delete:
            return response_json("success", "Transação excluída com sucesso", "")
        return response_json("error", "Transação não pode ser excluída", "")
    except Exception as error:
        print("Error delete: ", error)
        return response_json("error", "Transação não pode ser excluída [2]", "")

@main.route("/balance-total")
def balance_total():
    return render_template("balance-total.html")

@main.route("/transactions-all", methods=["POST"])
def list_all_transactions():
    try:
        result = get_all_transactions()
        transactions = []

        if result:
            for item in result:
                transaction_dict = item.to_dict()
                transactions.append(transaction_dict)

        return response_json("success", "Lista de transações", transactions)
    except Exception as error:
        print("Error: ", error)
        return response_json(
            "error", "Lista de transações não pode ser recuperada", data=None
        )

@main.route("/transactions/import", methods=["POST"])
def import_transaction():
    try:
        type_import = request.form.get("type")        

        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files["file"]
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        path = upload_file(file, type_import)
        delimiter = ";"

        if type_import == 'cartao':
            # extract_tables(path)
            result = manager_file_card(path, delimiter)
        else:
            result = manager_file(path, delimiter)

        if result:
            return response_json("success", "Importação realizada com sucesso", "")

        return response_json("error", "Importação não pode ser realizada [1]", "")

    except Exception as error:
        print(f"Error import_transaction: {error}")
        return response_json("error", "Importação não pode ser realizada [2]", "")

@main.route("/categories", methods=["POST"])
def list_categories():
    try:
        categories = get_categories()
        return response_json("success", "Lista de categorias", categories)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de categorias não pode ser recuperada"
        return response_json("error", message, data=None)

@main.route("/subcategories/<int:category_id>", methods=["POST"])
def list_subCategories(category_id):
    try:
        subCategories = get_subCategories(category_id)
        return response_json("success", "Lista de Subcategorias", subCategories)
    except Exception as error:
        print("Error: ", error)
        message = "Lista de subcategorias não pode ser recuperada"
        return response_json("error", message, data=None)

@main.route("/generate_token", methods=["GET"])
def get_csrf_token():
    csrf_token = generate_csrf()
    return response_json("success", "Token gerado com sucesso", csrf_token)

def manager_file(path, delimiter):
    try:
        dados_csv = []
        lancamentos_a_pular = {"Saldo Anterior", "Saldo do dia", "Saldo", "S A L D O"}
        with open(path, newline="", encoding="utf-8") as file:
            leitor_csv = csv.reader(file, delimiter=delimiter)
            next(leitor_csv)
            for linha in leitor_csv:
                data = linha[0].strip()
                lancamento = linha[1].strip()
                detalhes = linha[2].strip()
                numero_documento = linha[3].strip()
                valor = abs(decimal.Decimal(linha[4].replace(".", "").replace(",", ".")))
                valor *= 100
                tipo_lancamento = linha[5].strip()
                categoria = 4
                subcategoria = 40

                if lancamento in lancamentos_a_pular:
                    continue  # Pular a linha
                
                if tipo_lancamento == "Saída":
                    tipo_lancamento = "despesa"
                elif tipo_lancamento == "Entrada":
                    tipo_lancamento = "receita"

                #print(f"{data} - {tipo_lancamento} - {categoria} - {valor}")

                category = Category.query.get(categoria)
                subcategory = SubCategory.query.get(subcategoria)

                if category and subcategory:
                    transaction = Transaction(
                        category_id=category.id,
                        subcategory_id=subcategory.id,
                        transaction_type=tipo_lancamento,
                        amount=valor,
                        description=f"{lancamento} {detalhes} {numero_documento}",
                        transaction_date=data,
                    )

                #print(transaction)
                save_transaction_file_controller(transaction)

        return True
    except csv.Error as e:
        print("Erro ao ler o arquivo CSV (manager_file)", e)
        return False
    except Exception as e:
        print("Erro manager_file:", e)
        return False

def manager_file_card(path, delimiter):
    try:
        dados_csv = []
        lancamentos_a_pular = {"Saldo Anterior", "Saldo do dia", "Saldo", "S A L D O"}
        with open(path, newline="", encoding="utf-8") as file:
            leitor_csv = csv.reader(file, delimiter=delimiter)
            next(leitor_csv)
            for linha in leitor_csv:
                data = linha[0].strip()
                lancamento = linha[1].strip()
                detalhes = linha[2].strip()
                numero_documento = linha[3].strip()
                valor = abs(decimal.Decimal(linha[4].replace(".", "").replace(",", ".")))
                valor *= 100
                tipo_lancamento = linha[5].strip()
                categoria = 4
                subcategoria = 40

                if lancamento in lancamentos_a_pular:
                    continue  # Pular a linha
                
                if tipo_lancamento == "Saída":
                    tipo_lancamento = "despesa"
                elif tipo_lancamento == "Entrada":
                    tipo_lancamento = "receita"

                #print(f"{data} - {tipo_lancamento} - {categoria} - {valor}")

                category = Category.query.get(categoria)
                subcategory = SubCategory.query.get(subcategoria)

                if category and subcategory:
                    transaction = Transaction(
                        category_id=category.id,
                        subcategory_id=subcategory.id,
                        transaction_type=tipo_lancamento,
                        amount=valor,
                        description=f"{lancamento} {detalhes} {numero_documento}",
                        transaction_date=data,
                    )

                #print(transaction)
                save_transaction_file_controller(transaction)

        return True
    except csv.Error as e:
        print("Erro ao ler o arquivo CSV (manager_file)", e)
        return False
    except Exception as e:
        print("Erro manager_file:", e)
        return False


def upload_file(file, type_import):
    if not file:
        return False

    try:
        # Define o caminho de upload
        path = os.path.join(Config.UPLOAD_FOLDER, type_import, secure_filename(file.filename))

        # Garante que o diretório exista
        os.makedirs(os.path.dirname(path), exist_ok=True)

        # Verifica o tipo de arquivo
        if type_import == 'conta':
            # Para arquivos CSV
            file_content = file.read()
            try:
                data_list = file_content.decode('utf-8').split('\n')
            except UnicodeDecodeError:
                data_list = file_content.decode('latin-1').split('\n')

            with open(path, 'w', encoding='utf-8') as f:
                for linha in data_list:
                    if linha.strip():
                        f.write(linha)

        elif type_import == 'cartao':
            with open(path, 'wb') as f:
                f.write(file.read())

        return path
    except UnicodeDecodeError as e:
        print("Erro na decodificação do arquivo:", e)
        return False
    except IndexError as e:
        print("Índice fora do intervalo da lista:", e)
        return False
    except Exception as e:
        print("Erro no upload do arquivo:", e)
        return False

def extract_tables(uploaded_pdf_path):
    # Extrair tabelas usando tabula
    tables = tabula.read_pdf(uploaded_pdf_path, pages='all', multiple_tables=True)  # type: ignore

    # Concatenar todas as tabelas em um único DataFrame
    all_tables = pd.concat([pd.DataFrame(table) for table in tables], ignore_index=True)

    # Criar o nome do CSV baseado no nome do PDF, sem a extensão
    base_filename = os.path.splitext(os.path.basename(uploaded_pdf_path))[0]  # Remove a extensão
    csv_filename = f"{base_filename}.csv"  # Adiciona a extensão .csv
    csv_path = os.path.join(os.path.dirname(uploaded_pdf_path), csv_filename)  # Salva no mesmo diretório
    
    # Salvar todas as tabelas em um único arquivo CSV
    all_tables.to_csv(csv_path, sep=';', index=False)

    return csv_path  # Retorne o caminho do arquivo CSV gerado

def response_json(status, message, data):
    return jsonify({"status": status, "message": message, "data": data})
