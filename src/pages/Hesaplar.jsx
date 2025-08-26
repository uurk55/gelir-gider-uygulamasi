import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash } from 'react-icons/fa';

function Hesaplar() {
  const { hesaplar, handleHesapEkle, handleHesapSil } = useFinans();
  const [yeniHesapAdi, setYeniHesapAdi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!yeniHesapAdi.trim()) return;
    handleHesapEkle(yeniHesapAdi);
    setYeniHesapAdi('');
  };

  if (!hesaplar) {
      return <div>Yükleniyor...</div>;
  }

  return (
    <div className="card">
      <h2>Hesapları Yönet</h2>
      
      <div className="yonetim-sayfasi-layout">
        {/* Sol Sütun: Ekleme Formu */}
        <div className="bolum">
          <h3>Yeni Hesap Ekle</h3>
          <form onSubmit={handleSubmit} className="form-modern">
            <div>
              <label htmlFor="hesapAdi">Hesap Adı</label>
              <input
                id="hesapAdi"
                type="text"
                value={yeniHesapAdi}
                onChange={(e) => setYeniHesapAdi(e.target.value)}
                placeholder="Örn: Kredi Kartı"
              />
            </div>
            <button type="submit">Ekle</button>
          </form>
        </div>

        {/* Sağ Sütun: Mevcut Liste */}
        <div className="bolum">
          <h3>Mevcut Hesaplar</h3>
          {hesaplar.length === 0 ? <p>Henüz bir hesap eklemediniz.</p> : (
            <ul className="yonetim-listesi">
              {hesaplar.map(hesap => (
                <li key={hesap.id} className="yonetim-listesi-item">
                  <span>{hesap.ad}</span>
                  {hesaplar.length > 1 && (
                    <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn sil-btn" aria-label="Sil">
                       <FaTrash />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Hesaplar;