from flask import jsonify
from operator import is_not
from app.models import Transaction, Category, SubCategory
from sqlalchemy import extract, Date, cast, desc, func, and_, case
from sqlalchemy.exc import OperationalError
from datetime import datetime, timedelta
from ..database import db

def get_balance():
    try:
        # Define o intervalo de 12 meses
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)

        # Query para calcular receitas, despesas e saldo
        results = (Transaction.query
                    .filter(
                        and_(
                            Transaction.transaction_date >= start_date, # type: ignore
                            Transaction.transaction_date <= end_date, # type: ignore
                            Transaction.transaction_date.is_not(None) # type: ignore
                        )
                    )
                    .with_entities(
                        func.sum(
                            case(
                                (Transaction.transaction_type == 'receita', Transaction.amount),  # Condição para receita # type: ignore
                                else_=0
                            )
                        ).label('total_receitas'), # type: ignore
                        func.sum(
                            case(
                                (Transaction.transaction_type == 'despesa', Transaction.amount),  # Condição para despesa # type: ignore
                                else_=0
                            )
                        ).label('total_despesas') # type: ignore
                    )
                    .first()
                    )

        if not results:            
            return None
        
        total_receitas, total_despesas = results
        saldo = total_receitas - total_despesas

        if saldo < 0:
            style= "background-color: red; color: white;"
        else:
            style= "background-color: #0eaec4; color: var(--dark-blue);"

        return {
                'income': format_currency(total_receitas) or 0,
                'expense': format_currency(total_despesas) or 0,
                'balance': format_currency(saldo),
                'style': style
            }

    except Exception as error:
        print("Error get_balance: ", error)
        return None

def get_balance_grafhic():
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)

        # Consulta para obter total de receitas e despesas nos últimos 12 meses
        resultados = (Transaction.query
                .filter(
                    and_(
                        Transaction.transaction_date >= start_date, # type: ignore
                        Transaction.transaction_date <= end_date, # type: ignore
                        Transaction.transaction_date.is_not(None) # type: ignore
                    )
                )
                .with_entities(
                    func.date_trunc('month', Transaction.transaction_date).label('mes'),  # type: ignore
                    func.sum(
                        case(
                            (Transaction.transaction_type == 'receita', Transaction.amount), # type: ignore
                            else_=0
                        )
                    ).label('total_receitas'), # type: ignore
                    func.sum(
                        case(
                            (Transaction.transaction_type == 'despesa', Transaction.amount), # type: ignore
                            else_=0
                        )
                    ).label('total_despesas') # type: ignore
                )
                .group_by(func.date_trunc('month', Transaction.transaction_date)) # type: ignore
                .order_by(func.date_trunc('month', Transaction.transaction_date)) # type: ignore
                .all()
        )

        # Preparar os dados para o gráfico
        meses = []
        receitas = []
        despesas = []

        # Criar um dicionário para mapear os meses e suas receitas e despesas
        for resultado in resultados:
            mes, total_receitas, total_despesas = resultado
            # Formatação do mês para português
            meses.append(mes.strftime("%B %Y").replace("January", "Janeiro").replace("February", "Fevereiro").replace("March", "Março")
                         .replace("April", "Abril").replace("May", "Maio").replace("June", "Junho")
                         .replace("July", "Julho").replace("August", "Agosto").replace("September", "Setembro")
                         .replace("October", "Outubro").replace("November", "Novembro").replace("December", "Dezembro"))
            receitas.append(total_receitas if total_receitas else 0)
            despesas.append(total_despesas if total_despesas else 0)

        # Meses em português
        meses_portugues = [
            "Dezembro 2023", "Janeiro 2024", "Fevereiro 2024", 
            "Março 2024", "Abril 2024", "Maio 2024", 
            "Junho 2024", "Julho 2024", "Agosto 2024", 
            "Setembro 2024", "Outubro 2024", "Novembro 2024"
        ]

        # Alinhando os dados corretamente
        final_receitas = [0] * 12
        final_despesas = [0] * 12

        for i, mes in enumerate(meses_portugues):
            if mes in meses:
                index = meses.index(mes)
                final_receitas[i] = receitas[index] / 100  # Dividir por 100
                final_despesas[i] = despesas[index] / 100  # Dividir por 100
            else:
                final_despesas[i] = 0

        return {
            "meses": meses_portugues,
            "receitas": final_receitas,
            "despesas": final_despesas
        }

    except Exception as e:
        print("Error get_balance_grafhic: ", e)
        return {"error": str(e)}

