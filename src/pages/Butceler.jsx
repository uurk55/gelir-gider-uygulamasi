// src/pages/Butceler.jsx (DÜZENLEME ÖZELLİĞİ EKLENMİŞ NİHAİ VERSİYON)
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useFinans } from '../context/FinansContext';
import { FaTrash, FaPen, FaSave } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// Her bir bütçe satırını yönetecek alt bileşen
const ButceListItem = ({ butce }) => {
    const { handleButceSil, handleButceEkle } = useFinans(); // handleButceEkle'yi güncelleme için de kullanacağız
    const [isEditing, setIsEditing] = useState(false);
    const [limit, setLimit] = useState(butce.limit);

    const handleSave = () => {
        if (limit > 0 && limit !== butce.limit) {
            handleButceEkle({ kategori: butce.kategori, limit: parseFloat(limit) });
        } else if (limit <= 0) {
            toast.error("Bütçe limiti 0'dan büyük olmalıdır.");
            setLimit(butce.limit); // Eski değere geri dön
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setLimit(butce.limit);
            setIsEditing(false);
        }
    };
    
    return (
        <li className="yonetim-listesi-item">
            <span>{butce.kategori}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isEditing ? (
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{width: '100px', textAlign: 'right'}}
                    />
                ) : (
                    <span style={{ color: 'var(--primary-text)', fontWeight: '500' }}>
                        {formatCurrency(butce.limit)}
                    </span>
                )}
                <div className="buton-grubu">
                    <button onClick={() => setIsEditing(!isEditing)} className="icon-btn duzenle-btn">
                        {isEditing ? <FaSave /> : <FaPen />}
                    </button>
                    <button onClick={() => handleButceSil(butce.kategori)} className="icon-btn sil-btn">
                        <FaTrash />
                    </button>
                </div>
            </div>
        </li>
    );
};


function Butceler() {
  const { giderKategorileri, butceler, handleButceEkle } = useFinans();
  const [kategori, setKategori] = useState(giderKategorileri[0]);
  const [limit, setLimit] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kategori || !limit || limit <= 0) {
      toast.error("Lütfen bir kategori seçin ve 0'dan büyük bir limit girin.");
      return;
    }
    handleButceEkle({ kategori, limit: parseFloat(limit) });
    setLimit('');
    setKategori(giderKategorileri[0]);
  };

  if (!giderKategorileri || !butceler) {
      return <div>Yükleniyor...</div>
  }
  
  // Bütçesi olmayan kategorileri formda göstermek için filtrele
  const bütçesiOlmayanKategoriler = giderKategorileri.filter(kat => 
      kat !== 'Diğer' && !butceler.some(b => b.kategori === kat)
  );

  // Formun state'ini, filtrelenmiş listedeki ilk elemana ayarla
  if (kategori !== bütçesiOlmayanKategoriler[0] && bütçesiOlmayanKategoriler.length > 0) {
      setKategori(bütçesiOlmayanKategoriler[0]);
  }


  return (
    <div className="card">
      <div className="card-header">
        <h2>Aylık Kategori Bütçeleri</h2>
      </div>
      <div className="yonetim-sayfasi-layout">
        <div className="bolum">
          <h3>Yeni Bütçe Ekle</h3>
          {bütçesiOlmayanKategoriler.length > 0 ? (
            <form onSubmit={handleSubmit} className="form-modern">
              <div>
                <label htmlFor="kategori-sec">Kategori Seç</label>
                <select id="kategori-sec" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                  {bütçesiOlmayanKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                </select>
              </div>
              <div>
                <label htmlFor="aylik-limit">Aylık Limit (₺)</label>
                <input id="aylik-limit" type="number" min="1" placeholder="Örn: 500" value={limit} onChange={(e) => setLimit(e.target.value)} />
              </div>
              <button type="submit" className="primary-btn" style={{width: '100%'}}>Kaydet</button>
            </form>
          ) : (
             <p style={{marginTop: '1rem', color: 'var(--secondary-text)'}}>Tüm kategoriler için bütçe belirlendi.</p>
          )}
        </div>
        <div className="bolum">
          <h3>Mevcut Bütçeler</h3>
          {butceler.length === 0 ? <p style={{marginTop: '1rem', color: 'var(--secondary-text)'}}>Henüz bir bütçe belirlemediniz.</p> : (
            <ul className="yonetim-listesi">
              {butceler.map(butce => (
                <ButceListItem key={butce.kategori} butce={butce} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Butceler;