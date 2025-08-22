// GÜNCELLENMİŞ ve DÜZELTİLMİŞ - src/pages/Raporlar.jsx

import { Bar } from 'react-chartjs-2';

function Raporlar(props) {
  const { trendVerisi, yillikRaporVerisi, seciliYil, handleVeriIndir } = props;

  const trendGrafikVerisi = {
    labels: trendVerisi.labels,
    datasets: [
      {
        label: 'Toplam Gelir',
        data: trendVerisi.gelirler,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Toplam Gider',
        data: trendVerisi.giderler,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const trendGrafikOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Son 6 Aylık Trend (${trendVerisi.labels[5]} ${seciliYil})`,
        font: { size: 18 }
      },
    },
    scales: {
        y: { 
            beginAtZero: true 
        }
    }
  };

  // return bloğu artık tek bir ana <div> ile başlıyor ve bitiyor
  return (
    <div> 
         {/* YENİ RAPOR ARAÇLARI BÖLÜMÜ */}
    <div className="rapor-araclari">
      <h2>Rapor Araçları</h2>
      <button onClick={handleVeriIndir} className="disa-aktar-btn">
        Seçili Ayın Raporunu İndir (CSV)
      </button>
    </div>
 <div className="raporlar-sayfasi"></div>
    <div className="analiz-bolumu">
      <Bar options={trendGrafikOptions} data={trendGrafikVerisi} />
    </div>
      <div className="analiz-bolumu">
        <Bar options={trendGrafikOptions} data={trendGrafikVerisi} />
      </div>

      <div className="analiz-bolumu" style={{marginTop: '30px'}}>
        <h2>{seciliYil} Yılı Özeti</h2>
        {yillikRaporVerisi.aylar.length > 0 ? (
          <table className="yillik-rapor-tablosu">
            <thead>
              <tr>
                <th>Ay</th>
                <th>Toplam Gelir</th>
                <th>Toplam Gider</th>
                <th>Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {yillikRaporVerisi.aylar.map(ayData => (
                <tr key={ayData.ay}>
                  <td>{ayData.ay}</td>
                  <td className="gelir-renk">{ayData.gelir.toFixed(2)} ₺</td>
                  <td className="gider-renk">{ayData.gider.toFixed(2)} ₺</td>
                  <td className={ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    {ayData.bakiye.toFixed(2)} ₺
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Yıllık Toplam</strong></td>
                <td><strong>{yillikRaporVerisi.toplamGelir.toFixed(2)} ₺</strong></td>
                <td><strong>{yillikRaporVerisi.toplamGider.toFixed(2)} ₺</strong></td>
                <td><strong>{yillikRaporVerisi.toplamBakiye.toFixed(2)} ₺</strong></td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p>Seçili yılda gösterilecek veri bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}

export default Raporlar;