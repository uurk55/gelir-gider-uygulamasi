import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici'; // YENİ: TarihSecici bileşenini içe aktar

function GenelBakis() {
  const navigate = useNavigate();

  const {
    seciliYil, seciliAy,
    hesapDurumlari,
    toplamGelir,
    toplamGider,
    filtrelenmisGiderler, filtrelenmisGelirler,
    kategoriOzeti, grafikVerisi, setGiderFiltreKategori,
    onayBekleyenAbonelikler, handleAbonelikOnayla, butceDurumlari,
    gelirGrafikVerisi
    // Not: Artık hesapları ayrı ayrı gösterdiğimiz için toplamGelir, toplamGider, toplamBakiye'yi buradan silebiliriz.
  } = useFinans();

  const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

  const handleGrafikTiklama = (event, elements) => {
    if (!elements || elements.length === 0) return;
    const tiklananIndex = elements[0].index;
    const tiklananKategori = grafikVerisi.labels[tiklananIndex];
    setGiderFiltreKategori(tiklananKategori);
    navigate('/islemler');
  };

  const gelirGrafikOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${ayAdi} Ayı Gelir Kaynakları`
      },
    },
    scales: {
      x: { beginAtZero: true }
    }
  };

const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleGrafikTiklama,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
                enabled: true,
                backgroundColor: '#2f3542', // Değişken yerine direkt rengin kendisi
                titleColor: '#ffffff',     // Değişken yerine direkt rengin kendisi
                bodyColor: '#ffffff',      // Değişken yerine direkt rengin kendisi
                borderRadius: 8,
                padding: 10,
                animation: {
                    duration: 400,
                    easing: 'easeOutCubic'
                }
            }
    }
  };

  return (
    <>
      {/* 1. BİLDİRİM BÖLÜMÜ */}
      {onayBekleyenAbonelikler.length > 0 && (
        <div className="bildirim-kutusu">
          <h3>Bu Ay Onay Bekleyen Abonelikler</h3>
          <ul>
            {onayBekleyenAbonelikler.map(abonelik => (
              <li key={abonelik.id}>
                <div className="bildirim-sol"><span className="bildirim-aciklama">{abonelik.aciklama}</span><span className="bildirim-tutar">{abonelik.tutar.toFixed(2)} ₺</span></div>
                <button onClick={() => handleAbonelikOnayla(abonelik)} className="onayla-btn">Onayla ve Ekle</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TarihSecici />

      <div className="card">
          <h2>{ayAdi} Ayı Özeti</h2>
          <div className="aylik-ozet-kutusu">
              <div className="ozet-kalem">
                  <span className="ozet-baslik">Toplam Gelir</span>
                  <span className="ozet-tutar gelir-renk">+ {toplamGelir.toFixed(2)} ₺</span>
              </div>
              <div className="ozet-kalem">
                  <span className="ozet-baslik">Toplam Gider</span>
                  <span className="ozet-tutar gider-renk">- {toplamGider.toFixed(2)} ₺</span>
              </div>
              <div className="ozet-kalem">
                  <span className="ozet-baslik">Aylık Durum</span>
                  <span className={`ozet-tutar ${toplamGelir - toplamGider >= 0 ? 'gelir-renk' : 'gider-renk'}`}>{(toplamGelir - toplamGider).toFixed(2)} ₺</span>
              </div>
          </div>
          <hr className="kart-ici-ayirici" />
          <div className="hesap-durumlari-listesi">
              <h3>Hesap Durumları</h3>
              {hesapDurumlari.map(hesap => (
                  <div key={hesap.id} className="hesap-satiri">
                      <span className="hesap-adi">{hesap.ad}</span>
                      <span className={`hesap-bakiye ${hesap.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}`}>{hesap.bakiye.toFixed(2)} ₺</span>
                  </div>
              ))}
          </div>
      </div>

      <div className="analiz-bolumu-grid">
        {filtrelenmisGiderler.length > 0 && (
          <div className="card">
            <h2>{ayAdi} Ayı Harcama Dağılımı</h2>
            <div className="analiz-icerik">
              <div className="ozet-tablosu">
                {/* GÜNCELLENDİ: Liste yapısı ve class isimleri değişti */}
                <ul className="harcama-listesi">
                    {Object.entries(kategoriOzeti)
                        .sort(([, a], [, b]) => b - a)
                        .map(([kategori, tutar], index) => (
                            <li key={kategori}>
                                <div className="kategori-sol-taraf">
                                    <span 
                                        className="renk-noktasi" 
                                        style={{ backgroundColor: grafikVerisi.datasets[0].backgroundColor[index] }}
                                    ></span>
                                    <span className="kategori-adi">{kategori}</span>
                                </div>
                                <span className="kategori-tutari">{tutar.toFixed(2)} ₺</span>
                            </li>
                        ))}
                </ul>
              </div>
              <div className="grafik-konteyner">
                 {/* GÜNCELLENDİ: Pie chart yeni options objesini kullanıyor */}
                <Pie data={grafikVerisi} options={pieChartOptions} />
              </div>
          </div>
          </div>
        )}

        {filtrelenmisGiderler.length > 0 && ( // Alt alta durması için filtrelenmisGiderler kontrolü eklendi
          <div className="card">
            <Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} />
          </div>
        )}
      </div>

      {/* 4. BÜTÇE TAKİP BÖLÜMÜ */}
      {butceDurumlari.length > 0 && (
        <div className="card">
          <h2>Aylık Kategori Limitleri</h2>
          <div className="butce-listesi">
            {butceDurumlari.map(butce => (
              <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                
                {/* 1. Satır: Kategori Adı ve Yüzde */}
                <div className="butce-bilgi">
                  <span className="butce-kategori">{butce.kategori}</span>
                  <span className="butce-yuzde">(%{butce.yuzdeRaw ? butce.yuzdeRaw.toFixed(0) : butce.yuzde.toFixed(0)})</span>
                </div>

                {/* 2. Satır: Progress Bar */}
                <div className="progress-bar-konteyner">
                  <div className="progress-bar-dolgu" style={{ width: `${butce.yuzde}%` }}></div>
                </div>

                {/* 3. Satır: Rakamlar ve Kalan Durumu */}
                <div className="butce-detay-yeni">
                  <span className="butce-rakamlar">{butce.harcanan.toFixed(2)} ₺ / {butce.limit.toFixed(2)} ₺</span>
                  {butce.kalan < 0
                      ? (<span className="butce-durum gider-renk">{(-butce.kalan).toFixed(2)} ₺ aşıldı!</span>)
                      : (<span className="butce-durum">{butce.kalan.toFixed(2)} ₺ kaldı</span>)
                  }
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default GenelBakis;