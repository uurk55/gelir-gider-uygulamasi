// src/components/Ozellestir/HesaplarYonetimi.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit, FaWallet } from 'react-icons/fa';
import { getAccountIcon } from '../../utils/iconMap';

// Tek bir hesap satırı
function HesapSatiri({ hesap }) {
  const { handleHesapSil, handleHesapGuncelle } = useFinans();
  const [isEditing, setIsEditing] = useState(false);
  const [hesapAdi, setHesapAdi] = useState(hesap.ad);

  const onGuncelle = () => {
    const temizAd = hesapAdi.trim();
    if (temizAd !== '' && temizAd !== hesap.ad) {
      handleHesapGuncelle(hesap.id, temizAd);
    }
    setIsEditing(false);
  };

  return (
    <div className="ozellestir-liste-item">
      {isEditing ? (
        <>
          <div className="liste-item-ikon">{getAccountIcon(hesap.ad)}</div>
          <input
            type="text"
            value={hesapAdi}
            onChange={(e) => setHesapAdi(e.target.value)}
            className="liste-item-input"
            autoFocus
          />
          <div className="liste-item-aksiyonlar">
            <button onClick={onGuncelle} className="icon-btn">
              <FaSave />
            </button>
            <button onClick={() => setIsEditing(false)} className="icon-btn">
              <FaTimes />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="kk-item-bilgi">
            <div className="liste-item-ikon">{getAccountIcon(hesap.ad)}</div>
            {/* SADECE HESAP ADI GÖRÜNÜR, UZUNSA ... İLE KISALIR */}
            <span className="liste-item-text" title={hesap.ad}>
              {hesap.ad}
            </span>
          </div>
          <div className="liste-item-aksiyonlar">
            <button onClick={() => setIsEditing(true)} className="icon-btn">
              <FaEdit />
            </button>
            <button
              onClick={() => handleHesapSil(hesap.id)}
              className="icon-btn danger"
            >
              <FaTrash />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Ana bileşen
function HesaplarYonetimi() {
  const { hesaplar, handleHesapEkle } = useFinans();
  const [yeniHesapAdi, setYeniHesapAdi] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const onEkle = () => {
    const temizAd = yeniHesapAdi.trim();
    if (temizAd === '') return;
    handleHesapEkle(temizAd);
    setYeniHesapAdi('');
    setIsAdding(false);
  };

  return (
    <div className="yonetim-bolumu">
      <div className="yonetim-baslik">
        <h2>Mevcut Hesaplar</h2>
        <p className="yonetim-aciklama">
          Nakit, banka hesabı veya kart gibi para hareketlerini takip edeceğin
          hesapları buradan ekleyebilir ve isimlerini güncelleyebilirsin.
        </p>
      </div>

      <p className="yonetim-bilgi-alt">
        Toplam <strong>{hesaplar.length}</strong> hesap tanımlı
      </p>

      <div className="ozellestir-liste">
        {hesaplar.map((hesap) => (
          <HesapSatiri key={hesap.id} hesap={hesap} />
        ))}

        {isAdding && (
          <div className="ozellestir-liste-item ekleme-formu">
            <div className="liste-item-ikon">
              <FaWallet />
            </div>
            <input
              type="text"
              value={yeniHesapAdi}
              onChange={(e) => setYeniHesapAdi(e.target.value)}
              placeholder="Yeni hesap adı"
              className="liste-item-input"
              autoFocus
            />
            <div className="liste-item-aksiyonlar">
              <button onClick={onEkle} className="icon-btn">
                <FaSave />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setYeniHesapAdi('');
                }}
                className="icon-btn"
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
          className="ekle-btn ekle-btn-yonetim"
        >
          <FaPlus /> Yeni Hesap Ekle
        </button>
      )}
    </div>
  );
}

export default HesaplarYonetimi;
