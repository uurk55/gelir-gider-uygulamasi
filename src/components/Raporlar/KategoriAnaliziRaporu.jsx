// src/components/Raporlar/KategoriAnaliziRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { Bar } from 'react-chartjs-2';

function KategoriAnaliziRaporu() {
    const { kategoriHarcamaOzeti, kategoriRenkleri } = useFinans();

    const chartData = {
        labels: Object.keys(kategoriHarcamaOzeti),
        datasets: [
            {
                label: 'Kategoriye Göre Harcama',
                data: Object.values(kategoriHarcamaOzeti),
                backgroundColor: Object.keys(kategoriHarcamaOzeti).map(
                    kategori => kategoriRenkleri[kategori] || '#cccccc'
                ),
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        indexAxis: 'y', // Grafiği yatay (bar) yapar
        responsive: true,
        plugins: {
            legend: {
                display: false, // Tek bir dataset olduğu için efsaneyi gizleyebiliriz
            },
            title: {
                display: true,
                text: 'Seçili Tarih Aralığındaki Kategori Harcamaları',
                font: { size: 16 }
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '₺' + value.toLocaleString('tr-TR');
                    }
                }
            }
        }
    };

    // Eğer veri yoksa, bir mesaj göster
    if (Object.keys(kategoriHarcamaOzeti).length === 0) {
        return (
            <div className="card">
                <p style={{padding: '2rem', textAlign: 'center'}}>Seçili tarih aralığında gösterilecek kategori harcaması bulunmuyor.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div style={{padding: '1rem'}}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}

export default KategoriAnaliziRaporu;