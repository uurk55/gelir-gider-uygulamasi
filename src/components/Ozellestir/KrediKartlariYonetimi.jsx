// src/components/Ozellestir/KrediKartlariYonetimi.jsx

import { useState, useEffect } from 'react';
import { useFinans } from '../../context/FinansContext';
import {
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaCreditCard,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Her bir kart satırını yöneten alt bileşen
function KartSatiri({ kart }) {
  const { handleKrediKartiSil, handleKrediKartiGuncelle } = useFinans();
  const [isEditing, setIsEditing] = useState(false);

  const [editState, setEditState] = useState({
    ad: kart.ad,
    kesimGunu: kart.kesimGunu,
    sonOdemeGunu: kart.sonOdemeGunu,
  });

  useEffect(() => {
    setEditState({
      ad: kart.ad,
      kesimGunu: kart.kesimGunu,
      sonOdemeGunu: kart.sonOdemeGunu,
    });
  }, [kart, isEditing]);

  const validateGun = (v) => {
    const n = parseInt(v, 10);
    return n >= 1 && n <= 31;
  };

  const onGuncelle = () => {
    const ad = editState.ad.trim();

    if (!ad || !editState.kesimGunu || !editState.sonOdemeGunu) {
      return toast.error('Tüm alanlar doldurulmalıdır.');
    }

    if (!validateGun(editState.kesimGunu) || !validateGun(editState.sonOdemeGunu)) {
      return toast.error('Kesim ve ödeme günü 1–31 arasında olmalıdır.');
    }

    handleKrediKartiGuncelle(kart.id, {
      ad,
      kesimGunu: parseInt(editState.kesimGunu, 10),
      sonOdemeGunu: parseInt(editState.sonOdemeGunu, 10),
    });
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onGuncelle();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditState({
        ad: kart.ad,
        kesimGunu: kart.kesimGunu,
        sonOdemeGunu: kart.sonOdemeGunu,
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="ozellestir-liste-item kk-item">
      {isEditing ? (
        <>
          <div className="kk-item-bilgi">
            <FaCreditCard className="liste-item-ikon" />
            <input
              type="text"
              value={editState.ad}
              onChange={(e) =>
                setEditState((p) => ({ ...p, ad: e.target.value }))
              }
              onKeyDown={handleEditKeyDown}
              className="liste-item-input"
              autoFocus
            />
          </div>

          <div className="kk-input-grubu">
            <div className="kk-input-kutu">
              <label>Kesim</label>
              <input
                type="number"
                min="1"
                max="31"
                value={editState.kesimGunu}
                onChange={(e) =>
                  setEditState((p) => ({ ...p, kesimGunu: e.target.value }))
                }
                onKeyDown={handleEditKeyDown}
              />
            </div>
            <div className="kk-input-kutu">
              <label>Ödeme</label>
              <input
                type="number"
                min="1"
                max="31"
                value={editState.sonOdemeGunu}
                onChange={(e) =>
                  setEditState((p) => ({ ...p, sonOdemeGunu: e.target.value }))
                }
                onKeyDown={handleEditKeyDown}
              />
            </div>
          </div>

          <div className="liste-item-aksiyonlar">
            <button
              onClick={onGuncelle}
              className="icon-btn"
              type="button"
              aria-label="Kaydet"
            >
              <FaSave />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="icon-btn"
              type="button"
              aria-label="Vazgeç"
            >
              <FaTimes />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="kk-item-bilgi">
            <FaCreditCard className="liste-item-ikon" />
            <span>{kart.ad}</span>
          </div>

          <div className="kk-item-detay">
            <span className="kk-pill">
              Kesim: <strong>{kart.kesimGunu}. gün</strong>
            </span>
            <span className="kk-pill">
              Son Ödeme: <strong>{kart.sonOdemeGunu}. gün</strong>
            </span>
          </div>

          <div className="liste-item-aksiyonlar">
            <button
              onClick={() => setIsEditing(true)}
              className="icon-btn"
              type="button"
              aria-label="Kartı düzenle"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleKrediKartiSil(kart.id)}
              className="icon-btn danger"
              type="button"
              aria-label="Kartı sil"
            >
              <FaTrash />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Ana Bileşen
function KrediKartlariYonetimi() {
  const { krediKartlari, handleKrediKartiEkle } = useFinans();
  const [isAdding, setIsAdding] = useState(false);
  const [yeniKart, setYeniKart] = useState({
    ad: '',
    kesimGunu: '',
    sonOdemeGunu: '',
  });

  const validateGun = (v) => {
    const n = parseInt(v, 10);
    return n >= 1 && n <= 31;
  };

  const onEkle = () => {
    const ad = yeniKart.ad.trim();

    if (!ad || !yeniKart.kesimGunu || !yeniKart.sonOdemeGunu) {
      return toast.error('Lütfen tüm alanları doldurun.');
    }

    if (!validateGun(yeniKart.kesimGunu) || !validateGun(yeniKart.sonOdemeGunu)) {
      return toast.error('Kesim ve ödeme günü 1–31 arasında olmalıdır.');
    }

    handleKrediKartiEkle({
      ad,
      kesimGunu: parseInt(yeniKart.kesimGunu, 10),
      sonOdemeGunu: parseInt(yeniKart.sonOdemeGunu, 10),
    });

    setYeniKart({ ad: '', kesimGunu: '', sonOdemeGunu: '' });
    setIsAdding(false);
  };

  const handleYeniKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEkle();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setYeniKart({ ad: '', kesimGunu: '', sonOdemeGunu: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="yonetim-bolumu">
      <h2>Kayıtlı Kartlar</h2>
      <p className="yonetim-aciklama">
        Kredi kartlarının kesim ve son ödeme günlerini buradan yönet. Bu
        bilgiler sabit ödemeler ve hatırlatmalar için kullanılabilir.
      </p>

      <div className="ozellestir-liste">
        {krediKartlari.length === 0 && !isAdding && (
          <p className="liste-bos-mesaji">
            Henüz bir kredi kartı eklemediniz.
          </p>
        )}

        {krediKartlari.map((kart) => (
          <KartSatiri key={kart.id} kart={kart} />
        ))}

        {isAdding && (
          <div className="ozellestir-liste-item ekleme-formu kk-ekleme">
            <div className="kk-item-bilgi">
              <FaCreditCard className="liste-item-ikon" />
              <input
                type="text"
                value={yeniKart.ad}
                onChange={(e) =>
                  setYeniKart((p) => ({ ...p, ad: e.target.value }))
                }
                onKeyDown={handleYeniKeyDown}
                placeholder="Yeni Kart Adı"
                className="liste-item-input"
                autoFocus
              />
            </div>

            <div className="kk-input-grubu">
              <div className="kk-input-kutu">
                <label>Kesim Günü</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={yeniKart.kesimGunu}
                  onChange={(e) =>
                    setYeniKart((p) => ({ ...p, kesimGunu: e.target.value }))
                  }
                  onKeyDown={handleYeniKeyDown}
                  placeholder="11"
                />
              </div>
              <div className="kk-input-kutu">
                <label>Ödeme Günü</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={yeniKart.sonOdemeGunu}
                  onChange={(e) =>
                    setYeniKart((p) => ({
                      ...p,
                      sonOdemeGunu: e.target.value,
                    }))
                  }
                  onKeyDown={handleYeniKeyDown}
                  placeholder="18"
                />
              </div>
            </div>

            <div className="liste-item-aksiyonlar">
              <button
                onClick={onEkle}
                className="icon-btn"
                type="button"
                aria-label="Kartı kaydet"
              >
                <FaSave />
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="icon-btn"
                type="button"
                aria-label="Vazgeç"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="ekle-btn"
          type="button"
        >
          <FaPlus /> Yeni Kart Ekle
        </button>
      )}
    </div>
  );
}

export default KrediKartlariYonetimi;
