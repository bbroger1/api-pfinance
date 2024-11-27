const API_BASE_URL = "http://127.0.0.1:5000";
const ANO_ATUAL = getDates()[0];
const MES_ATUAL = getDates()[1];
let csrfToken;

// função que recupera os dados da index.html
function getDashboard() {
    try {
        fetch(`${API_BASE_URL}/get-dashboard`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    // Atualiza a URL e carrega o conteúdo da página index.html
                    history.pushState(null, '', `${API_BASE_URL}`);
                    loadPageContent('/'); // Função para carregar o conteúdo da nova página
                } else {
                    console.error("Error getDashboard [1]");
                }
            })
            .catch((error) => {
                console.error("Error getDashboard [2]: ", error);
            });
    } catch (error) {
        console.error("Error getDashboard [3]:", error);
    }
}

// função que recupera os dados da balance.html
function getTransactions(year, month) {
    try {
        fetch(`${API_BASE_URL}/transactions`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ year: year, month: month }),
            
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {           
                    // Atualiza os totais no resumo
                    document.getElementById('incomeDisplay').innerText = data.data.incomes;
                    document.getElementById('expenseDisplay').innerText = data.data.expenses;
                    document.getElementById('balanceDisplay').innerText = data.data.balance;

                    if (data.data.balance.charAt(0) == "-"){
                        document.getElementById('total').style.background = 'red';
                        document.getElementById('total').style.color = 'white';
                    } else {
                        document.getElementById('total').style.background = '#0eaec4';
                        document.getElementById('total').style.color = 'white';
                    }

                    // Seta o ano e o mês
                    document.getElementById('selectYear').value = year
                    document.getElementById('selectMonth').value = month
                    
                    // Limpa o corpo da tabela antes de adicionar novas linhas
                    const transactionList = document.getElementById('transaction-list');
                    transactionList.innerHTML = '';

                    // Verifica se há transações
                    if (data.data.transactions.length === 0) {
                        const noTransactionsRow = document.createElement('tr');
                        noTransactionsRow.innerHTML = `
                            <td colspan="7" class="text-center">Sem movimento</td>
                        `;
                        transactionList.appendChild(noTransactionsRow);
                    } else {
                        // Adiciona cada transação à tabela
                        data.data.transactions.forEach(transaction => {
                                const amount = Utils.formatCurrency(transaction.amount);
                            const transaction_date = Utils.formatDatetime(
                                transaction.transaction_date
                            );
                            const transactionType = Utils.formatTransactionType(
                                transaction.transaction_type
                            );
                            const row = document.createElement('tr');
                            row.id = transaction.id
                            row.innerHTML = `
                                <td class="date">${transaction_date}</td>
                                <td class="description">${transaction.description}</td>
                                <td class="category">${transaction.category}</td>
                                <td class="subcategory">${transaction.subcategory}</td>
                                <td class="text-center amount">${amount}</td>
                                <td class="text-center transaction_type">${transactionType}</td>
                                <td style="width: 10%" class="text-center">
                                    <img src="${API_BASE_URL}/static/assets/images/editar.png" alt="Editar Transação" width="23" title="Editar" class="cursor-pointer" 
                                        data-bs-toggle="modal" data-bs-target="#modal-edit" onclick="transactionEdit(${transaction.id})">
                                    <img src="${API_BASE_URL}/static/assets/images/deletar.png" alt="Remover Transação" width="20" title="Excluir" class="cursor-pointer" 
                                        data-bs-toggle="modal" data-bs-target="#modal-delete" onclick="transactionDelete(${transaction.id})">
                                </td>
                            `;
                            transactionList.appendChild(row);
                        });
                    }
                } else {
                    console.error("Error getTransactions [1]");
                }
            })
            .catch((error) => {
                console.error("Error getTransactions [2]: ", error);
            });
    } catch (error) {
        console.error("Error getTransactions [3]:", error);
    }
}

const Transaction = {
	all: [],

	async populateTransactions() {
		try {
			await fetch(`${API_BASE_URL}/transactions`, {
				method: "POST",
				headers: {
					"X-CSRFToken": csrfToken,
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
					"X-CSRFToken": csrfToken,
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
					"X-CSRFToken": csrfToken,
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
					"X-CSRFToken": csrfToken,
				},
				body: JSON.stringify(transaction),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
                        let year = transaction.transaction_date.getFullYear();
                        let month = transaction.transaction_date.getMonth() + 1;
                        getTransactions(year, month)                       
                        Form.clearFields();
						closeModal("modal");                        
					} else {
						console.error("Error adding transaction:", data.message);
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
					"X-CSRFToken": csrfToken,
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
					"X-CSRFToken": csrfToken,
				},
				body: JSON.stringify(transaction),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
						let date = new Date(transaction.transactionDate);
						let year = date.getFullYear();
						let month = date.getMonth() + 1;
                        getTransactions(year, month);						
                        FormEdit.clearFields();
						closeModal("modal-edit");				
					} else {
						console.error("Error updating transaction:", data.message);
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
					"X-CSRFToken": csrfToken,
				},
				body: formData,
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.status == "success") {
                        getTransactions(ANO_ATUAL, MES_ATUAL)
						closeModal("modal-import");
					} else {
						console.error("Error importing transactions:", data.message
						);
					}
				})
				.catch((error) => {
					console.error("Error importing transactions [2]:", error);
				});
		} catch (error) {
			console.error("Error importing transactions [3]:", error);
		}
	},
};

