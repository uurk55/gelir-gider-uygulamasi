// GÜNCELLENMİŞ - src/pages/GenelBakis.jsx

import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2'; // Artık sadece Pie import ediliyor

function GenelBakis(props) {
  const navigate = useNavigate();
  
  // Props listesinden "trendVerisi" çıkarıldı
  const {
    seciliYil, setSeciliYil, seciliAy, setSeciliAy, mevcutYillar,
    toplamGelir, toplamGider, bakiye, filtrelenmisGiderler,
    kategoriOzeti, grafikVerisi, setGiderFiltreKategori,
    onayBekleyenAbonelikler, handleAbonelikOnayla, butceDurumlari
  } = props;
  
  const handleGrafikTiklama = (event, elements) => {
    if (!elements || elements.length === 0) return;
    const tiklananIndex = elements[0].index;
    const tiklananKategori = grafikVerisi.labels[tiklananIndex];
    setGiderFiltreKategori(tiklananKategori);
    navigate('/islemler');
  };

  // "trendGrafikVerisi" ve "trendGrafikOptions" ile ilgili kodlar buradan kaldırıldı

  return (
    <>
      {onayBekleyenAbonelikler.length > 0 && (
        <div className="bildirim-kutusu">
          <h3>Bu Ay Onay Bekleyen Abonelikler</h3>
          <ul>
            {onayBekleyenAbonelikler.map(abonelik => (
              <li key={abonelik.id}>
                <div className="bildirim-sol">
                  <span className="bildirim-aciklama">{abonelik.aciklama}</span>
                  <span className="bildirim-tutar">{abonelik.tutar.toFixed(2)} ₺</span>
                </div>
                <button onClick={() => handleAbonelikOnayla(abonelik)} className="onayla-btn">
                  Onayla ve Ekle
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="zaman-filtresi-kutusu">
        <div className="kontrol-grubu">
          <label>Yıl Seç:</label>
          <select value={seciliYil} onChange={(e) => setSeciliYil(parseInt(e.target.value))}>
            {mevcutYillar.length > 0 ? (mevcutYillar.map(yil => <option key={yil} value={yil}>{yil}</option>)) : (<option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>)}
          </select>
        </div>
        <div className="kontrol-grubu">
          <label>Ay Seç:</label>
          <select value={seciliAy} onChange={(e) => setSeciliAy(parseInt(e.target.value))}>
            {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((ay, index) => (<option key={index + 1} value={index + 1}>{ay}</option>))}
          </select>
        </div>
      </div>

      <div className="rapor-bolumu">
        <h2>Toplam Gelir: <span className="gelir-renk">{toplamGelir.toFixed(2)} ₺</span></h2>
        <h2>Toplam Gider: <span className="gider-renk">{toplamGider.toFixed(2)} ₺</span></h2>
        <h2>Bakiye: <span className={bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>{bakiye.toFixed(2)} ₺</span></h2>
      </div>

      {filtrelenmisGiderler.length > 0 && (
        <div className="analiz-bolumu">
          <h2>Kategori Harcama Dağılımı ({seciliAy}. Ay / {seciliYil})</h2>
          {/* YENİ BÜTÇE TAKİP BÖLÜMÜ */}
  {butceDurumlari.length > 0 && (
    <div className="analiz-bolumu">
      <h2>Aylık Bütçe Takibi</h2>
      <div className="butce-listesi">
        {butceDurumlari.map(butce => (
          <div key={butce.kategori} className="butce-kalemi">
            <div className="butce-bilgi">
              <span className="butce-kategori">{butce.kategori}</span>
              <span className="butce-rakamlar">
                {butce.harcanan.toFixed(2)} / {butce.limit.toFixed(2)} ₺
              </span>
            </div>
            <div className="progress-bar-konteyner">
              <div 
                className="progress-bar-dolgu" 
                style={{ width: `${butce.yuzde}%` }}
              ></div>
            </div>
            {butce.kalan < 0 ? (
              <span className="butce-durum gider-renk">{-butce.kalan.toFixed(2)} ₺ aşıldı!</span>
            ) : (
              <span className="butce-durum">{butce.kalan.toFixed(2)} ₺ kaldı</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
  {/* BÜTÇE TAKİP BÖLÜMÜ SONU */}
          <div className="analiz-icerik">
            <div className="ozet-tablosu">
              <ul>
                {Object.entries(kategoriOzeti).sort(([,a],[,b]) => b-a).map(([kategori, tutar]) => (
                  <li key={kategori}>
                    <span>{kategori}</span>
                    <span>{tutar.toFixed(2)} ₺</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grafik-konteyner">
              <Pie 
                data={grafikVerisi} 
                options={{
                  onClick: handleGrafikTiklama,
                  plugins: {
                    legend: {
                      onHover: (event) => { event.native.target.style.cursor = 'pointer'; },
                      onLeave: (event) => { event.native.target.style.cursor = 'default'; }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GenelBakis;