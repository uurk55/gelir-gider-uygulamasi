import { useFinans } from '../../context/FinansContext';
import { Line } from 'react-chartjs-2';
import AnalizKutusu from './AnalizKutusu'; // AnalizKutusu'nu da buraya taşıyacağız

const GenelTrendRaporu = () => {
    const { trendVerisi, yillikRaporVerisi, seciliYil, trendAnalizi } = useFinans();

    const lineChartData = {
        labels: trendVerisi.labels,
        datasets: [
            {
                label: 'Toplam Gelir', data: trendVerisi.gelirler,
                borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true, tension: 0.4
            },
            {
                label: 'Toplam Gider', data: trendVerisi.giderler,
                borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true, tension: 0.4
            }
        ]
    };

    return (
        <>
            <div className="card">
                <div className="card-header"><h2>Son 6 Aylık Finansal Trend</h2></div>
                <div style={{padding: '1rem'}}><Line data={lineChartData} /></div>
                <AnalizKutusu analiz={trendAnalizi} />
            </div>
            <div className="card">
                <div className="card-header"><h2>{seciliYil} Yılı Özeti</h2></div>
                <div className="tablo-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ay</th><th>Toplam Gelir</th><th>Toplam Gider</th><th>Aylık Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {yillikRaporVerisi.aylar.map(ayData => (
                                <tr key={ayData.ay}>
                                    <td>{ayData.ay}</td>
                                    <td className="gelir-renk">₺{ayData.gelir.toFixed(2)}</td>
                                    <td className="gider-renk">₺{ayData.gider.toFixed(2)}</td>
                                    <td className={ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                                        ₺{ayData.bakiye.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="toplam-satiri">
                                <td>Yıllık Toplam</td>
                                <td>₺{yillikRaporVerisi.toplamGelir.toFixed(2)}</td>
                                <td>₺{yillikRaporVerisi.toplamGider.toFixed(2)}</td>
                                <td>₺{yillikRaporVerisi.toplamBakiye.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </>
    );
};

export default GenelTrendRaporu;