const Form = {
	validateFields(data) {     
        let { description, category, subcategory, amount, transactionType, transactionDate } = data;   
		if (!description || !category || !subcategory || !amount || !transactionDate || !transactionType) {
            throw new Error("Por favor, preencha todos os campos.");
        }
    },

	formatValues(data) {
        let amount = Utils.formatAmount(data.amount);
        let description = data.description;
        let category_id = data.category;
		let subcategory_id = data.subcategory;
        let transaction_type = data.transactionType;
        let transaction_date = data.transactionDate;

		return {
			description,
			category_id,
			subcategory_id,			
			amount,
            transaction_type,
            transaction_date
		};
	},

	clearFields() {
        document.getElementById("form-modal").reset();
    },
};

function submitForm(event) {
    event.preventDefault();

    try {
        let formData = new FormData(document.getElementById('form-modal'));
        let dataObject = {};
        formData.forEach((value, key) => { dataObject[key] = value })
        Form.validateFields(dataObject);
        let transaction = Form.formatValues(dataObject)
        Transaction.add(transaction);
    } catch (error) {
        alert(error);
    }
}

const FormEdit = {

	validateFields(data) {
		let { description, category, subcategory, amount, transactionType, transactionDate } = data;   
		if (!description || !category || !subcategory || !amount || !transactionDate || !transactionType) {
            throw new Error("Por favor, preencha todos os campos.");
        }
	},

	formatValues(data) {
		let selectedCategory = document.getElementById("editCategory");
		let selectedSubCategory = document.getElementById("editSubcategory");

		const categoryName = selectedCategory.options[selectedCategory.selectedIndex].text;
		const subcategoryName = selectedSubCategory.options[selectedSubCategory.selectedIndex].text;

		amount = Utils.formatAmount(data.amount);
		
		let transaction_acronym = ''
		if(data.transactionType === "receita"){
			transaction_acronym = 'R'
		} else{
			transaction_acronym = 'D'
		}

		return {
			id: data.transaction_id,
			description: data.description,
			category_id: data.category,
			category_name: categoryName,
			subcategory_id: data.subcategory,
			subcategory_name: subcategoryName,
			transaction_type: data.transactionType,
			transaction_date: data.transactionDate,
			transaction_acronym,
			amount,
		};
	},

	clearFields() {
		document.getElementById("form-modal-edit").reset();
	},	
};

function submitFormEdit(event) {
	event.preventDefault();

	try {
		let formData = new FormData(document.getElementById('form-modal-edit'));
		let dataObject = {};
        formData.forEach((value, key) => { dataObject[key] = value })
		FormEdit.validateFields(dataObject);
		let transaction = FormEdit.formatValues(dataObject);
		Transaction.update(transaction);		
	} catch (error) {
		alert(error);
	}
}

const FormImport = {
	validateFields(type, file) {
        if (type === "") {
            throw new Error("Por favor, selecione um tipo de importação.");
        }

        if (!file) {
            throw new Error("Por favor, selecione um arquivo.");
        }

        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            throw new Error("O arquivo deve ser um CSV.");
        }

        const maxSizeInBytes = 100 * 1024;
        if (file.size > maxSizeInBytes) {
            throw new Error("O tamanho do arquivo deve ser menor que 100 KB.");
        }
    },

	clearFields() {
		FormImport.type.value = "";
		FormImport.file.value = "";
	},
};

function submitFormImport(event) {
    event.preventDefault();

    try {        
        let type = document.getElementById("importType").value;
        let fileInput = document.getElementById("importFile");
        let file = fileInput.files[0];

        if (!file) {
            throw new Error("Por favor, selecione um arquivo [1].");
        }
        
        let formData = new FormData();
        formData.append("type", type);
        formData.append("file", file);

        // Validação dos campos
        FormImport.validateFields(type, file);

        Transaction.import(formData);			
    } catch (error) {
        alert("submitFormImport: " + error);
    }
}

