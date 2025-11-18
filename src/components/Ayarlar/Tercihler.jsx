// src/components/Ayarlar/Tercihler.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import AyarKarti from './AyarKarti';
import toast from 'react-hot-toast';

const Tercihler = () => {
  const { ayarlar, updateTercihler } = useFinans();
  const mevcutTercihler = ayarlar?.tercihler || {};

  const [seciliParaBirimi, setSeciliParaBirimi] = useState(
    mevcutTercihler.paraBirimi || 'TRY'
  );
  const [tarihFormati, setTarihFormati] = useState(
    mevcutTercihler.tarihFormati || 'DD.MM.YYYY'
  );
  const [paraGosterimStili, setParaGosterimStili] = useState(
    mevcutTercihler.paraGosterimStili || 'symbol' // symbol | code
  );
  const [kurYukleniyor, setKurYukleniyor] = useState(false);

  const kurlar = mevcutTercihler.kurlar || { TRY: 1, USD: 0, EUR: 0 };
  const kurGuncellemeZamani = mevcutTercihler.kurGuncellemeZamani;

  // Tercih objesini tek yerden güncelle
  const ortakGuncelle = (degisiklik) => {
    const guncel = { ...mevcutTercihler, ...degisiklik };
    updateTercihler(guncel);
  };

  const handleParaBirimiDegistir = (e) => {
    const yeniBirim = e.target.value;
    setSeciliParaBirimi(yeniBirim);
    ortakGuncelle({ paraBirimi: yeniBirim });
  };

  const handleTarihFormatiDegistir = (e) => {
    const yeniFormat = e.target.value;
    setTarihFormati(yeniFormat);
    ortakGuncelle({ tarihFormati: yeniFormat });
  };

  const handleParaGosterimStiliDegistir = (e) => {
    const yeniStil = e.target.value;
    setParaGosterimStili(yeniStil);
    ortakGuncelle({ paraGosterimStili: yeniStil });
  };

  const handleKurGuncelle = async () => {
    setKurYukleniyor(true);
    try {
      // 🔁 YENİ: CORS dostu Frankfurter API
      const res = await fetch(
        'https://api.frankfurter.app/latest?from=TRY&to=USD,EUR'
      );

      if (!res.ok) {
        console.error('Kur API status:', res.status, res.statusText);
        throw new Error('API yanıtı başarısız');
      }

      const data = await res.json();
      // Örnek response:
      // { "amount":1,"base":"TRY","date":"2025-01-10","rates":{"USD":0.03,"EUR":0.028} }

      if (!data?.rates) {
        console.error('Kur API veri hatası:', data);
        throw new Error('Geçersiz kur verisi');
      }

      const yeniKurlar = {
        TRY: 1,
        USD: data.rates.USD,
        EUR: data.rates.EUR,
      };

      ortakGuncelle({
        kurlar: yeniKurlar,
        kurGuncellemeZamani: new Date().toISOString(),
      });

      toast.success('Kur bilgileri başarıyla güncellendi.');
    } catch (err) {
      console.error('Kur bilgisi alınırken hata:', err);
      toast.error(
        'Kur bilgileri alınamadı (CORS veya ağ hatası).\nİstersen daha sonra tekrar deneyebilirsin.'
      );
    } finally {
      setKurYukleniyor(false);
    }
  };

  const sonGuncelleYazi = kurGuncellemeZamani
    ? new Date(kurGuncellemeZamani).toLocaleString('tr-TR')
    : 'Henüz güncellenmedi';

  return (
    <AyarKarti
      title="Tercihler"
      description="Uygulamanın genel davranışını ve gösterim şeklini kişiselleştirin."
    >
      <div className="ayar-formu">
        {/* PARA BİRİMİ */}
        <div className="form-grup">
          <label htmlFor="paraBirimi">Varsayılan Para Birimi</label>
          <select
            id="paraBirimi"
            value={seciliParaBirimi}
            onChange={handleParaBirimiDegistir}
          >
            <option value="TRY">Türk Lirası (₺)</option>
            <option value="USD">Amerikan Doları ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
          <p className="ayar-aciklama">
            Seçtiğin birim; raporlar, özetler ve kartlarda varsayılan olarak
            kullanılacak.
          </p>
        </div>

        {/* TARİH FORMATİ */}
        <div className="form-grup">
          <label htmlFor="tarihFormati">Tarih Formatı</label>
          <select
            id="tarihFormati"
            value={tarihFormati}
            onChange={handleTarihFormatiDegistir}
          >
            <option value="DD.MM.YYYY">31.12.2025</option>
            <option value="DD/MM/YYYY">31/12/2025</option>
            <option value="YYYY-MM-DD">2025-12-31</option>
          </select>
          <p className="ayar-aciklama">
            İşlem listeleri ve raporlarda tarihler bu formata göre gösterilecek.
          </p>
        </div>

        {/* PARA GÖSTERİM ŞEKLİ */}
        <div className="form-grup">
          <label htmlFor="paraStili">Para Gösterim Şekli</label>
          <select
            id="paraStili"
            value={paraGosterimStili}
            onChange={handleParaGosterimStiliDegistir}
          >
            <option value="symbol">₺1.234,50</option>
            <option value="code">TRY 1.234,50</option>
          </select>
          <p className="ayar-aciklama">
            Sembol ya da kod ile gösterim arasında tercih yapabilirsin.
          </p>
        </div>

        {/* KUR BİLGİSİ */}
        <div className="form-grup">
          <label>Kur Bilgisi</label>
          <div className="kur-bilgi-satiri">
            <div className="kur-bilgi-metni">
              <div>1 TRY ≈ {(kurlar.USD || 0).toFixed(4)} USD</div>
              <div>1 TRY ≈ {(kurlar.EUR || 0).toFixed(4)} EUR</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Son güncelleme: {sonGuncelleYazi}
              </div>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleKurGuncelle}
              disabled={kurYukleniyor}
            >
              {kurYukleniyor ? 'Güncelleniyor...' : 'Kurları Güncelle'}
            </button>
          </div>
          <p className="ayar-aciklama">
            Kurlar, herkese açık bir servis üzerinden çekiliyor. Bu değerler
            çevrimler için referans olarak kullanılacak.
          </p>
        </div>
      </div>
    </AyarKarti>
  );
};

export default Tercihler;
