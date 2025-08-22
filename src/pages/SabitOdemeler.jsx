import { useState } from 'react';
import { FaTrash } from 'react-icons/fa'; // YENİ

function SabitOdemeler(props) {
  // DÜZELTME: Prop'un adı "giderKategorileri" olarak değiştirildi
  const { sabitOdemeler, handleSabitOdemeEkle, handleSabitOdemeSil, giderKategorileri } = props;
  const getBugununTarihi = () => new Date().toISOString().split('T')[0];

  // DÜZELTME: Artık doğru değişken kullanılıyor
  const [kategori, setKategori] = useState(giderKategorileri[0]);
  
  // Diğer state'ler aynı
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState('');
  const [odemeGunu, setOdemeGunu] = useState(1);
  const [baslangicTarihi, setBaslangicTarihi] = useState(getBugununTarihi());
  const [taksitSayisi, setTaksitSayisi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aciklama || !tutar || !baslangicTarihi) return;

    handleSabitOdemeEkle({
      aciklama,
      tutar: parseFloat(tutar),
      kategori,
      odemeGunu: parseInt(odemeGunu),
      baslangicTarihi,
      taksitSayisi: taksitSayisi > 0 ? parseInt(taksitSayisi) : null,
    });

    // DÜZELTME: Form temizlenirken de doğru değişken kullanılıyor
    setAciklama('');
    setTutar('');
    setKategori(giderKategorileri[0]);
    setOdemeGunu(1);
    setBaslangicTarihi(getBugununTarihi());
    setTaksitSayisi('');
  };

  return (
    <div className="sabit-odemeler-sayfasi">
      <div className="bolum">
        <form onSubmit={handleSubmit}>
          <h2>Yeni Sabit Ödeme / Taksit Ekle</h2>
          <div>
            <label>Açıklama:</label>
            <input type="text" placeholder="Örn: Ev Kredisi, Netflix" value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
          </div>
          <div>
            <label>Kategori:</label>
            {/* DÜZELTME: Artık doğru değişken .map() için kullanılıyor */}
            <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
              {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
            </select>
          </div>
          <div>
            <label>Aylık Tutar (₺):</label>
            <input type="number" placeholder="Örn: 150" value={tutar} onChange={(e) => setTutar(e.target.value)} />
          </div>
          <div>
            <label>İlk Ödeme Tarihi:</label>
            <input type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} />
          </div>
          <div>
            <label>Her Ayın Kaçında Ödenecek:</label>
            <input type="number" min="1" max="31" value={odemeGunu} onChange={(e) => setOdemeGunu(e.target.value)} />
          </div>
          <div>
            <label>Toplam Taksit Sayısı (Abonelik için boş bırakın):</label>
            <input type="number" min="1" placeholder="Örn: 12, 24, 36" value={taksitSayisi} onChange={(e) => setTaksitSayisi(e.target.value)} />
          </div>
          <button type="submit">Ekle</button>
        </form>
      </div>

      <div className="bolum">
        <h2>Kayıtlı Sabit Ödemeler</h2>
        {sabitOdemeler.length === 0 ? <p>Kayıtlı sabit ödeme bulunmuyor.</p> : (
          <ul>
            {sabitOdemeler.map(odeme => (
              <li key={odeme.id}>
                <div className="aciklama-kategori">
                  <span>{odeme.aciklama}</span>
                  <span className="kategori-etiketi">{odeme.kategori}</span>
                  {odeme.taksitSayisi ? (
                    <span className="tarih-etiketi">{odeme.taksitSayisi} Taksit (Her ayın {odeme.odemeGunu}. günü)</span>
                  ) : (
                    <span className="tarih-etiketi">Abonelik (Her ayın {odeme.odemeGunu}. günü)</span>
                  )}
                </div>
                <span>{odeme.tutar.toFixed(2)} ₺</span>
                <div className="buton-grubu">
  <button 
    onClick={() => handleSabitOdemeSil(odeme.id)}
    className="icon-btn" // "icon-btn" sınıfı eklendi
    aria-label="Sil"
  >
    <FaTrash /> {/* Sil ikonu */}
  </button>
</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SabitOdemeler;