const Modal = {
    fillModal() {
        try {
            var categorySelect = document.getElementById("category");
            categorySelect.innerHTML = "";
            fetch(`${API_BASE_URL}/categories`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.status == "success") {
                    var defaultOption = document.createElement("option");
                    defaultOption.text = "Selecione";
                    categorySelect.add(defaultOption);
                    data.data.forEach(function (category) {
                        var option = document.createElement("option");
                        option.text = category.name;
                        option.value = category.id;
                        categorySelect.add(option);
                    });
                } else {
                    console.error("Error getcategories [1]"); 
                }
            }).catch((error) => {
                console.error("Error getcategories [2]: ", error);
            });
        } catch (error) {
            console.error("Error getcategories [3]: ", error);
        }        
    },

    getCategories() {
        try {
            fetch(`${API_BASE_URL}/categories`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.status == "success") {
                        let categories = data.data;
                        return categories;
                    } else {
                        console.error("Error getCategories [1]");
                    }
                })
                .catch((error) => {
                    console.error("Error getCategories [2]: ", error);
                });
        } catch (error) {
            console.error("Error getCategories [3]:", error);
        }
    },

    updateSubcategories(categoryId, subcategoryId) {
        try {
            fetch(`${API_BASE_URL}/subcategories/` + categoryId, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                }
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.status == "success") {
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
                } else {
                    console.error("Error getSubCategories [1]");
                }                         
            })
            .catch((error) => {
                console.error("Error getSubCategories [2]: ", error);
            });
            
        } catch (error) {
            console.error("Error getSubCategories [3]: ", error);
        }
        
    }
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
			document.getElementById("editTransactionDate").value = formattedDate

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

// função para filtrar o ano e mes
function transactionFilter(){
    const selectedYear = document.getElementById('selectYear').value;
    const selectedMonth = document.getElementById('selectMonth').value;
    getTransactions(selectedYear, selectedMonth);
}

// função para trazer os dados do gráfico
function balanceGrafhic() {
    fetch('/balance-grafhic')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na conexão ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Acessando os dados corretamente
        const receitas = data.data.receitas.map(Number); // Convertendo para números
        const despesas = data.data.despesas.map(Number); // Convertendo para números
        const meses = data.data.meses; // Usar meses do backend

        // Calcular o resultado mensal e acumulado
        const resultadoMensal = receitas.map((rec, index) => rec - despesas[index]);
        const resultadoAcumulado = resultadoMensal.reduce((acc, curr, index) => {
            acc.push((acc[index - 1] || 0) + curr);
            return acc;
        }, []);

        const resultadoCores = resultadoAcumulado.map(value => value < 0 ? 'rgba(255, 105, 180, 0.5)' : 'rgba(0, 255, 0, 0.5)');

        const ctx = document.getElementById('task-area-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: meses, // Usar meses em português
                datasets: [
                    {
                        label: "Receita",
                        backgroundColor: "#727cf5",
                        borderColor: "#727cf5",
                        data: receitas,
                        type: 'bar' // Tipo de gráfico para receita
                    },
                    {
                        label: "Despesa",
                        backgroundColor: "red",
                        borderColor: "red",
                        data: despesas,
                        type: 'bar' // Tipo de gráfico para despesa
                    },
                    {
                        label: "Resultado Acumulado",
                        backgroundColor: resultadoCores, // Cor da coluna de resultado
                        borderColor: resultadoCores, // Cor da borda da coluna
                        data: resultadoAcumulado, // Dados do resultado acumulado
                        type: 'bar', // Tipo de gráfico para resultado
                        yAxisID: 'resultado' // Usar um eixo Y separado se necessário
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: "rgba(0,0,0,0.05)" }
                    },
                    y: {
                        ticks: { stepSize: 100000 }, // Ajustar conforme necessário
                        min: Math.min(...receitas, ...despesas, ...resultadoAcumulado) - 20000, // Valor mínimo ajustado
                        max: Math.max(...receitas, ...despesas, ...resultadoAcumulado) * 1.2 // Um pouco acima do máximo
                    },
                    resultado: {
                        position: 'right', // Posição do eixo Y para resultado, se necessário
                        ticks: { stepSize: 100000 } // Ajustar conforme necessário
                    }
                }
            }
        });

    })
    .catch(error => {
        console.error('Erro ao obter dados: ', error);
    });
}

// função para atualizar a pagina balance.html
function getPageBalance(){
    // Atualiza a URL e carrega o conteúdo da página balance.html
    history.pushState(null, '', `${API_BASE_URL}/balance`);
    loadPageContent('/balance'); // Função para carregar o conteúdo da nova página
}

// função para simular o spa carregando o conteudo das páginas
function loadPageContent(page) {
    fetch(page)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Cria um elemento temporário para extrair apenas o conteúdo do bloco 'content'
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Seleciona apenas o conteúdo do bloco 'content'
            const newContent = tempDiv.querySelector('.content-page').innerHTML;

            // Atualiza o conteúdo da página
            document.querySelector('#content').innerHTML = newContent;
            if(page == "/"){
                balanceGrafhic();
            } else if(page == "/balance"){
                getTransactions(ANO_ATUAL, MES_ATUAL)
            }
        })
        .catch(error => console.error("Error loading page content: ", error));
}

// funções para ajustar campos
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

// buscar o token csrf
function getCsrfToken() {
	var metaCsrfToken = document.getElementById("csrfToken");
	fetch(`${API_BASE_URL}/generate_token`)
		.then((response) => response.json())
		.then((data) => {
			metaCsrfToken.setAttribute("content", data.data);
            csrfToken = data.data
		})
		.catch((error) => {
			console.error(error);
		});
}

// buscar as datas atuais
function getDates(){
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1;

    let dates = [anoAtual, mesAtual]

    return dates
}

$(document).ready(function () {
    getCsrfToken()
    getDashboard()
});