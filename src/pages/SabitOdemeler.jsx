import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useFinans } from '../context/FinansContext';

function SabitOdemeler() {
  const { sabitOdemeler, handleSabitOdemeEkle, handleSabitOdemeSil, giderKategorileri } = useFinans();

  const getBugununTarihi = () => new Date().toISOString().split('T')[0];

  const [kategori, setKategori] = useState(giderKategorileri[0]);
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState('');
  const [odemeGunu, setOdemeGunu] = useState(1);
  const [baslangicTarihi, setBaslangicTarihi] = useState(getBugununTarihi());
  const [taksitSayisi, setTaksitSayisi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aciklama || !tutar || !baslangicTarihi) {
        toast.error("Lütfen Açıklama, Tutar ve Başlangıç Tarihi alanlarını doldurun.");
        return;
    }

    handleSabitOdemeEkle({
      aciklama,
      tutar: parseFloat(tutar),
      kategori,
      odemeGunu: parseInt(odemeGunu),
      baslangicTarihi,
      taksitSayisi: taksitSayisi > 0 ? parseInt(taksitSayisi) : null,
    });

    setAciklama('');
    setTutar('');
    setKategori(giderKategorileri[0]);
    setOdemeGunu(1);
    setBaslangicTarihi(getBugununTarihi());
    setTaksitSayisi('');
  };

  if (!sabitOdemeler || !giderKategorileri) {
      return <div>Yükleniyor...</div>
  }

  return (
    <div className="card">
      <h2>Sabit Ödemeleri Yönet</h2>
      <div className="yonetim-sayfasi-layout">
        {/* Sol Sütun: Form */}
        <div className="bolum">
          <h3>Yeni Sabit Ödeme Ekle</h3>
          <form onSubmit={handleSubmit} className="form-modern form-grid">
            <div className="form-item-full">
              <label htmlFor="odeme-aciklama">Açıklama</label>
              <input id="odeme-aciklama" type="text" placeholder="Örn: Ev Kredisi, Netflix" value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
            </div>

            <div className="form-item-half">
              <label htmlFor="odeme-kategori">Kategori</label>
              <select id="odeme-kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
              </select>
            </div>

            <div className="form-item-half">
              <label htmlFor="odeme-tutar">Aylık Tutar (₺)</label>
              <input id="odeme-tutar" type="number" placeholder="Örn: 150" value={tutar} onChange={(e) => setTutar(e.target.value)} />
            </div>
            
            <div className="form-item-half">
              <label htmlFor="odeme-baslangic">İlk Ödeme Tarihi</label>
              <input id="odeme-baslangic" type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} />
            </div>

            <div className="form-item-half">
              <label htmlFor="odeme-gunu">Ödeme Günü</label>
              <input id="odeme-gunu" type="number" min="1" max="31" value={odemeGunu} onChange={(e) => setOdemeGunu(e.target.value)} />
            </div>

            <div className="form-item-full">
              <label htmlFor="odeme-taksit">Toplam Taksit Sayısı (Abonelik için boş bırakın)</label>
              <input id="odeme-taksit" type="number" min="1" placeholder="Örn: 12, 24, 36" value={taksitSayisi} onChange={(e) => setTaksitSayisi(e.target.value)} />
            </div>

            <div className="form-item-full">
              <button type="submit">Ekle</button>
            </div>
          </form>
        </div>

        {/* Sağ Sütun: Liste */}
        <div className="bolum">
          <h3>Kayıtlı Sabit Ödemeler</h3>
          {sabitOdemeler.length === 0 ? <p style={{marginTop: '1rem', color: 'var(--secondary-text)'}}>Kayıtlı sabit ödeme bulunmuyor.</p> : (
            <ul className="yonetim-listesi">
              {sabitOdemeler.map(odeme => (
                <li key={odeme.id} className="yonetim-listesi-item sabit-odeme-item">
                  <div className="sabit-odeme-orta">
                    <span className="sabit-odeme-aciklama">{odeme.aciklama}</span>
                    <div className="islem-etiketler">
                      <span className="islem-etiket">{odeme.kategori}</span>
                      <span className="islem-etiket tarih-etiketi">
                        {odeme.taksitSayisi ? `${odeme.taksitSayisi} Taksit (Ayın ${odeme.odemeGunu}. günü)` : `Abonelik (Ayın ${odeme.odemeGunu}. günü)`}
                      </span>
                    </div>
                  </div>
                  <div className="sabit-odeme-sag">
                    <span className="sabit-odeme-tutar">{odeme.tutar.toFixed(2)} ₺</span>
                    <button onClick={() => handleSabitOdemeSil(odeme.id)} className="icon-btn sil-btn" aria-label="Sil"><FaTrash /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SabitOdemeler;