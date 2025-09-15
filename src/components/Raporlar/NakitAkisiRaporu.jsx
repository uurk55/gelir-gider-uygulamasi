// src/components/Raporlar/NakitAkisiRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { Bar } from 'react-chartjs-2';

function NakitAkisiRaporu() {
    const { nakitAkisiVerisi } = useFinans();

    const chartData = {
        labels: nakitAkisiVerisi.labels,
        datasets: [
            {
                label: 'Net Nakit Akışı',
                data: nakitAkisiVerisi.netAkim,
                // Bar rengini değere göre (pozitif/negatif) dinamik olarak ayarla
                backgroundColor: nakitAkisiVerisi.netAkim.map(val => 
                    val >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                ),
                borderColor: nakitAkisiVerisi.netAkim.map(val => 
                    val >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'
                ),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Son 6 Aylık Net Nakit Akışı (Gelir - Gider)',
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function(value) {
                        return '₺' + value.toLocaleString('tr-TR');
                    }
                }
            }
        }
    };

    return (
        <div className="card">
             <div style={{padding: '1rem'}}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}

export default NakitAkisiRaporu;