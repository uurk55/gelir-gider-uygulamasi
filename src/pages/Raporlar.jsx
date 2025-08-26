import { Bar } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';

function Raporlar() {
  const { trendVerisi, yillikRaporVerisi, seciliYil, handleVeriIndir } = useFinans();

  // Güvenlik önlemi: Veri yüklenene kadar bekle
  if (!trendVerisi || !yillikRaporVerisi) {
      return <div>Yükleniyor...</div>;
  }

  const trendGrafikVerisi = {
    labels: trendVerisi.labels,
    datasets: [
      {
        label: 'Toplam Gelir',
        data: trendVerisi.gelirler,
        backgroundColor: 'rgba(39, 174, 96, 0.7)', // success-color tonu
        borderRadius: 4,
      },
      {
        label: 'Toplam Gider',
        data: trendVerisi.giderler,
        backgroundColor: 'rgba(192, 57, 43, 0.7)', // danger-color tonu
        borderRadius: 4,
      },
    ],
  };

  const trendGrafikOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Son 6 Aylık Finansal Trend`,
        font: { size: 18, family: 'Roboto' }, // Fontu genel temayla uyumlu yapalım
        color: 'var(--primary-text)'
      },
    },
    scales: {
      y: { beginAtZero: true },
    }
  };

  return (
    <>
      <TarihSecici />
      
      <div className="card">
        <h2>Rapor Araçları</h2>
        <p style={{margin: '1rem 0', color: 'var(--secondary-text)'}}>Seçili zaman aralığındaki tüm işlemlerinizi CSV formatında bilgisayarınıza indirebilirsiniz.</p>
        <button onClick={handleVeriIndir} className="disa-aktar-btn">
          Raporu İndir (CSV)
        </button>
      </div>

      <div className="card">
        {/* Grafiğin düzgün görünmesi için bir kapsayıcı ekleyelim */}
        <div style={{ height: '400px' }}>
          <Bar options={trendGrafikOptions} data={trendGrafikVerisi} />
        </div>
      </div>

      {yillikRaporVerisi.aylar.length > 0 ? (
        <div className="card">
          <h2>{seciliYil} Yılı Özeti</h2>
          <table className="yillik-rapor-tablosu">
            <thead>
              <tr>
                <th>Ay</th>
                <th>Toplam Gelir</th>
                <th>Toplam Gider</th>
                <th>Aylık Durum</th>
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
                <td className={yillikRaporVerisi.toplamBakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    <strong>{yillikRaporVerisi.toplamBakiye.toFixed(2)} ₺</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', color: 'var(--secondary-text)'}}>
          <p>Seçili yılda gösterilecek veri bulunmuyor.</p>
        </div>
      )}
    </>
  );
}

export default Raporlar;