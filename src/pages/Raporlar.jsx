// src/pages/Raporlar.jsx (TARİH SEÇİCİLİ VE İYİLEŞTİRİLMİŞ NİHAİ VERSİYON)
import { Line } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import { formatCurrency } from '../utils/formatters';
import { FaDownload } from 'react-icons/fa';
import TarihSecici from '../components/TarihSecici'; // TarihSecici'yi geri getirdik

function Raporlar() {
  const { trendVerisi, yillikRaporVerisi, seciliYil, handleVeriIndir } = useFinans();

  if (!trendVerisi || !yillikRaporVerisi) {
      return <div>Yükleniyor...</div>;
  }

  const trendGrafikVerisi = {
    labels: trendVerisi.labels,
    datasets: [
      {
        label: 'Toplam Gelir',
        data: trendVerisi.gelirler,
        borderColor: 'rgba(39, 174, 96, 1)',
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Toplam Gider',
        data: trendVerisi.giderler,
        borderColor: 'rgba(192, 57, 43, 1)',
        backgroundColor: 'rgba(192, 57, 43, 0.2)',
        fill: true,
        tension: 0.4,
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
        text: 'Son 6 Aylık Finansal Trend',
        font: { size: 18, family: 'Roboto', weight: '600' },
        color: 'var(--primary-text)',
        padding: { bottom: 20 }
      },
      tooltip: {
         callbacks: {
            label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
         }
      }
    },
    scales: {
      y: { 
          beginAtZero: true,
          ticks: {
             callback: function(value) {
                // Y eksenindeki sayıları daha kısa formatta göstermek için (Örn: 10k ₺)
                if (value >= 1000) {
                    return `${value / 1000}k ₺`;
                }
                return formatCurrency(value);
             }
          }
      },
    }
  };

  return (
    <>
      {/* TarihSecici'yi isteğin üzerine en üste geri ekledik. */}
      {/* Bu, kullanıcının yılı değiştirmesine olanak tanır ve aşağıdaki tablo anında güncellenir. */}
      <TarihSecici />
      
      <div className="card">
        <div className="card-header">
           <h2>Rapor Araçları</h2>
        </div>
        <p style={{margin: '0 0 1rem 0', color: 'var(--secondary-text)'}}>Tüm işlem verilerinizi CSV formatında bilgisayarınıza indirebilirsiniz.</p>
        <button onClick={handleVeriIndir} className="primary-btn">
          <FaDownload />
          Tüm Verileri İndir (CSV)
        </button>
      </div>

      <div className="card">
        <div style={{ height: '400px', position: 'relative' }}>
          <Line options={trendGrafikOptions} data={trendGrafikVerisi} />
        </div>
      </div>

      {yillikRaporVerisi.aylar.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h2>{seciliYil} Yılı Özeti</h2>
          </div>
          <table className="yillik-rapor-tablosu">
            <thead>
              <tr>
                <th>Ay</th>
                <th style={{textAlign: 'right'}}>Toplam Gelir</th>
                <th style={{textAlign: 'right'}}>Toplam Gider</th>
                <th style={{textAlign: 'right'}}>Aylık Durum</th>
              </tr>
            </thead>
            <tbody>
              {yillikRaporVerisi.aylar.map(ayData => (
                <tr key={ayData.ay}>
                  <td>{ayData.ay}</td>
                  <td className="gelir-renk">{formatCurrency(ayData.gelir)}</td>
                  <td className="gider-renk">{formatCurrency(ayData.gider)}</td>
                  <td className={ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    {formatCurrency(ayData.bakiye)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Yıllık Toplam</strong></td>
                <td><strong>{formatCurrency(yillikRaporVerisi.toplamGelir)}</strong></td>
                <td><strong>{formatCurrency(yillikRaporVerisi.toplamGider)}</strong></td>
                <td className={yillikRaporVerisi.toplamBakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    <strong>{formatCurrency(yillikRaporVerisi.toplamBakiye)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', color: 'var(--secondary-text)'}}>
          <p>{seciliYil} yılında gösterilecek veri bulunmuyor.</p>
        </div>
      )}
    </>
  );
}

export default Raporlar;