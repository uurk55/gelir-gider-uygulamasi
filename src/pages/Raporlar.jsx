// src/pages/Raporlar.jsx (YENİ RAPOR TABLOSU EKLENMİŞ, TAM VE EKSİKSİZ VERSİYON)
import { Line } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import { formatCurrency } from '../utils/formatters';
import { FaDownload } from 'react-icons/fa';

// YENİ: Kategori Detay Analizi için özel bir bileşen
function KategoriDetayTablosu() {
    // Bu rapor için TÜM giderlere ihtiyacımız var, filtrelenmemiş.
    const { giderler } = useFinans();
    
    // Toplam gideri bu bileşen içinde yeniden hesaplıyoruz
    const toplamTumGiderler = giderler.reduce((acc, gider) => acc + gider.tutar, 0);

    if (giderler.length === 0) {
        return <p style={{textAlign: 'center', padding: '1rem 0', color: 'var(--secondary-text)'}}>Analiz için gösterilecek gider verisi bulunmuyor.</p>;
    }

    const kategoriAnalizi = giderler.reduce((acc, gider) => {
        const { kategori, tutar } = gider;
        if (!acc[kategori]) {
            acc[kategori] = { toplam: 0, sayi: 0 };
        }
        acc[kategori].toplam += tutar;
        acc[kategori].sayi += 1;
        return acc;
    }, {});

    const analizListesi = Object.entries(kategoriAnalizi)
        .map(([kategori, { toplam, sayi }]) => ({
            kategori,
            toplam,
            sayi,
            ortalama: toplam / sayi,
            yuzde: toplamTumGiderler > 0 ? (toplam / toplamTumGiderler) * 100 : 0,
        }))
        .sort((a, b) => b.toplam - a.toplam);

    return (
        <table className="yillik-rapor-tablosu">
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th style={{textAlign: 'right'}}>Toplam Harcama</th>
                    <th style={{textAlign: 'right'}}>İşlem Sayısı</th>
                    <th style={{textAlign: 'right'}}>Ortalama Harcama</th>
                    <th style={{textAlign: 'right'}}>Yüzdelik Pay</th>
                </tr>
            </thead>
            <tbody>
                {analizListesi.map(item => (
                    <tr key={item.kategori}>
                        <td>{item.kategori}</td>
                        <td className="gider-renk">{formatCurrency(item.toplam)}</td>
                        <td>{item.sayi} adet</td>
                        <td>{formatCurrency(item.ortalama)}</td>
                        <td>%{item.yuzde.toFixed(1)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


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
    <div className="raporlar-sayfasi">
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
      
      <div className="card">
          <div className="card-header">
            <h2>Kategori Detay Analizi (Tüm Zamanlar)</h2>
          </div>
          <KategoriDetayTablosu />
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
    </div>
  );
}

export default Raporlar;