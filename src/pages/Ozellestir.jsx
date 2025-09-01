// src/pages/Ozellestir.jsx (TAM VE DÜZENLENMİŞ NİHAİ VERSİYON)
import React, { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash, FaGripVertical } from 'react-icons/fa';

// DND Kit kütüphanesinden gerekli importlar
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ==========================================================================
// HESAPLAR YÖNETİMİ BÖLÜMÜ
// ==========================================================================
const HesaplarYonetimi = () => {
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
                {hesaplar.length === 0 ? (
                    <p>Henüz bir hesap eklemediniz.</p>
                ) : (
                    <ul className="yonetim-listesi">
                        {hesaplar.map(hesap => (
                            <li key={hesap.id} className="yonetim-listesi-item">
                                <span>{hesap.ad}</span>
                                {hesaplar.length > 1 && (
                                    <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn sil-btn" aria-label="Sil">
                                       <FaTrash />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


// ==========================================================================
// KATEGORİLER YÖNETİMİ BÖLÜMÜ (YENİ EKLENEN KISIM)
// ==========================================================================
function SortableKategoriItem({ tip, kategori, handleSil }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: kategori });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <li ref={setNodeRef} style={style} className="yonetim-listesi-item">
            <div className="kategori-sol-taraf-sirala">
                <span {...attributes} {...listeners} className="drag-handle">
                    <FaGripVertical />
                </span>
                <span>{kategori}</span>
            </div>
            {kategori !== 'Diğer' && (
                <button onClick={() => handleSil(tip, kategori)} className="icon-btn sil-btn" aria-label="Sil">
                    <FaTrash />
                </button>
            )}
        </li>
    );
}

function KategoriYonetimBolumu({ tip, baslik, kategoriler, handleEkle, handleSil, handleSirala }) {
    const [yeniKategori, setYeniKategori] = useState('');
    const onEkle = (e) => {
        e.preventDefault();
        if (!yeniKategori.trim()) return;
        handleEkle(tip, yeniKategori.trim());
        setYeniKategori('');
    };
    function handleDragEnd(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            handleSirala(tip, active.id, over.id);
        }
    }
    return (
        <div className="bolum">
            <h3>{baslik}</h3>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={kategoriler} strategy={verticalListSortingStrategy}>
                    <ul className="yonetim-listesi">
                        {kategoriler.map(kat => (
                           <SortableKategoriItem key={kat} tip={tip} kategori={kat} handleSil={handleSil} />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
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

    if (!giderKategorileri || !gelirKategorileri) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="yonetim-sayfasi-layout">
            <KategoriYonetimBolumu tip="gelir" baslik="Gelir Kategorileri" kategoriler={gelirKategorileri} handleEkle={handleKategoriEkle} handleSil={handleKategoriSil} handleSirala={handleKategoriSirala} />
            <KategoriYonetimBolumu tip="gider" baslik="Gider Kategorileri" kategoriler={giderKategorileri} handleEkle={handleKategoriEkle} handleSil={handleKategoriSil} handleSirala={handleKategoriSirala} />
        </div>
    );
};


// ==========================================================================
// ANA ÖZELLEŞTİR SAYFASI
// ==========================================================================
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