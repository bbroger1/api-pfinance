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

$(document).ready(function () {
    balanceGrafhic()
});