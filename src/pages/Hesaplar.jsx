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
    <div>
      <h2>Hesapları Yönet</h2>
      <div className="icerik-bolumu">
        <div className="bolum">
          <h3>Yeni Hesap Ekle</h3>
          <form onSubmit={handleSubmit} className="kategori-ekle-form">
            <input
              type="text"
              value={yeniHesapAdi}
              onChange={(e) => setYeniHesapAdi(e.target.value)}
              placeholder="Yeni hesap adı (örn: Kredi Kartı)"
            />
            <button type="submit">Ekle</button>
          </form>
        </div>
        <div className="bolum">
          <h3>Mevcut Hesaplar</h3>
          {hesaplar.length === 0 ? <p>Henüz bir hesap eklemediniz.</p> : (
            <ul className="kategori-listesi">
              {hesaplar.map(hesap => (
                <li key={hesap.id}>
                  <span>{hesap.ad}</span>
                  {hesaplar.length > 1 && (
                    <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn" aria-label="Sil">
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