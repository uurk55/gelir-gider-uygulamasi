// GÜNCELLENMİŞ VE NİHAİ - src/pages/GenelBakis.jsx

import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';

function GenelBakis(props) {
  const navigate = useNavigate();
  
  const {
    seciliYil, setSeciliYil, seciliAy, setSeciliAy, mevcutYillar,
    toplamGelir, toplamGider, bakiye, filtrelenmisGiderler, filtrelenmisGelirler,
    kategoriOzeti, grafikVerisi, setGiderFiltreKategori,
    onayBekleyenAbonelikler, handleAbonelikOnayla, butceDurumlari,
    gelirGrafikVerisi
  } = props;
  
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

      {/* 2. ZAMAN FİLTRESİ VE RAPOR BÖLÜMÜ */}
      <div className="rapor-bolumu">
  <div className="rapor-kalemleri">
    <div className="rapor-kalem">
      <h2>Toplam Gelir:</h2>
      <span className="gelir-renk">{toplamGelir.toFixed(2)} ₺</span>
    </div>
    <div className="rapor-kalem">
      <h2>Toplam Gider:</h2>
      <span className="gider-renk">{toplamGider.toFixed(2)} ₺</span>
    </div>
    <div className="rapor-kalem">
      <h2>Bakiye:</h2>
      <span className={bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>{bakiye.toFixed(2)} ₺</span>
    </div>
  </div>
  <div className="rapor-eylem">
    <button onClick={() => navigate('/islemler')} className="hizli-eylem-butonu-kucuk">
      + Yeni İşlem
    </button>
  </div>
</div>

      {/* 3. GELİR VE GİDER ANALİZ IZGARASI (ARTIK EN ÜSTTE) */}
      <div className="analiz-bolumu-grid">
        {filtrelenmisGiderler.length > 0 && (
          <div className="analiz-karti">
            <h2>{ayAdi} Ayı Harcama Dağılımı</h2>
            <div className="analiz-icerik">
              <div className="ozet-tablosu">
                <ul>
                  {Object.entries(kategoriOzeti).sort(([,a],[,b]) => b-a).map(([kategori, tutar]) => (
                    <li key={kategori}><span>{kategori}</span><span>{tutar.toFixed(2)} ₺</span></li>
                  ))}
                </ul>
              </div>
              <div className="grafik-konteyner">
                <Pie data={grafikVerisi} options={{ onClick: handleGrafikTiklama, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }} />
              </div>
            </div>
          </div>
        )}

        {filtrelenmisGelirler.length > 0 && (
          <div className="analiz-karti gelir-analiz-karti">
            <Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} />
          </div>
        )}
      </div>

      {/* 4. BÜTÇE TAKİP BÖLÜMÜ (ARTIK EN ALTTA) */}
      {butceDurumlari.length > 0 && (
        <div className="analiz-karti" style={{ marginTop: '30px' }}>
          <h2>Aylık Kategori Limitleri</h2>
          <div className="butce-listesi">
            {butceDurumlari.map(butce => (
              <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                <div className="butce-bilgi"><span className="butce-kategori">{butce.kategori}</span><span className="butce-rakamlar"> {butce.harcanan.toFixed(2)} / {butce.limit.toFixed(2)} ₺<strong> (%{butce.yuzde.toFixed(0)})</strong></span></div>
                <div className="progress-bar-konteyner"><div className="progress-bar-dolgu" style={{ width: `${butce.yuzde}%` }}></div></div>
                {butce.kalan < 0 ? (<span className="butce-durum gider-renk">{-butce.kalan.toFixed(2)} ₺ aşıldı!</span>) : (<span className="butce-durum">{butce.kalan.toFixed(2)} ₺ kullanılabilir</span>)}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default GenelBakis;