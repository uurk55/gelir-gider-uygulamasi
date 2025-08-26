import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash } from 'react-icons/fa'; // Silme ikonu için import

// Bu alt bileşeni de yeni tasarıma uygun hale getiriyoruz
function KategoriYonetimBolumu({ tip, baslik, kategoriler, handleEkle, handleSil }) {
  const [yeniKategori, setYeniKategori] = useState('');

  const onEkle = (e) => {
    e.preventDefault();
    if (!yeniKategori.trim()) return;
    handleEkle(tip, yeniKategori.trim());
    setYeniKategori('');
  };

  return (
    <div className="bolum">
      <h3>{baslik}</h3>
      <ul className="yonetim-listesi">
        {kategoriler.map(kat => (
          <li key={kat} className="yonetim-listesi-item">
            <span>{kat}</span>
            {kat !== 'Diğer' && (
              <button onClick={() => handleSil(tip, kat)} className="icon-btn sil-btn" aria-label="Sil">
                <FaTrash />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={onEkle} className="form-modern">
        <div>
            <label htmlFor={`yeni-kategori-${tip}`}>Yeni Kategori Ekle</label>
            <input
              id={`yeni-kategori-${tip}`}
              type="text"
              value={yeniKategori}
              onChange={(e) => setYeniKategori(e.target.value)}
              placeholder="Yeni kategori adı..."
            />
        </div>
        <button type="submit">Ekle</button>
      </form>
    </div>
  );
}


function Ayarlar() {
  const { giderKategorileri, gelirKategorileri, handleKategoriEkle, handleKategoriSil } = useFinans();

  if (!giderKategorileri || !gelirKategorileri) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="card">
      <h2>Kategorileri Yönet</h2>
      <div className="yonetim-sayfasi-layout">
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