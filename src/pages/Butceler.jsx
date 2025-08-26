import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash } from 'react-icons/fa'; // İkonu import ediyoruz

function Butceler() {
  const { giderKategorileri, butceler, handleButceEkle, handleButceSil } = useFinans();

  const [kategori, setKategori] = useState(giderKategorileri[0]);
  const [limit, setLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kategori || !limit || limit <= 0) {
      // Geliştirme Önerisi: Buraya bir toast.error mesajı eklenebilir.
      return;
    }
    handleButceEkle({ kategori, limit: parseFloat(limit) });
    setLimit('');
    setKategori(giderKategorileri[0]); // Formu sıfırla
  };

  if (!giderKategorileri || !butceler) {
      return <div>Yükleniyor...</div>
  }

  return (
    <div className="card">
      <h2>Aylık Kategori Bütçeleri</h2>

      <div className="yonetim-sayfasi-layout">
        {/* Sol Sütun: Ekleme Formu */}
        <div className="bolum">
          <h3>Yeni Bütçe Ekle / Güncelle</h3>
          <form onSubmit={handleSubmit} className="form-modern">
            <div>
              <label htmlFor="kategori-sec">Kategori Seç</label>
              <select id="kategori-sec" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {giderKategorileri
                  .filter(kat => kat !== 'Diğer')
                  .map(kat => (<option key={kat} value={kat}>{kat}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="aylik-limit">Aylık Limit (₺)</label>
              <input
                id="aylik-limit"
                type="number"
                min="1"
                placeholder="Örn: 500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <button type="submit">Kaydet</button>
          </form>
        </div>

        {/* Sağ Sütun: Mevcut Liste */}
        <div className="bolum">
          <h3>Mevcut Bütçeler</h3>
          {butceler.length === 0 ? <p style={{marginTop: '1rem', color: 'var(--secondary-text)'}}>Henüz bir bütçe belirlemediniz.</p> : (
            <ul className="yonetim-listesi">
              {butceler.map(butce => (
                <li key={butce.kategori} className="yonetim-listesi-item">
                  <span>{butce.kategori}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--primary-text)', fontWeight: '500' }}>
                      {butce.limit.toFixed(2)} ₺
                    </span>
                    <button onClick={() => handleButceSil(butce.kategori)} className="icon-btn sil-btn" aria-label="Sil">
                      <FaTrash />
                    </button>
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

export default Butceler;