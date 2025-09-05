// src/components/GenelBakis/GelirKaynaklariKarti.jsx

import { Bar } from 'react-chartjs-2';
import { useFinans } from '../../context/FinansContext';
import { formatCurrency } from '../../utils/formatters';

function GelirKaynaklariKarti() {
    // Bu bileşenin ihtiyacı olan verileri çekiyoruz
    const { 
        gelirGrafikVerisi, 
        filtrelenmisGelirler,
        seciliYil,
        seciliAy
    } = useFinans();

    // Eğer gösterilecek gelir yoksa, bu kartı hiç göstermeyelim.
    if (!filtrelenmisGelirler || filtrelenmisGelirler.length === 0) {
        return null;
    }

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

    // Grafik ayarlarını (options) doğrudan bu bileşene taşıdık
    const gelirGrafikOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true, text: `${ayAdi} Ayı Gelir Kaynakları`, padding: { bottom: 25 },
                font: { family: "'Roboto', sans-serif", size: 20, weight: '600' }, color: '#2f3542'
            },
            tooltip: {
                backgroundColor: '#2f3542', titleColor: '#ffffff', bodyColor: '#ffffff', borderRadius: 8, padding: 10,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.x !== null) {
                            label += formatCurrency(context.parsed.x);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { beginAtZero: true, grid: { color: '#dfe4ea', borderDash: [5, 5] }, ticks: { color: '#576574', font: { family: "'Roboto', sans-serif" } } },
            y: { grid: { display: false }, ticks: { color: '#2f3542', font: { family: "'Roboto', sans-serif", size: 13 } } }
        }
    };

    return (
        <div className="card">
            <Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} />
        </div>
    );
}

export default GelirKaynaklariKarti;