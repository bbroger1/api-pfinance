const API_BASE_URL = "http://127.0.0.1:5000";
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
function getTransactions() {
    try {
        fetch(`${API_BASE_URL}/transactions`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    console.log(data);
                    // Atualiza a URL e carrega o conteúdo da página balance.html
                    history.pushState(null, '', `${API_BASE_URL}/balance`);
                    loadPageContent('/balance'); // Função para carregar o conteúdo da nova página
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
            }
        })
        .catch(error => console.error("Error loading page content: ", error));
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

$(document).ready(function () {
    getCsrfToken()
    getDashboard()
});