// src/components/Ayarlar/Tercihler.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import AyarKarti from './AyarKarti';

const Tercihler = () => {
  const { ayarlar, updateTercihler } = useFinans();

  const tercihler = ayarlar?.tercihler || {};

  const [seciliParaBirimi, setSeciliParaBirimi] = useState(
    tercihler.paraBirimi || 'TRY'
  );
  const [tarihFormati, setTarihFormati] = useState(
    tercihler.tarihFormati || 'DD.MM.YYYY'
  );
  const [paraGosterim, setParaGosterim] = useState(
    tercihler.paraGosterim || 'symbol-first'
  );

  const handleTercihGuncelle = (patch) => {
    const guncel = { ...tercihler, ...patch };
    // Context içindeki ayarları güncelle
    updateTercihler(guncel);
    // Formatlayıcıların kullanacağı localStorage kaydı
    try {
      localStorage.setItem('finans_tercihler_v1', JSON.stringify(guncel));
    } catch (e) {
      console.error('Tercihler localStorage’a kaydedilirken hata:', e);
    }
  };

  const handleParaBirimiDegistir = (e) => {
    const yeni = e.target.value;
    setSeciliParaBirimi(yeni);
    handleTercihGuncelle({ paraBirimi: yeni });
  };

  const handleTarihFormatiDegistir = (e) => {
    const yeni = e.target.value;
    setTarihFormati(yeni);
    handleTercihGuncelle({ tarihFormati: yeni });
  };

  const handleParaGosterimDegistir = (e) => {
    const yeni = e.target.value;
    setParaGosterim(yeni);
    handleTercihGuncelle({ paraGosterim: yeni });
  };

  return (
    <AyarKarti
      title="Tercihler"
      description="Uygulamanın para birimi, tarih formatı ve gösterim şekillerini özelleştirin."
    >
      <div className="tercihler-grid">
        {/* SOL TARAF – ÇALIŞAN AYARLAR */}
        <div className="tercihler-sol ayar-formu">
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
            <p className="form-aciklama">
              Tüm özetler ve listelerde tutarlar bu para biriminin
              sembolüyle gösterilir.
            </p>
          </div>

          <div className="form-grup">
            <label htmlFor="tarihFormati">Tarih Gösterim Biçimi</label>
            <select
              id="tarihFormati"
              value={tarihFormati}
              onChange={handleTarihFormatiDegistir}
            >
              <option value="DD.MM.YYYY">31.12.2025</option>
              <option value="YYYY-MM-DD">2025-12-31</option>
              <option value="DD/MM/YYYY">31/12/2025</option>
            </select>
            <p className="form-aciklama">
              İşlem listeleri ve raporlar bu formatta gösterilecek.
            </p>
          </div>

          <div className="form-grup">
            <label htmlFor="paraGosterim">Para Gösterim Şekli</label>
            <select
              id="paraGosterim"
              value={paraGosterim}
              onChange={handleParaGosterimDegistir}
            >
              <option value="symbol-first">₺ 1.234,56</option>
              <option value="symbol-last">1.234,56 ₺</option>
              <option value="code-first">TRY 1.234,56</option>
            </select>
            <p className="form-aciklama">
              Sembolden önce / sonra veya para birimi koduyla
              gösterilmesini seçebilirsiniz.
            </p>
          </div>
        </div>

        {/* SAĞ TARAF – KUR ALANI ŞİMDİLİK SADECE BİLGİ */}
        <div className="tercihler-sag">
          <div className="tercihler-kur-baslik">
            Kur & çapraz kur
            <span
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.8rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: 'rgba(148, 163, 184, 0.15)',
                color: 'var(--secondary-text)',
                border: '1px solid rgba(148, 163, 184, 0.4)',
              }}
            >
              Yakında
            </span>
          </div>
          <div className="tercihler-kur-alt">
            <p>
              Seçtiğin para birimine göre otomatik kur güncelleme ve farklı para
              birimlerine çevrilmiş toplamları gösterme özelliği burada yer
              alacak.
            </p>
            <p>
              Şu anda uygulama, seçtiğin para biriminin{' '}
              <strong>sadece sembolünü ve yazım şeklini</strong> değiştiriyor.
              Kur çevrimi ve internetten otomatik kur alma özelliği yakında
              eklenecek.
            </p>
          </div>
        </div>
      </div>
    </AyarKarti>
  );
};

export default Tercihler;
