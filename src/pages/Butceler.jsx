// src/pages/Butceler.jsx (YENİDEN YAPILANDIRILMIŞ HALİ)

import { useState, useEffect } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// --- Tek bir Bütçe Satırını Yöneten Alt Bileşen ---
function ButceSatiri({ butce }) {
    const { handleButceSil, handleButceGuncelle, giderKategorileri } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    
    // Düzenleme state'ini, prop değiştiğinde güncel tutmak için
    const [editState, setEditState] = useState({ 
        kategori: butce.kategori, 
        limit: butce.limit 
    });

    useEffect(() => {
        setEditState({ kategori: butce.kategori, limit: butce.limit });
    }, [butce]);


    const onGuncelle = () => {
        if (editState.limit > 0) {
            handleButceGuncelle(butce.id, { 
                ...butce, // Mevcut diğer verileri koru
                kategori: editState.kategori,
                limit: parseFloat(editState.limit) 
            });
            setIsEditing(false);
        }
    };

    return (
        <div className="ozellestir-liste-item">
            {isEditing ? (
                <>
                    <select 
                        value={editState.kategori} 
                        onChange={(e) => setEditState({...editState, kategori: e.target.value})}
                        className="liste-item-select"
                    >
                        {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                    </select>
                    <input 
                        type="number" 
                        value={editState.limit} 
                        onChange={(e) => setEditState({...editState, limit: e.target.value})} 
                        className="liste-item-input"
                        style={{textAlign: 'right', maxWidth: '120px'}}
                    />
                    <div className="liste-item-aksiyonlar">
                        <button onClick={onGuncelle} className="icon-btn"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                    </div>
                </>
            ) : (
                <>
                    <span>{butce.kategori}</span>
                    <div className="liste-item-sag-taraf">
                        <span className="liste-item-deger">{formatCurrency(butce.limit)}</span>
                        <div className="liste-item-aksiyonlar">
                            <button onClick={() => setIsEditing(true)} className="icon-btn"><FaEdit /></button>
                            <button onClick={() => handleButceSil(butce.id)} className="icon-btn danger"><FaTrash /></button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}


// --- Ana Bütçeler Sayfası ---
function Butceler() {
    const { butceler, giderKategorileri, handleButceEkle } = useFinans();
    const [isAdding, setIsAdding] = useState(false);

    // Henüz bütçesi oluşturulmamış kategorileri bul
    const mevcutButceKategorileri = new Set(butceler.map(b => b.kategori));
    const eklenmemisKategoriler = giderKategorileri.filter(k => !mevcutButceKategorileri.has(k));

    const [yeniButce, setYeniButce] = useState({
        kategori: eklenmemisKategoriler[0] || '',
        limit: ''
    });
    
    // eklenmemiş kategori listesi değiştiğinde, formdaki varsayılan kategoriyi güncelle
    useEffect(() => {
        if (eklenmemisKategoriler.length > 0) {
            setYeniButce(prev => ({ ...prev, kategori: eklenmemisKategoriler[0] }));
        }
    }, [giderKategorileri, butceler]);

    const onEkle = () => {
        if (yeniButce.limit > 0 && yeniButce.kategori) {
            handleButceEkle({
                kategori: yeniButce.kategori,
                limit: parseFloat(yeniButce.limit)
            });
            setIsAdding(false);
            setYeniButce({ ...yeniButce, limit: '' }); // Sadece limiti sıfırla
        }
    };

    return (
        <div className="ozellestir-sayfasi-container">
            <div className="card">
                <div className="ozellestir-header">
                    <h1>Aylık Kategori Bütçeleri</h1>
                </div>
                <div className="ozellestir-icerik">
                    <div className="ozellestir-liste">
                        {butceler.map(butce => <ButceSatiri key={butce.id} butce={butce} />)}
                        
                        {isAdding && (
                            <div className="ozellestir-liste-item ekleme-formu">
                                <select
                                    value={yeniButce.kategori}
                                    onChange={(e) => setYeniButce({...yeniButce, kategori: e.target.value})}
                                    className="liste-item-select"
                                    autoFocus
                                >
                                    {eklenmemisKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                                </select>
                                <input
                                    type="number"
                                    value={yeniButce.limit}
                                    onChange={(e) => setYeniButce({...yeniButce, limit: e.target.value})}
                                    placeholder="Aylık Limit (₺)"
                                    className="liste-item-input"
                                    style={{textAlign: 'right'}}
                                />
                                <div className="liste-item-aksiyonlar">
                                    <button onClick={onEkle} className="icon-btn"><FaSave /></button>
                                    <button onClick={() => setIsAdding(false)} className="icon-btn"><FaTimes /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isAdding && eklenmemisKategoriler.length > 0 && (
                        <button onClick={() => setIsAdding(true)} className="ekle-btn">
                            <FaPlus /> Yeni Bütçe Ekle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Butceler;