// src/pages/Butceler.jsx

import { useState, useEffect } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// --- Tek bir Bütçe Satırını Yöneten Alt Bileşen ---
function ButceSatiri({ butceDetay }) {
  const { id, kategori, limit, harcanan, kalan, yuzde, durum } = butceDetay;
  const { handleButceSil, handleButceGuncelle } = useFinans();
  const [isEditing, setIsEditing] = useState(false);
  const [editLimit, setEditLimit] = useState(limit);

  const durumEtiketMetni = {
    normal: 'Kontrol altında',
    iyi: 'Rahat',
    uyari: 'Sınırda',
    kritik: 'Riskli',
    asildi: 'Aşıldı',
  }[durum] || 'Takipte';

  const onGuncelle = () => {
    const parsed = parseFloat(editLimit);
    if (!isNaN(parsed) && parsed > 0) {
      handleButceGuncelle(id, { kategori, limit: parsed });
      setIsEditing(false);
    }
  };

  const handleSil = () => {
    if (window.confirm(`"${kategori}" bütçesini silmek istediğine emin misin?`)) {
      handleButceSil(id);
    }
  };

  return (
    <div className={`butce-karti ${durum}`}>
      <div className="butce-karti-header">
        <div className="butce-karti-baslik-sol">
          <span className="kategori-adi">{kategori}</span>
          <span className={`butce-durum-etiket ${durum}`}>
            {durumEtiketMetni}
          </span>
        </div>

        {isEditing ? (
          <div className="liste-item-aksiyonlar">
            <button onClick={onGuncelle} className="icon-btn">
              <FaSave />
            </button>
            <button onClick={() => setIsEditing(false)} className="icon-btn">
              <FaTimes />
            </button>
          </div>
        ) : (
          <div className="liste-item-aksiyonlar">
            <button
              onClick={() => setIsEditing(true)}
              className="icon-btn"
              title="Limiti düzenle"
            >
              <FaEdit />
            </button>
            <button
              onClick={handleSil}
              className="icon-btn danger"
              title="Bütçeyi sil"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      <div className="butce-karti-body">
        <div className="butce-karti-rakamlar">
          <span className="harcanan">{formatCurrency(harcanan)}</span>
          {isEditing ? (
            <input
              type="number"
              min="0"
              step="0.01"
              value={editLimit}
              onChange={(e) => setEditLimit(e.target.value)}
              className="limit-input"
            />
          ) : (
            <span className="limit">/ {formatCurrency(limit)}</span>
          )
          }
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-dolu"
            style={{ width: `${Math.min(yuzde, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="butce-karti-footer">
        <span className={`kalan-tutar ${kalan < 0 ? 'negatif' : 'pozitif'}`}>
          {kalan >= 0
            ? `${formatCurrency(kalan)} KULLANILABİLİR`
            : `${formatCurrency(Math.abs(kalan))} AŞIM`}
        </span>
      </div>
    </div>
  );
}

// --- Ana Bütçeler Sayfası ---
function Butceler() {
  const { butceDurumlari, giderKategorileri, handleButceEkle } = useFinans();
  const [isAdding, setIsAdding] = useState(false);

  const mevcutButceKategorileri = new Set(
    butceDurumlari.map((b) => b.kategori)
  );
  const eklenmemisKategoriler = giderKategorileri.filter(
    (k) => !mevcutButceKategorileri.has(k)
  );

  const [yeniButce, setYeniButce] = useState({
    kategori: eklenmemisKategoriler[0] || '',
    limit: '',
  });

  useEffect(() => {
    if (!isAdding && eklenmemisKategoriler.length > 0) {
      setYeniButce({
        kategori: eklenmemisKategoriler[0] || '',
        limit: '',
      });
    }
  }, [isAdding, giderKategorileri, butceDurumlari]);

  const onEkle = () => {
    const parsed = parseFloat(yeniButce.limit);
    if (!yeniButce.kategori || isNaN(parsed) || parsed <= 0) return;

    handleButceEkle({
      kategori: yeniButce.kategori,
      limit: parsed,
    });
    setIsAdding(false);
    setYeniButce({
      kategori: eklenmemisKategoriler[0] || '',
      limit: '',
    });
  };

  // 🔹 Sayfa üstü mini özet
  const toplamLimit = butceDurumlari.reduce(
    (sum, b) => sum + (b.limit || 0),
    0
  );
  const toplamHarcanan = butceDurumlari.reduce(
    (sum, b) => sum + (b.harcanan || 0),
    0
  );
  const toplamKalan = toplamLimit - toplamHarcanan;
  const asimSayisi = butceDurumlari.filter((b) => b.kalan < 0).length;

  const tumButcelerBos = butceDurumlari.length === 0;

  return (
    <div className="ozellestir-sayfasi-container">
      <div className="card">
        <div className="ozellestir-header">
  <div>
    <h1>Aylık Kategori Bütçeleri</h1>
    <p className="sayfa-aciklama">
      Her kategori için aylık harcama limitlerini burada yönetebilirsin. 
      Amacın, harcamalarını plandaki limitler içinde tutmak. 🚦
    </p>
  </div>
</div>


        {!tumButcelerBos && (
  <div className="butce-ozet-bar">
    <div className="butce-ozet-item">
      <span className="ozet-etiket">Toplam Bütçe Limiti</span>
      <span className="ozet-deger">
        {formatCurrency(toplamLimit || 0)}
      </span>
      <span className="ozet-alt">Planladığın toplam aylık limit.</span>
    </div>

    <div className="butce-ozet-item">
      <span className="ozet-etiket">Gerçekleşen Harcama</span>
      <span className="ozet-deger negatif">
        {formatCurrency(toplamHarcanan || 0)}
      </span>
      <span className="ozet-alt">Şu ana kadar yaptığın toplam gider.</span>
    </div>

    <div className="butce-ozet-item">
      <span className="ozet-etiket">Kalan Bütçe</span>
      <span className={`ozet-deger ${toplamKalan >= 0 ? 'pozitif' : 'negatif'}`}>
        {formatCurrency(toplamKalan || 0)}
      </span>
      <span className="ozet-alt">
        {toplamKalan >= 0 ? 'Planın dahilinde ilerliyorsun.' : 'Toplamda limitin üzerindesin.'}
      </span>
    </div>

    <div className="butce-ozet-item">
      <span className="ozet-etiket">Aşım Olan Kategori</span>
      <span className={`ozet-deger ${asimSayisi > 0 ? 'negatif' : 'pozitif'}`}>
        {asimSayisi} adet
      </span>
      <span className="ozet-alt">
        {asimSayisi > 0 ? 'Dikkat etmen gereken kategoriler var.' : 'Şu an hiçbir kategoride aşım yok.'}
      </span>
    </div>
  </div>
)}


        <div className="ozellestir-icerik">
          <div className="butce-listesi-container">
            {/* Hiç bütçe yoksa boş durum */}
            {tumButcelerBos && !isAdding && (
              <div className="empty-state-container mini-kart-empty">
                <p>Henüz kategori bütçesi oluşturmadınız.</p>
                {eklenmemisKategoriler.length > 0 && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="primary-btn-small"
                  >
                    <FaPlus /> İlk Bütçeni Oluştur
                  </button>
                )}
              </div>
            )}

            {butceDurumlari.map((butce) => (
              <ButceSatiri key={butce.id} butceDetay={butce} />
            ))}

            {isAdding && (
  <div className="butce-karti yeni-butce-karti">
    <div className="butce-karti-header">
      <div>
        <span className="kategori-adi">Yeni Bütçe Oluştur</span>
        <p className="yeni-butce-aciklama">
          Bir kategori seç ve bu ay için harcama limitini belirle.
        </p>
      </div>
      <button
        onClick={() => setIsAdding(false)}
        className="icon-btn"
        title="Vazgeç"
      >
        <FaTimes />
      </button>
    </div>

    <div className="yeni-butce-form">
      <div className="yeni-butce-alani">
        <label>Kategori</label>
        <select
          value={yeniButce.kategori}
          onChange={(e) =>
            setYeniButce({ ...yeniButce, kategori: e.target.value })
          }
          autoFocus
        >
          <option value="" disabled>
            Kategori seç...
          </option>
          {eklenmemisKategoriler.map((kat) => (
            <option key={kat} value={kat}>
              {kat}
            </option>
          ))}
        </select>
      </div>

      <div className="yeni-butce-alani">
        <label>Aylık Limit (₺)</label>
        <input
          type="number"
          value={yeniButce.limit}
          onChange={(e) =>
            setYeniButce({ ...yeniButce, limit: e.target.value })
          }
          placeholder="Örn: 500"
          className="limit-input"
        />
      </div>

                  <div className="yeni-butce-aksiyonlar">
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="secondary-btn"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={onEkle}
          className="primary-btn"
        >
          <FaSave /> Kaydet
        </button>
      </div>

    </div>
  </div>
)}


          </div>

          {!isAdding && eklenmemisKategoriler.length > 0 && (
            <button onClick={() => setIsAdding(true)} className="ekle-btn">
              <FaPlus /> Yeni Bütçe Ekle
            </button>
          )}

          {!isAdding && eklenmemisKategoriler.length === 0 && !tumButcelerBos && (
            <p className="butce-bilgi-mesaji">
              Tüm gider kategorileri için bütçe belirledin. Yeni kategori
              eklemek istersen “Özelleştir &gt; Kategoriler” alanından
              tanımlayabilirsin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Butceler;
