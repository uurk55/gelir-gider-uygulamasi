import { useState } from 'react';
import { useFinans } from '../context/FinansContext'; // YENİ: Context Hook'u içe aktar

function Butceler() {
  // YENİ: Prop'lar yerine, ihtiyacımız olan tüm state ve fonksiyonları Context'ten alıyoruz.
  const { giderKategorileri, butceler, handleButceEkle, handleButceSil } = useFinans();

  const [kategori, setKategori] = useState(giderKategorileri[0]);
  const [limit, setLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kategori || !limit || limit <= 0) {
      // Toast mesajı Context'teki fonksiyonlar tarafından yönetilecek
      return;
    }
    handleButceEkle({ kategori, limit: parseFloat(limit) });
    setLimit('');
  };

  return (
    <div>
      <h2>Aylık Kategori Bütçeleri</h2>
      <div className="icerik-bolumu">
        <div className="bolum">
          <form onSubmit={handleSubmit}>
            <h3>Yeni Bütçe Ekle / Güncelle</h3>
            <div>
              <label>Kategori Seç:</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {giderKategorileri
                  .filter(kat => kat !== 'Diğer') // "Diğer" için bütçe anlamsız
                  .map(kat => (<option key={kat} value={kat}>{kat}</option>))}
              </select>
            </div>
            <div>
              <label>Aylık Limit (₺):</label>
              <input
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

        <div className="bolum">
          <h3>Mevcut Bütçeler</h3>
          {butceler.length === 0 ? <p>Henüz bir bütçe belirlemediniz.</p> : (
            <ul className="kategori-listesi">
              {butceler.map(butce => (
                <li key={butce.kategori}>
                  <span><strong>{butce.kategori}:</strong> {butce.limit.toFixed(2)} ₺</span>
                  <button onClick={() => handleButceSil(butce.kategori)}>Sil</button>
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