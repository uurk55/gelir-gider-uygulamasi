import { useFinans } from '../../context/FinansContext';
import { Bar } from 'react-chartjs-2'; // Grafik için Bar import edelim
import AnalizKutusu from './AnalizKutusu';

const NakitAkisiRaporu = () => {
    // DÜZELTME: 'nakitAkisiOzeti'ni de context'ten istiyoruz.
    const { nakitAkisiVerisi, nakitAkisiOzeti } = useFinans(); 

    const chartData = {
        labels: nakitAkisiVerisi.labels,
        datasets: [{
            label: 'Net Nakit Akışı',
            data: nakitAkisiVerisi.netAkim,
            backgroundColor: nakitAkisiVerisi.netAkim.map(akim => akim >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
            borderColor: nakitAkisiVerisi.netAkim.map(akim => akim >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
            borderWidth: 1
        }]
    };

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h2>Son 6 Aylık Nakit Akışı</h2>
                </div>
                <div style={{ padding: '1rem' }}>
                    <Bar data={chartData} />
                </div>
            </div>
            
            {/* Artık nakitAkisiOzeti tanımlı olduğu için bu satır hata vermeyecek */}
            <AnalizKutusu analiz={nakitAkisiOzeti} />
        </>
    );
};

export default NakitAkisiRaporu;