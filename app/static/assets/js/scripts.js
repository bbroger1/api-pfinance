const API_BASE_URL = "http://127.0.0.1:5000/pfinance";
const PAGE = document.querySelector("#page");

const Transaction = {
	all: [],

	async populateTransactions() {
		try {
			await fetch(`${API_BASE_URL}/transactions`, {
				method: "POST",
				headers: {
					"X-CSRFToken": this.setCsrfToken(),
				},
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						Transaction.all = data.data;
						return Transaction.all;
					} else {
						console.error("populateTransactions linha 21");
					}
				})
				.catch((error) => {
					console.error("populateTransactions error[2]: ", error);
				});
		} catch (error) {
			console.error("populateTransactions error[3]:", error);
		}
	},

	async allTransactions() {
		try {
			await fetch(`${API_BASE_URL}/transactions-all`, {
				method: "POST",
				headers: {
					"X-CSRFToken": this.setCsrfToken(),
				},
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						Transaction.all = data.data;
						return Transaction.all;
					} else {
						console.error("allTransactions linha 46");
					}
				})
				.catch((error) => {
					console.error("allTransactions error[2]: ", error);
				});
		} catch (error) {
			console.error("allTransactions error[3]:", error);
		}
	},

	async filterTransactions(formData) {
		try {
			await fetch(`${API_BASE_URL}/transactions/filter`, {
				method: "POST",
				headers: {
					"X-CSRFToken": this.setCsrfToken(),
				},
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						DOM.clearTransactions();
						Transaction.all = data.data;
						Transaction.all.forEach(DOM.addTransaction);
						DOM.updateBalance();
					} else {
						console.error("FilterTransactions linha 74");
					}
				})
				.catch((error) => {
					console.error("FilterTransactions error[2]: ", error);
				});
		} catch (error) {
			console.error("FilterTransactions error[3]:", error);
		}
	},

	async add(transaction) {
		try {
			await fetch(`${API_BASE_URL}/transactions/insert`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": this.setCsrfToken(),
				},
				body: JSON.stringify(transaction),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						closeModal("modal");
						App.reload();
					} else {
						console.error("Error adding transaction:", response);
					}
				})
				.catch((error) => {
					console.error("Error adding transaction[2]:", error);
				});
		} catch (error) {
			console.error("Error adding transaction[3]:", error);
		}
	},

	async remove(id) {
		try {
			await fetch(`${API_BASE_URL}/transactions/delete/${id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": this.setCsrfToken(),
				},
				body: JSON.stringify(id),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						closeModal("modal-delete");
						App.reload();
					} else {
						console.error("Error deleting transaction:", response);
					}
				})
				.catch((error) => {
					console.error("Error deleting transaction[2]:", error);
				});
		} catch (error) {
			console.error("Error deleting transaction[3]:", error);
		}
	},

	async update(transaction) {
		try {
			await fetch(`${API_BASE_URL}/transactions/update`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": this.setCsrfToken(),
				},
				body: JSON.stringify(transaction),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						closeModal("modal-edit");
						DOM.updateTransactionInDOM(transaction);
					} else {
						console.error("Error updating transaction:", response);
					}
				})
				.catch((error) => {
					console.error("Error updating transaction[2]:", error);
				});
		} catch (error) {
			console.error("Error updating transaction[3]:", error);
		}
	},

	async import(formData) {
		try {
			await fetch(`${API_BASE_URL}/transactions/import`, {
				method: "POST",
				headers: {
					"X-CSRFToken": this.setCsrfToken(),
				},
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						closeModal("modal-import");
						App.reload();
					} else {
						console.error(
							"Error importing transactions:",
							data.message
						);
					}
				})
				.catch((error) => {
					console.error("Error importing transaction[2]:", error);
				});
		} catch (error) {
			console.error("Error importing transaction[3]:", error);
		}
	},

	setCsrfToken() {
		let csrfToken = document
			.querySelector('meta[name="csrfToken"]')
			.getAttribute("content");
		return csrfToken;
	},

	incomes() {
		let income = 0;

		Transaction.all.forEach((transaction) => {
			if (transaction.transaction_type == "receita") {
				income += Number(transaction.amount);
			}
		});

		return income;
	},

	expenses() {
		let expense = 0;

		Transaction.all.forEach((transaction) => {
			if (transaction.transaction_type == "despesa") {
				expense += Number(transaction.amount);
			}
		});

		return expense;
	},

	total() {
		return Transaction.incomes() - Transaction.expenses();
	},
};

// Substituir os dados do HTML com os do JS
const DOM = {
	transactionsContainer: document.querySelector("#data-table tbody"),
	transactionsContainerAll: document.querySelector("#data-table-all tbody"),

	addTransaction(transaction) {		
		const tr = document.createElement("tr");
		tr.innerHTML = DOM.innerHTMLTransaction(transaction);
		tr.id = transaction.id;

		if (PAGE.value == 1) {
			DOM.transactionsContainer.appendChild(tr);
		} else {
			DOM.transactionsContainerAll.appendChild(tr);
		}
	},

	updateTransactionInDOM(transaction) {
		const row = document.getElementById(`${transaction.id}`);
		const transactionType = Utils.formatTransactionType(
			transaction.transaction_acronym
		);

		const amount = Utils.formatCurrency(transaction.amount)

		if (row) {
			row.querySelector(".description").textContent = transaction.description;
			row.querySelector(".category").textContent = transaction.category_name;
			row.querySelector(".subcategory").textContent = transaction.subcategory_name;
			row.querySelector(".transaction_type").innerHTML = transactionType;
			row.querySelector(".amount").textContent = amount;
		}
	},

	innerHTMLTransaction(transaction) {
		const amount = Utils.formatCurrency(transaction.amount);
		const transaction_date = Utils.formatDatetime(
			transaction.transaction_date
		);
		const transactionType = Utils.formatTransactionType(
			transaction.transaction_type
		);

		const html = `
			<td class="date">${transaction_date}</td>
			<td class="description">${transaction.description}</td>
			<td class="category">${transaction.category}</td>
			<td class="subcategory">${transaction.subcategory}</td>
			<td class="text-center amount">${amount}</td>
			<td class="text-center transaction_type">${transactionType}</td>
			<td class="text-center">
				<img src="./assets/img/editar.png" alt="Editar Transação" width="23" title="Editar" class="cursor-pointer" 
					data-bs-toggle="modal" data-bs-target="#modal-edit" onclick="transactionEdit(${transaction.id})">
				<img src="./assets/img/deletar.png" alt="Remover Transação" width="20" title="Excluir" class="cursor-pointer" 
					data-bs-toggle="modal" data-bs-target="#modal-delete" onclick="transactionDelete(${transaction.id})">
			</td>
		`;

		return html;
	},

	updateBalance() {
		document.getElementById("incomeDisplay").innerHTML =
			Utils.formatCurrency(Transaction.incomes());

		document.getElementById("expenseDisplay").innerHTML =
			Utils.formatCurrency(Transaction.expenses());

		document.getElementById("totalDisplay").innerHTML =
			Utils.formatCurrency(Transaction.total());

		cardTotal = document.getElementById("total");
		if (Transaction.total() < 0) {
			cardTotal.style.backgroundColor = "red";
		} else {
			cardTotal.style.backgroundColor = "#0eaec4";
		}
	},

	clearTransactions() {
		if (PAGE.value == 1) {
			DOM.transactionsContainer.innerHTML = "";
		} else {
			DOM.transactionsContainerAll.innerHTML = "";
		}
	},
};

const Utils = {
	formatAmount(value) {
		value = Number(value) * 100;
		//value = Number(value);
		return value;
	},

	formatDate(date) {
		const splittedDate = date.split("-");
		return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
	},

	formatDatetime(datetime) {
		let dateTimeString = datetime;
		let dateObject = new Date(dateTimeString);

		// Ajuste de fuso horário
		let timezoneOffset = dateObject.getTimezoneOffset() * 60 * 1000;
		dateObject = new Date(dateObject.getTime() + timezoneOffset);

		let formattedDate = dateObject.toLocaleDateString("pt-BR");

		return formattedDate;
	},

	formatCurrency(currency) {
		value = Number(currency) / 100;
		value = value.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
		return value;
	},

	formatTransactionType(type) {
		if (type == "despesa" || type == "D") {
			return "<span style='color: red'>D</span>";
		}

		return "<span style='color: blue'>R</span>";
	},
};

const Form = {
	description: document.querySelector("input#description"),
	category: document.querySelector("select#category"),
	subcategory: document.querySelector("select#subcategory"),
	transactionType: document.querySelector("select#transactionType"),
	amount: document.querySelector("input#amount"),
	date: document.querySelector("input#date"),

	getValues() {
		return {
			description: Form.description.value,
			category_id: Form.category.value,
			subcategory_id: Form.subcategory.value,
			transaction_type: Form.transactionType.value,
			amount: Form.amount.value,
			date: Form.date.value,
		};
	},

	validateFields() {
		const {
			description,
			category_id,
			subcategory_id,
			transaction_type,
			amount,
			date,
		} = Form.getValues();

		if (
			description.trim() === "" ||
			amount.trim() === "" ||
			category_id.trim() === "" ||
			subcategory_id.trim() === "" ||
			transaction_type.trim() === "" ||
			date.trim() === ""
		) {
			throw new Error("Por favor, Preencha os todos os campos");
		}
	},

	formatValues() {
		let {
			description,
			category_id,
			subcategory_id,
			transaction_type,
			amount,
		} = Form.getValues();

		amount = Utils.formatAmount(amount);

		//date = Utils.formatDate(date);

		return {
			description,
			category_id,
			subcategory_id,
			transaction_type,
			amount,
		};
	},

	clearFields() {
		Form.description.value = "";
		Form.category.value = "";
		Form.subcategory.value = "";
		Form.transactionType.value = "";
		Form.amount.value = "";
		Form.date.value = "";
	},

	submit(event) {
		event.preventDefault();

		try {
			Form.validateFields();
			const transaction = Form.formatValues();
			Transaction.add(transaction);
			Form.clearFields();
		} catch (error) {
			alert(error);
		}
	},
};

const FormEdit = {
	id: document.querySelector("input#editTransactionId"),
	description: document.querySelector("input#editDescription"),
	category: document.querySelector("select#editCategory"),
	subcategory: document.querySelector("select#editSubcategory"),
	transactionType: document.querySelector("select#editTransactionType"),
	amount: document.querySelector("input#editAmount"),
	date: document.querySelector("input#editDate"),

	getValues() {
		return {
			id: FormEdit.id.value,
			description: FormEdit.description.value,
			category_id: FormEdit.category.value,
			subcategory_id: FormEdit.subcategory.value,
			transaction_type: FormEdit.transactionType.value,
			amount: FormEdit.amount.value,
			date: FormEdit.date.value,
		};
	},

	validateFields() {
		const {
			description,
			category_id,
			subcategory_id,
			transaction_type,
			amount,
			date,
		} = FormEdit.getValues();

		if (
			description.trim() === "" ||
			amount.trim() === "" ||
			category_id.trim() === "" ||
			subcategory_id.trim() === "" ||
			transaction_type.trim() === "" ||
			date.trim() === ""
		) {
			throw new Error("Por favor, Preencha os todos os campos");
		}
	},

	formatValues() {
		let {
			id,
			description,
			category_id,
			subcategory_id,
			transaction_type,
			amount,
		} = FormEdit.getValues();

		amount = Utils.formatAmount(amount);

		const categoryName = FormEdit.category.options[FormEdit.category.selectedIndex].text;
		const subcategoryName = FormEdit.subcategory.options[FormEdit.subcategory.selectedIndex].text;
		let transaction_acronym = ''
		if(transaction_type === "receita"){
			transaction_acronym = 'R'
		} else{
			transaction_acronym = 'D'
		}

		return {
			id,
			description,
			category_id,
			category_name: categoryName,
			subcategory_id,
			subcategory_name: subcategoryName,
			transaction_type,
			transaction_acronym,
			amount,
		};
	},

	clearFields() {
		FormEdit.description.value = "";
		FormEdit.category.value = "";
		FormEdit.subcategory.value = "";
		FormEdit.transactionType.value = "";
		FormEdit.amount.value = "";
		FormEdit.date.value = "";
	},

	submit(event) {
		event.preventDefault();

		try {
			FormEdit.validateFields();
			const transaction = FormEdit.formatValues();
			Transaction.update(transaction);
			FormEdit.clearFields();
		} catch (error) {
			alert(error);
		}
	},
};

const FormImport = {
	type: document.getElementById("importType"),
	file: document.getElementById("importFile"),

	getValues() {
		return {
			type: FormImport.type.value,
			file: FormImport.file.files[0],
		};
	},

	validateFields() {
		const { type, file } = FormImport.getValues();

		if (type.trim() === "" || !file) {
			throw new Error("Por favor, Preencha os todos os campos");
		}
	},

	clearFields() {
		FormImport.type.value = "";
		FormImport.file.value = "";
	},

	submit(event) {
		event.preventDefault();

		try {
			FormImport.validateFields();
			const transactions = FormImport.getValues();
			const formData = new FormData();
			formData.append("type", transactions.type);
			formData.append("file", transactions.file);
			Transaction.import(formData);
			FormImport.clearFields();
		} catch (error) {
			alert(error);
		}
	},
};

//Preencher o modal com as categorias
function fillModal() {
	var categorySelect = document.getElementById("category");
	categorySelect.innerHTML = "";

	fetch(`${API_BASE_URL}/categories`, {
		method: "POST",
		headers: {
			"X-CSRFToken": Transaction.setCsrfToken(),
		},
	})
		.then((response) => response.json())
		.then((data) => {
			var defaultOption = document.createElement("option");
			defaultOption.text = "Selecione";
			categorySelect.add(defaultOption);
			data.data.forEach(function (category) {
				var option = document.createElement("option");
				option.text = category.name;
				option.value = category.id;
				categorySelect.add(option);
			});
		});
}

//buscar as categorias no banco
// function getCategories() {
// 	var editCategorySelect = document.getElementById("editCategory");
// 	editCategorySelect.innerHTML = "";
//     try {
// 		fetch(`${API_BASE_URL}/categories`, {
// 			method: "POST",
// 			headers: {
// 				"X-CSRFToken": Transaction.setCsrfToken(),
// 			},
// 		})
// 			.then((response) => response.json())
// 			.then((data) => {
// 				if (data.status == "success") {
// 					let categories = data.data;
// 					return categories;
// 				} else {
// 					console.error("getCategories linha 600");
// 				}
// 			})
// 			.catch((error) => {
// 				console.error("getCategories error[2]: ", error);
// 			});
// 	} catch (error) {
// 		console.error("getCategories error[3]:", error);
// 	}
// }

//preencher as subcategorias ao selecionar a categoria
function updateSubcategories(categoryId, subcategoryId) {
    fetch(`${API_BASE_URL}/subcategories/` + categoryId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        }
    })
    .then((response) => response.json())
    .then((data) => {
        var subcategorySelect = document.getElementById(subcategoryId);
        subcategorySelect.innerHTML = "";
        var defaultOption = document.createElement("option");
        defaultOption.text = "Selecione";
        subcategorySelect.add(defaultOption);
        
        data.data.forEach(function (subcategory) {
            var option = document.createElement("option");
            option.text = subcategory.name;
            option.value = subcategory.id;
            subcategorySelect.add(option);
        });
    });
}

// Adiciona o evento para a seleção da categoria de lançamento
document.getElementById("category").addEventListener("change", function () {
    var categoryId = this.value;
    updateSubcategories(categoryId, "subcategory");
});

// Adiciona o evento para a seleção da categoria de edição
document.getElementById("editCategory").addEventListener("change", function () {
    var categoryId = this.value;
    updateSubcategories(categoryId, "editSubcategory");
});

//preencher o extrato com os dados do ano e mês corrente na abertura da página
function fillDate() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	if (PAGE.value == 1) {
		const selectYear = document.getElementById("selectYear");
		const selectMonth = document.getElementById("selectMonth");

		for (let i = 0; i < selectYear.options.length; i++) {
			if (selectYear.options[i].value == currentYear) {
				selectYear.options[i].selected = true;
				break;
			}
		}

		for (let i = 0; i < selectMonth.options.length; i++) {
			if (selectMonth.options[i].value == currentMonth) {
				selectMonth.options[i].selected = true;
				break;
			}
		}
	} else {
		const selectYearAll = document.getElementById("selectYearAll");
		const selectMonthAll = document.getElementById("selectMonthAll");
		for (let i = 0; i < selectYearAll.options.length; i++) {
			if (selectYearAll.options[i].value == currentYear) {
				selectYearAll.options[i].selected = true;
				break;
			}
		}

		for (let i = 0; i < selectMonthAll.options.length; i++) {
			if (selectMonthAll.options[i].value == currentMonth) {
				selectMonthAll.options[i].selected = true;
				break;
			}
		}
	}
}

//apresentar os dados conforme o filtro
if (PAGE.value === "1") {
	document
		.getElementById("selectYear")
		.addEventListener("change", function () {
			let year = this.value;
			let month = document.getElementById("selectMonth").value;

			const formData = new FormData();
			formData.append("year", year);
			formData.append("month", month);
			Transaction.filterTransactions(formData);
		});

	document
		.getElementById("selectMonth")
		.addEventListener("change", function () {
			let month = this.value;
			let year = document.getElementById("selectYear").value;

			const formData = new FormData();
			formData.append("year", year);
			formData.append("month", month);
			Transaction.filterTransactions(formData);
		});
} else {
	document
		.getElementById("selectYearAll")
		.addEventListener("change", function () {
			let year = this.value;
			let month = document.getElementById("selectMonthAll").value;

			const formData = new FormData();
			formData.append("year", year);
			formData.append("month", month);
			Transaction.filterTransactions(formData);
		});

	document
		.getElementById("selectMonthAll")
		.addEventListener("change", function () {
			let month = this.value;
			let year = document.getElementById("selectYearAll").value;

			const formData = new FormData();
			formData.append("year", year);
			formData.append("month", month);
			Transaction.filterTransactions(formData);
		});
}

//buscar o token csrf
function getCsrfToken() {
	var metaCsrfToken = document.getElementById("csrfToken");
	fetch(`${API_BASE_URL}/generate_token`)
		.then((response) => response.json())
		.then((data) => {
			metaCsrfToken.setAttribute("content", data.data);
		})
		.catch((error) => {
			console.error(error);
		});
}

//modal confirmação de exclusão
function transactionDelete(id) {
	var inputId = document.getElementById("btn-confirm-delete");
	inputId.onclick = function () {
		Transaction.remove(id);
	};
}

//modal para editar a transação
async function transactionEdit(id) {
	try {
		const transactionResponse = await fetch(
			`${API_BASE_URL}/transactions/${id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": csrfToken,
				},
				body: JSON.stringify(id),
			}
		);

		if (transactionResponse.status === 200) {
			const transactionData = await transactionResponse.json();

			document.getElementById("editTransactionId").value = transactionData.data.id;
			document.getElementById("editDescription").value = transactionData.data.description;

			let amount = Number(transactionData.data.amount) / 100;
			document.getElementById("editAmount").value = amount;

			let dateObj = new Date(transactionData.data.transaction_date);
			let formattedDate = dateObj.toISOString().split('T')[0];
			document.getElementById("editDate").value = formattedDate

			const transactionTypeSelect = document.getElementById("editTransactionType");
			const transactionTypes = [
				{ value: "receita", text: "Receita" },
				{ value: "despesa", text: "Despesa" },
			];
			transactionTypeSelect.innerHTML = "";
			for (const transactionTypeOption of transactionTypes) {
				const optionElement = document.createElement("option");
				optionElement.value = transactionTypeOption.value;
				optionElement.text = transactionTypeOption.text;

				if (transactionTypeOption.value === transactionData.data.transaction_type.toLowerCase()) {
					optionElement.selected = true;
				}

				transactionTypeSelect.appendChild(optionElement);
			}

			const categoriesResponse = await fetch(
				`${API_BASE_URL}/categories`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-CSRFToken": csrfToken,
					}
				}
			);

			if (categoriesResponse.status === 200) {
				const res = await categoriesResponse.json();
				const categoriesData = res.data;
				const categorySelect = document.getElementById("editCategory");
				categorySelect.innerHTML = ""

				for (const category of categoriesData) {
					const optionElement = document.createElement("option");
					optionElement.value = category.id;
					optionElement.text = category.name;

					if (category.id === transactionData.data.category_id) {
						optionElement.selected = true;
					}

					categorySelect.appendChild(optionElement);
				}

				const selectedCategoryId = transactionData.data.category_id;

				const subcategoriesResponse = await fetch(
					`${API_BASE_URL}/subcategories/${selectedCategoryId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-CSRFToken": csrfToken,
						}
					}
				);

				if (subcategoriesResponse.status === 200) {
					const res = await subcategoriesResponse.json();
					const subcategoriesData = res.data;
					const subcategorySelect =
						document.getElementById("editSubcategory");

					subcategorySelect.innerHTML = "";

					for (const subcategory of subcategoriesData) {
						const optionElement = document.createElement("option");
						optionElement.value = subcategory.id;
						optionElement.text = subcategory.name;

						if (
							subcategory.id ===
							transactionData.data.subcategory_id
						) {
							optionElement.selected = true;
						}

						subcategorySelect.appendChild(optionElement);
					}
				} else {
					console.error(
						"Error fetching subcategories:",
						subcategoriesResponse
					);
				}
			} else {
				console.error("Error fetching categories:", categoriesResponse);
			}
		} else {
			console.error("Error fetching transaction:", transactionResponse);
		}
	} catch (error) {
		console.error("Error loading transaction:", error);
	}
}

//função para fechar modal
function closeModal(id) {
	let modalElement = document.getElementById(id);
	const dismissButton = modalElement.querySelector(
		'[data-bs-dismiss="modal"]'
	);
	const clickEvent = new Event("click", {
		bubbles: true,
		cancelable: true,
	});
	dismissButton.dispatchEvent(clickEvent);
}

const App = {
	async init() {
		if (PAGE.value === "1") {
			await Transaction.populateTransactions();
			DOM.updateBalance();
		} else {
			await Transaction.allTransactions();
		}

		const transactions = Transaction.all;

		transactions.forEach(DOM.addTransaction);

		fillDate();
		getCsrfToken();
	},

	async reload() {
		DOM.clearTransactions();
		await App.init();
	},
};

App.init();
