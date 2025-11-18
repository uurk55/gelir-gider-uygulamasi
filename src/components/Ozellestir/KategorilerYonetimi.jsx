// src/components/Ozellestir/KategorilerYonetimi.jsx

import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit, FaBars } from 'react-icons/fa';

// Tek bir kategori satırı için "Sıralanabilir" bileşen
function SortableKategoriItem({ id, onSil, onGuncelle }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [kategoriAdi, setKategoriAdi] = useState(id);

  const handleGuncelle = () => {
    const temiz = kategoriAdi.trim();
    if (temiz !== '' && temiz !== id) {
      onGuncelle(id, temiz);
    }
    // İptal de etse, kaydetse de satır normal moda dönsün
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGuncelle();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setKategoriAdi(id);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="ozellestir-liste-item kategori-item"
    >
      <button
        {...attributes}
        {...listeners}
        className="drag-handle-btn"
        type="button"
        aria-label="Sürükleyerek sırala"
      >
        <FaBars />
      </button>

      {isEditing ? (
        <input
          type="text"
          value={kategoriAdi}
          onChange={(e) => setKategoriAdi(e.target.value)}
          onKeyDown={handleKeyDown}
          className="liste-item-input"
          autoFocus
        />
      ) : (
        <span className="kategori-adi">{id}</span>
      )}

      <div className="liste-item-aksiyonlar">
        {isEditing ? (
          <>
            <button
              onClick={handleGuncelle}
              className="icon-btn"
              type="button"
              aria-label="Kaydet"
            >
              <FaSave />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setKategoriAdi(id);
              }}
              className="icon-btn"
              type="button"
              aria-label="Vazgeç"
            >
              <FaTimes />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="icon-btn"
              type="button"
              aria-label="Kategori adını düzenle"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onSil(id)}
              className="icon-btn danger"
              type="button"
              aria-label="Kategoriyi sil"
            >
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Tek bir kategori listesini (Gelir veya Gider) yöneten bileşen
function KategoriListesi({
  tip,
  baslik,
  kategoriler,
  onEkle,
  onSil,
  onGuncelle,
  onSirala,
}) {
  const [yeniKategori, setYeniKategori] = useState('');

  const handleEkle = () => {
    const temiz = yeniKategori.trim();
    if (!temiz) return;
    // Aynı isimden zaten varsa bir daha ekleme
    if (kategoriler.includes(temiz)) {
      setYeniKategori('');
      return;
    }
    onEkle(tip, temiz);
    setYeniKategori('');
  };

  const handleYeniKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEkle();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setYeniKategori('');
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onSirala(tip, active.id, over.id);
    }
  };

  return (
    <div className="kategori-listesi-alani">
      <div className="yonetim-bolumu-header">
        <h3>{baslik}</h3>
        <p className="yonetim-aciklama">
          Kategorileri sürükleyerek sıralayabilir, isimlerine tıklayıp
          düzenleyebilir veya yenilerini ekleyebilirsin.
        </p>
        <span className="yonetim-istatistik">
          Toplam <strong>{kategoriler.length}</strong> kategori
        </span>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={kategoriler}
          strategy={verticalListSortingStrategy}
        >
          <div className="ozellestir-liste">
            {kategoriler.map((kategori) => (
              <SortableKategoriItem
                key={kategori}
                id={kategori}
                onSil={(ad) => onSil(tip, ad)}
                onGuncelle={(eskiAd, yeniAd) =>
                  onGuncelle(tip, eskiAd, yeniAd)
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="ozellestir-liste-item ekleme-formu">
        <input
          type="text"
          value={yeniKategori}
          onChange={(e) => setYeniKategori(e.target.value)}
          onKeyDown={handleYeniKeyDown}
          placeholder="Yeni kategori adı..."
          className="liste-item-input"
        />
        <button
          onClick={handleEkle}
          className="ekle-btn-small"
          type="button"
        >
          <FaPlus /> Ekle
        </button>
      </div>
    </div>
  );
}

// Ana Kategori Yönetim Bileşeni
function KategorilerYonetimi() {
  const {
    gelirKategorileri,
    giderKategorileri,
    handleKategoriEkle,
    handleKategoriSil,
    handleKategoriGuncelle,
    handleKategoriSirala,
  } = useFinans();

  return (
    <div className="yonetim-bolumu-grid kategori-yonetimi">
      <KategoriListesi
        tip="gelir"
        baslik="Gelir Kategorileri"
        kategoriler={gelirKategorileri}
        onEkle={handleKategoriEkle}
        onSil={handleKategoriSil}
        onGuncelle={handleKategoriGuncelle}
        onSirala={handleKategoriSirala}
      />
      <KategoriListesi
        tip="gider"
        baslik="Gider Kategorileri"
        kategoriler={giderKategorileri}
        onEkle={handleKategoriEkle}
        onSil={handleKategoriSil}
        onGuncelle={handleKategoriGuncelle}
        onSirala={handleKategoriSirala}
      />
    </div>
  );
}

export default KategorilerYonetimi;