def get_balance_detail():
    try:
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)
        transactions = Transaction.query.all()

        income_dict = {}
        expense_dict = {}

        for transaction in transactions:
            if start_date <= transaction.transaction_date <= end_date:
                category_id = transaction.category_id
                subcategory_id = transaction.subcategory_id
                
                if transaction.transaction_type == 'receita':
                    if category_id not in income_dict:
                        income_dict[category_id] = {
                            'name': transaction.category.name,
                            'amount': 0,
                            'subcategories': {}
                        }
                    income_dict[category_id]['amount'] += transaction.amount

                    if subcategory_id not in income_dict[category_id]['subcategories']:
                        income_dict[category_id]['subcategories'][subcategory_id] = {
                            'name': transaction.subcategory.name,
                            'amount': 0,
                        }
                    income_dict[category_id]['subcategories'][subcategory_id]['amount'] += transaction.amount

                elif transaction.transaction_type == 'despesa':
                    if category_id not in expense_dict:
                        expense_dict[category_id] = {
                            'name': transaction.category.name,
                            'amount': 0,
                            'subcategories': {}
                        }
                    expense_dict[category_id]['amount'] += transaction.amount

                    if subcategory_id not in expense_dict[category_id]['subcategories']:
                        expense_dict[category_id]['subcategories'][subcategory_id] = {
                            'name': transaction.subcategory.name,
                            'amount': 0,
                        }
                    expense_dict[category_id]['subcategories'][subcategory_id]['amount'] += transaction.amount

        # Ordena as categorias por amount do maior para o menor
        sorted_incomes = sorted(income_dict.items(), key=lambda item: item[1]['amount'], reverse=True)
        sorted_expenses = sorted(expense_dict.items(), key=lambda item: item[1]['amount'], reverse=True)

        # Formata os totais e ordena as subcategorias
        for category in income_dict.values():
            # Ordena as subcategorias do maior para o menor
            sorted_subcategories = sorted(category['subcategories'].items(), key=lambda item: item[1]['amount'], reverse=True)
            category['subcategories'] = {k: v for k, v in sorted_subcategories}
            # Formata o total da categoria
            category['amount'] = format_currency(category['amount'])
            # Formata os valores das subcategorias
            for subcategory in category['subcategories'].values():
                subcategory['amount'] = format_currency(subcategory['amount'])

        for category in expense_dict.values():
            # Ordena as subcategorias do maior para o menor
            sorted_subcategories = sorted(category['subcategories'].items(), key=lambda item: item[1]['amount'], reverse=True)
            category['subcategories'] = {k: v for k, v in sorted_subcategories}
            # Formata o total da categoria
            category['amount'] = format_currency(category['amount'])
            # Formata os valores das subcategorias
            for subcategory in category['subcategories'].values():
                subcategory['amount'] = format_currency(subcategory['amount'])

        return {
            'incomes': dict(sorted_incomes),
            'expenses': dict(sorted_expenses)
        }

    except Exception as error:
        print("Error get_balance: ", error)
        return None

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
            Transaction.query.order_by(desc(cast(Transaction.transaction_date, Date))) # type: ignore
            .filter(
                extract("year", cast(Transaction.transaction_date, Date)) == year, # type: ignore
                extract("month", cast(Transaction.transaction_date, Date)) == month, # type: ignore
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
            desc(cast(Transaction.transaction_date, Date)) # type: ignore
        ).all()
        return transactions
    except Exception as error:
        print("Error get_all_transactions: ", error)
        return None

def filter_transactions_controller(filters):
    try:
        query = Transaction.query.order_by(desc(cast(Transaction.transaction_date, Date))) # type: ignore

        if filters:
            if "category_id" in filters:
                query = query.filter_by(category_id=filters["category_id"])
            if "subCategory_id" in filters:
                query = query.filter_by(subCategory_id=filters["subCategory_id"])
            if "transaction_type" in filters:
                query = query.filter_by(transaction_type=filters["transaction_type"])
            if "year" in filters:
                query = query.filter(
                    extract('year', cast(Transaction.transaction_date, Date)) == filters["year"] # type: ignore
                )
            if "month" in filters:
                query = query.filter(
                    extract('month', cast(Transaction.transaction_date, Date)) == filters["month"] # type: ignore
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

def format_currency(value: float) -> str:
    # Divide o valor por 100 para converter de centavos para reais
    value /= 100

    # Formata o valor com separadores de milhar e decimal
    formatted_value = f"{abs(value):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

    # Adiciona o sinal negativo se o valor for negativo
    if value < 0:
        return f"- R$ {formatted_value}"
    
    return f"R$ {formatted_value}"