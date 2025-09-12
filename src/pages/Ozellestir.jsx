// src/pages/Ozellestir.jsx (KREDİ KARTI MODÜLÜ EKLENMİŞ NİHAİ VERSİYON)
import React, { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash, FaGripVertical, FaPen, FaSave } from 'react-icons/fa';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';

// --- KREDİ KARTI YÖNETİMİ BİLEŞENLERİ (YENİ) ---
const KrediKartiListItem = ({ kart }) => {
    const { handleKrediKartiSil, handleKrediKartiGuncelle } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({ ...kart });

    const handleSave = () => {
        if (!editState.ad.trim() || !editState.kesimGunu || !editState.sonOdemeGunu) {
            return toast.error("Tüm alanlar doldurulmalıdır.");
        }
        handleKrediKartiGuncelle(kart.id, {
            ...editState,
            kesimGunu: parseInt(editState.kesimGunu),
            sonOdemeGunu: parseInt(editState.sonOdemeGunu)
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <li className="yonetim-listesi-item kk-yonetim-item">
                <input type="text" value={editState.ad} onChange={e => setEditState({...editState, ad: e.target.value})} placeholder="Kart Adı" />
                <input type="number" min="1" max="31" value={editState.kesimGunu} onChange={e => setEditState({...editState, kesimGunu: e.target.value})} placeholder="Kesim" />
                <input type="number" min="1" max="31" value={editState.sonOdemeGunu} onChange={e => setEditState({...editState, sonOdemeGunu: e.target.value})} placeholder="Son Ödeme" />
                <div className="buton-grubu">
                    <button onClick={handleSave} className="icon-btn duzenle-btn"><FaSave /></button>
                </div>
            </li>
        );
    }

    return (
        <li className="yonetim-listesi-item kk-yonetim-item">
            <span>{kart.ad}</span>
            <span>Kesim: {kart.kesimGunu}</span>
            <span>Son Ödeme: {kart.sonOdemeGunu}</span>
            <div className="buton-grubu">
                <button onClick={() => setIsEditing(true)} className="icon-btn duzenle-btn"><FaPen /></button>
                <button onClick={() => handleKrediKartiSil(kart.id)} className="icon-btn sil-btn"><FaTrash /></button>
            </div>
        </li>
    );
};

const KrediKartlariYonetimi = () => {
    const { krediKartlari, handleKrediKartiEkle } = useFinans();
    const [yeniKart, setYeniKart] = useState({ ad: '', kesimGunu: '', sonOdemeGunu: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setYeniKart(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!yeniKart.ad.trim() || !yeniKart.kesimGunu || !yeniKart.sonOdemeGunu) {
            return toast.error("Lütfen tüm alanları doldurun.");
        }
        handleKrediKartiEkle({
            ad: yeniKart.ad,
            kesimGunu: parseInt(yeniKart.kesimGunu),
            sonOdemeGunu: parseInt(yeniKart.sonOdemeGunu)
        });
        setYeniKart({ ad: '', kesimGunu: '', sonOdemeGunu: '' });
    };
    
    if(!krediKartlari) return <div>Yükleniyor...</div>;

    return (
        <div className="yonetim-sayfasi-layout">
             <div className="bolum">
                <h3>Yeni Kredi Kartı Ekle</h3>
                <form onSubmit={handleSubmit} className="form-modern">
                    <div>
                        <label>Kart Adı</label>
                        <input name="ad" type="text" value={yeniKart.ad} onChange={handleChange} placeholder="Örn: Garanti Bonus" />
                    </div>
                    <div>
                        <label>Hesap Kesim Günü (1-31)</label>
                        <input name="kesimGunu" type="number" min="1" max="31" value={yeniKart.kesimGunu} onChange={handleChange} placeholder="Örn: 27" />
                    </div>
                    <div>
                        <label>Son Ödeme Günü (1-31)</label>
                        <input name="sonOdemeGunu" type="number" min="1" max="31" value={yeniKart.sonOdemeGunu} onChange={handleChange} placeholder="Örn: 9" />
                    </div>
                    <button type="submit">Ekle</button>
                </form>
            </div>
            <div className="bolum">
                <h3>Mevcut Kredi Kartları</h3>
                {krediKartlari.length === 0 ? (<p>Henüz kredi kartı eklenmemiş.</p>) : (
                    <ul className="yonetim-listesi">
                        {krediKartlari.map(kart => (
                            <KrediKartiListItem key={kart.id} kart={kart} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
const HesapListItem = ({ hesap }) => {
    const { handleHesapSil, handleHesapGuncelle, hesaplar } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(hesap.ad);

    const handleSave = () => {
        if (name.trim() && name.trim() !== hesap.ad) {
            handleHesapGuncelle(hesap.id, name.trim());
        } else {
            setName(hesap.ad);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setName(hesap.ad);
            setIsEditing(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave(); // Eğer zaten düzenleme modundaysa, kaydet
        } else {
            setIsEditing(true); // Değilse, düzenleme moduna geç
        }
    };

    return (
        <li className="yonetim-listesi-item">
            {isEditing ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSave} // Input'tan çıkıldığında otomatik kaydet
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            ) : (
                <span>{hesap.ad}</span>
            )}
            <div className="buton-grubu">
                {/* DEĞİŞİKLİK: Buton artık hem düzenleme modunu açıyor hem de kaydediyor */}
                <button onClick={handleEditToggle} className="icon-btn duzenle-btn" aria-label={isEditing ? 'Kaydet' : 'Düzenle'}>
                    {isEditing ? <FaSave /> : <FaPen />}
                </button>
                {/* Silme butonu, düzenleme modunda değilken görünür */}
                {!isEditing && hesaplar.length > 1 && (
                    <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn sil-btn" aria-label="Sil">
                        <FaTrash />
                    </button>
                )}
            </div>
        </li>
    );
};

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


// --- KATEGORİ YÖNETİMİ BİLEŞENLERİ ---

function SortableKategoriItem({ tip, kategori, handleSil }) {
    const { handleKategoriGuncelle } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(kategori);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: kategori, disabled: isEditing });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const handleSave = () => {
        if (name.trim() && name.trim() !== kategori) {
            handleKategoriGuncelle(tip, kategori, name.trim());
        } else {
            setName(kategori);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setName(kategori);
            setIsEditing(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
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
                    {/* DEĞİŞİKLİK: Buton artık hem düzenleme modunu açıyor hem de kaydediyor */}
                    <button onClick={handleEditToggle} className="icon-btn duzenle-btn" aria-label={isEditing ? 'Kaydet' : 'Düzenle'}>
                        {isEditing ? <FaSave /> : <FaPen />}
                    </button>
                    {/* Silme butonu, düzenleme modunda değilken görünür */}
                    {!isEditing && (
                        <button onClick={() => handleSil(tip, kategori)} className="icon-btn sil-btn" aria-label="Sil">
                            <FaTrash />
                        </button>
                    )}
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


// --- ANA ÖZELLEŞTİR BİLEŞENİ ---

function Ozellestir() {
    const [aktifSekme, setAktifSekme] = useState('hesaplar');
    return (
        <div className="card">
            <div className="yonetim-sayfasi-header">
                <h2>Özelleştir</h2>
                <div className="islem-tipi-secici">
                    <button onClick={() => setAktifSekme('hesaplar')} className={aktifSekme === 'hesaplar' ? 'aktif' : ''}>Nakit & Banka</button>
                    <button onClick={() => setAktifSekme('kredikartlari')} className={aktifSekme === 'kredikartlari' ? 'aktif' : ''}>Kredi Kartları</button>
                    <button onClick={() => setAktifSekme('kategoriler')} className={aktifSekme === 'kategoriler' ? 'aktif' : ''}>Kategoriler</button>
                </div>
            </div>
            <div className="yonetim-sayfasi-icerik">
                {aktifSekme === 'hesaplar' && <HesaplarYonetimi />}
                {aktifSekme === 'kredikartlari' && <KrediKartlariYonetimi />}
                {aktifSekme === 'kategoriler' && <KategorilerYonetimi />}
            </div>
        </div>
    );
}

export default Ozellestir;