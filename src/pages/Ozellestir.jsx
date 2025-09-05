// src/pages/Ozellestir.jsx (TÜM DÜZELTMELERİ İÇEREN TAM VE EKSİKSİZ VERSİYON)
import React, { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash, FaGripVertical, FaPen } from 'react-icons/fa'; // EKSİK OLAN FaPen İKONUNU EKLEDİM
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- HESAP YÖNETİMİ BİLEŞENLERİ ---

// Her bir hesap satırının mantığını ve görünümünü yöneten alt bileşen
const HesapListItem = ({ hesap }) => {
    const { handleHesapSil, handleHesapGuncelle, hesaplar } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(hesap.ad);

    const handleSave = () => {
        if (name.trim() && name !== hesap.ad) {
            handleHesapGuncelle(hesap.id, name);
        } else {
            // Eğer isim boş bırakıldıysa veya değişmediyse eski haline dön
            setName(hesap.ad);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setName(hesap.ad);
            setIsEditing(false);
        }
    };

    return (
        <li className="yonetim-listesi-item">
            {isEditing ? (
                <input
                    className="form-modern-input-inline" // Stillerin daha iyi olması için bir class ekleyebiliriz
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            ) : (
                <span>{hesap.ad}</span>
            )}
            <div className="buton-grubu">
                <button onClick={() => setIsEditing(!isEditing)} className="icon-btn duzenle-btn" aria-label="Düzenle">
                    <FaPen />
                </button>
                {hesaplar.length > 1 && (
                    <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn sil-btn" aria-label="Sil">
                        <FaTrash />
                    </button>
                )}
            </div>
        </li>
    );
};

// Hesaplar sekmesinin genel yapısını oluşturan ana bileşen
const HesaplarYonetimi = () => {
    const { hesaplar, handleHesapEkle } = useFinans();
    const [yeniHesapAdi, setYeniHesapAdi] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!yeniHesapAdi.trim()) return;
        handleHesapEkle(yeniHesapAdi);
        setYeniHesapAdi('');
    };

    if (!hesaplar) { return <div>Yükleniyor...</div>; }

    return (
        <div className="yonetim-sayfasi-layout">
            <div className="bolum">
                <h3>Yeni Hesap Ekle</h3>
                <form onSubmit={handleSubmit} className="form-modern">
                    <div>
                        <label htmlFor="hesapAdi">Hesap Adı</label>
                        <input id="hesapAdi" type="text" value={yeniHesapAdi} onChange={(e) => setYeniHesapAdi(e.target.value)} placeholder="Örn: Kredi Kartı" />
                    </div>
                    <button type="submit">Ekle</button>
                </form>
            </div>
            <div className="bolum">
                <h3>Mevcut Hesaplar</h3>
                {hesaplar.length === 0 ? (<p>Henüz hesap eklenmemiş.</p>) : (
                    <ul className="yonetim-listesi">
                        {hesaplar.map(hesap => (
                            <HesapListItem key={hesap.id} hesap={hesap} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


// --- KATEGORİ YÖNETİMİ BİLEŞENLERİ (GERİ EKLEDİM) ---

function SortableKategoriItem({ tip, kategori, handleSil }) {
    const { handleKategoriGuncelle } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(kategori);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: kategori, disabled: isEditing }); // Düzenleme modundayken sürüklemeyi devre dışı bırak
    const style = { transform: CSS.Transform.toString(transform), transition, };

    const handleSave = () => {
        if (name.trim() && name !== kategori) {
            handleKategoriGuncelle(tip, kategori, name);
        } else {
            setName(kategori);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setName(kategori);
            setIsEditing(false);
        }
    };

    return (
        <li ref={setNodeRef} style={style} className="yonetim-listesi-item" {...attributes}>
            <div className="kategori-sol-taraf-sirala">
                <span {...listeners} className="drag-handle" style={{ cursor: isEditing ? 'default' : 'grab' }}>
                    <FaGripVertical />
                </span>
                {isEditing ? (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <span>{kategori}</span>
                )}
            </div>
            {kategori !== 'Diğer' && (
                <div className="buton-grubu">
                    <button onClick={() => setIsEditing(!isEditing)} className="icon-btn duzenle-btn" aria-label="Düzenle">
                        <FaPen />
                    </button>
                    <button onClick={() => handleSil(tip, kategori)} className="icon-btn sil-btn" aria-label="Sil">
                        <FaTrash />
                    </button>
                </div>
            )}
        </li>
    );
}

function KategoriYonetimBolumu({ tip, baslik, kategoriler, handleEkle, handleSil, handleSirala }) {
    const [yeniKategori, setYeniKategori] = useState('');
    const onEkle = (e) => { e.preventDefault(); if (!yeniKategori.trim()) return; handleEkle(tip, yeniKategori.trim()); setYeniKategori(''); };
    function handleDragEnd(event) { const { active, over } = event; if (over && active.id !== over.id) { handleSirala(tip, active.id, over.id); } }
    return (
        <div className="bolum">
            <h3>{baslik}</h3>
            {kategoriler.length === 0 ? (<p>Henüz kategori eklenmemiş.</p>) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={kategoriler} strategy={verticalListSortingStrategy}>
                        <ul className="yonetim-listesi">
                            {kategoriler.map(kat => (<SortableKategoriItem key={kat} tip={tip} kategori={kat} handleSil={handleSil} />))}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
            <form onSubmit={onEkle} className="form-modern">
                <div>
                    <label htmlFor={`yeni-kategori-${tip}`}>Yeni Kategori Ekle</label>
                    <input id={`yeni-kategori-${tip}`} type="text" value={yeniKategori} onChange={(e) => setYeniKategori(e.target.value)} placeholder="Yeni kategori adı..."/>
                </div>
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
}

const KategorilerYonetimi = () => {
    const { giderKategorileri, gelirKategorileri, handleKategoriEkle, handleKategoriSil, handleKategoriSirala } = useFinans();
    if (!giderKategorileri || !gelirKategorileri) { return <div>Yükleniyor...</div>; }
    return (
        <div className="yonetim-sayfasi-layout">
            <KategoriYonetimBolumu tip="gelir" baslik="Gelir Kategorileri" kategoriler={gelirKategorileri} handleEkle={handleKategoriEkle} handleSil={handleKategoriSil} handleSirala={handleKategoriSirala} />
            <KategoriYonetimBolumu tip="gider" baslik="Gider Kategorileri" kategoriler={giderKategorileri} handleEkle={handleKategoriEkle} handleSil={handleKategoriSil} handleSirala={handleKategoriSirala} />
        </div>
    );
};

// --- ANA ÖZELLEŞTİR BİLEŞENİ (GERİ EKLEDİM) ---

function Ozellestir() {
    const [aktifSekme, setAktifSekme] = useState('hesaplar');
    return (
        <div className="card">
            <div className="yonetim-sayfasi-header">
                <h2>Özelleştir</h2>
                <div className="islem-tipi-secici">
                    <button onClick={() => setAktifSekme('hesaplar')} className={aktifSekme === 'hesaplar' ? 'aktif' : ''}>Hesaplar</button>
                    <button onClick={() => setAktifSekme('kategoriler')} className={aktifSekme === 'kategoriler' ? 'aktif' : ''}>Kategoriler</button>
                </div>
            </div>
            <div className="yonetim-sayfasi-icerik">
                {aktifSekme === 'hesaplar' && <HesaplarYonetimi />}
                {aktifSekme === 'kategoriler' && <KategorilerYonetimi />}
            </div>
        </div>
    );
}

export default Ozellestir;