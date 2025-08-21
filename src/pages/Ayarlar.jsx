// GÜNCELLENMİŞ - src/pages/Ayarlar.jsx
import { useState } from 'react';

function KategoriYonetimBolumu({ tip, baslik, kategoriler, handleEkle, handleSil }) {
  const [yeniKategori, setYeniKategori] = useState('');

  const onEkle = (e) => {
    e.preventDefault();
    handleEkle(tip, yeniKategori.trim());
    setYeniKategori('');
  };

  return (
    <div className="bolum">
      <h2>{baslik}</h2>
      <ul className="kategori-listesi">
        {kategoriler.map(kat => (
          <li key={kat}>
            <span>{kat}</span>
            {kat !== 'Diğer' && <button onClick={() => handleSil(tip, kat)}>Sil</button>}
          </li>
        ))}
      </ul>
      <form onSubmit={onEkle} className="kategori-ekle-form">
        <input 
          type="text" 
          value={yeniKategori} 
          onChange={(e) => setYeniKategori(e.target.value)}
          placeholder="Yeni kategori adı..."
        />
        <button type="submit">Ekle</button>
      </form>
    </div>
  );
}

function Ayarlar({ giderKategorileri, gelirKategorileri, handleKategoriEkle, handleKategoriSil }) {
  return (
    <div>
      <h2>Kategorileri Yönet</h2>
      <div className="icerik-bolumu">
        <KategoriYonetimBolumu 
          tip="gelir"
          baslik="Gelir Kategorileri"
          kategoriler={gelirKategorileri}
          handleEkle={handleKategoriEkle}
          handleSil={handleKategoriSil}
        />
        <KategoriYonetimBolumu 
          tip="gider"
          baslik="Gider Kategorileri"
          kategoriler={giderKategorileri}
          handleEkle={handleKategoriEkle}
          handleSil={handleKategoriSil}
        />
      </div>
    </div>
  );
}

export default Ayarlar;