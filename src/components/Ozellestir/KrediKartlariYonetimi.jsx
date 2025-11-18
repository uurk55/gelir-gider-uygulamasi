// src/components/Ozellestir/KrediKartlariYonetimi.jsx (Satır İçi Ekleme/Düzenleme Mantığıyla Yeniden Yazıldı)

import { useState, useEffect } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaTrash, FaEdit, FaSave, FaTimes, FaPlus, FaCreditCard } from 'react-icons/fa';
import toast from 'react-hot-toast';


// Her bir kart satırını yöneten alt bileşen
function KartSatiri({ kart }) {
    const { handleKrediKartiSil, handleKrediKartiGuncelle } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    
    const [editState, setEditState] = useState({ 
        ad: kart.ad, 
        kesimGunu: kart.kesimGunu,
        sonOdemeGunu: kart.sonOdemeGunu
    });

    useEffect(() => {
        setEditState({ ad: kart.ad, kesimGunu: kart.kesimGunu, sonOdemeGunu: kart.sonOdemeGunu });
    }, [kart, isEditing]);

    const onGuncelle = () => {
        if (!editState.ad.trim() || !editState.kesimGunu || !editState.sonOdemeGunu) {
            return toast.error("Tüm alanlar doldurulmalıdır.");
        }
        handleKrediKartiGuncelle(kart.id, {
            ad: editState.ad.trim(),
            kesimGunu: editState.kesimGunu,
            sonOdemeGunu: editState.sonOdemeGunu
        });
        setIsEditing(false);
    };

    return (
        <div className="ozellestir-liste-item">
            {isEditing ? (
                <>
                    <FaCreditCard className="liste-item-ikon" />
                    <input 
                        type="text" 
                        value={editState.ad} 
                        onChange={(e) => setEditState({...editState, ad: e.target.value})} 
                        className="liste-item-input"
                    />
                    <div className="kk-input-grubu">
                        <input type="number" value={editState.kesimGunu} onChange={(e) => setEditState({...editState, kesimGunu: e.target.value})} placeholder="Kesim" />
                        <input type="number" value={editState.sonOdemeGunu} onChange={(e) => setEditState({...editState, sonOdemeGunu: e.target.value})} placeholder="Ödeme" />
                    </div>
                    <div className="liste-item-aksiyonlar">
                        <button onClick={onGuncelle} className="icon-btn"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                    </div>
                </>
            ) : (
                <>
                    <div className="kk-item-bilgi">
                        <FaCreditCard className="liste-item-ikon" />
                        <span>{kart.ad}</span>
                    </div>
                    <div className="kk-item-detay">
                        <small>Kesim: {kart.kesimGunu}. gün</small>
                        <small>Son Ödeme: {kart.sonOdemeGunu}. gün</small>
                    </div>
                    <div className="liste-item-aksiyonlar">
                        <button onClick={() => setIsEditing(true)} className="icon-btn"><FaEdit /></button>
                        <button onClick={() => handleKrediKartiSil(kart.id)} className="icon-btn danger"><FaTrash /></button>
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
    const [yeniKart, setYeniKart] = useState({ ad: '', kesimGunu: '', sonOdemeGunu: '' });

    const onEkle = () => {
        if (!yeniKart.ad.trim() || !yeniKart.kesimGunu || !yeniKart.sonOdemeGunu) {
            return toast.error("Lütfen tüm alanları doldurun.");
        }
        handleKrediKartiEkle(yeniKart);
        setYeniKart({ ad: '', kesimGunu: '', sonOdemeGunu: '' });
        setIsAdding(false);
    };

    return (
        <div className="yonetim-bolumu">
            <h2>Kayıtlı Kartlar</h2>
            <div className="ozellestir-liste">
                {krediKartlari.length === 0 && !isAdding && (
                    <p className="liste-bos-mesaji">Henüz bir kredi kartı eklemediniz.</p>
                )}
                {krediKartlari.map(kart => <KartSatiri key={kart.id} kart={kart} />)}
                
                {isAdding && (
                    <div className="ozellestir-liste-item ekleme-formu">
                         <FaCreditCard className="liste-item-ikon" />
                        <input
                            type="text"
                            value={yeniKart.ad}
                            onChange={(e) => setYeniKart({...yeniKart, ad: e.target.value})}
                            placeholder="Yeni Kart Adı"
                            className="liste-item-input"
                            autoFocus
                        />
                        <div className="kk-input-grubu">
                            <input type="number" value={yeniKart.kesimGunu} onChange={(e) => setYeniKart({...yeniKart, kesimGunu: e.target.value})} placeholder="Kesim Günü" />
                            <input type="number" value={yeniKart.sonOdemeGunu} onChange={(e) => setYeniKart({...yeniKart, sonOdemeGunu: e.target.value})} placeholder="Ödeme Günü" />
                        </div>
                        <div className="liste-item-aksiyonlar">
                            <button onClick={onEkle} className="icon-btn"><FaSave /></button>
                            <button onClick={() => setIsAdding(false)} className="icon-btn"><FaTimes /></button>
                        </div>
                    </div>
                )}
            </div>
            {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="ekle-btn">
                    <FaPlus /> Yeni Kart Ekle
                </button>
            )}
        </div>
    );
}

export default KrediKartlariYonetimi;