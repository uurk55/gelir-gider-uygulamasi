// src/pages/Butceler.jsx (BASİTLEŞTİRİLMİŞ VE HATALARI GİDERİLMİŞ NİHAİ VERSİYON)

import { useState, useEffect } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// --- Tek bir Bütçe Satırını Yöneten Alt Bileşen ---
function ButceSatiri({ butceDetay }) {
    const { id, kategori, limit, harcanan, kalan, yuzde, durum } = butceDetay;
    const { handleButceSil, handleButceGuncelle, giderKategorileri } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [editLimit, setEditLimit] = useState(limit);

    const onGuncelle = () => {
        if (editLimit > 0) {
            handleButceGuncelle(id, { kategori, limit: parseFloat(editLimit) });
            setIsEditing(false);
        }
    };
    
    return (
        <div className={`butce-karti ${durum}`}>
            <div className="butce-karti-header">
                <span className="kategori-adi">{kategori}</span>
                {isEditing ? (
                    <div className="liste-item-aksiyonlar">
                        <button onClick={onGuncelle} className="icon-btn"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                    </div>
                ) : (
                    <div className="liste-item-aksiyonlar">
                        <button onClick={() => setIsEditing(true)} className="icon-btn"><FaEdit /></button>
                        <button onClick={() => handleButceSil(id)} className="icon-btn danger"><FaTrash /></button>
                    </div>
                )}
            </div>
            <div className="butce-karti-body">
                <div className="butce-karti-rakamlar">
                    <span className="harcanan">{formatCurrency(harcanan)}</span>
                    {isEditing ? (
                        <input
                            type="number"
                            value={editLimit}
                            onChange={(e) => setEditLimit(e.target.value)}
                            className="limit-input"
                        />
                    ) : (
                        <span className="limit">/ {formatCurrency(limit)}</span>
                    )}
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar-dolu" style={{ width: `${yuzde}%` }}></div>
                </div>
            </div>
            <div className="butce-karti-footer">
                <span className={`kalan-tutar ${kalan < 0 ? 'negatif' : 'pozitif'}`}>
                    {kalan >= 0 ? `${formatCurrency(kalan)} KULLANILABİLİR` : `${formatCurrency(Math.abs(kalan))} AŞIM`}
                </span>
            </div>
        </div>
    );
}

// --- Ana Bütçeler Sayfası ---
function Butceler() {
    const { butceDurumlari, giderKategorileri, handleButceEkle } = useFinans();
    const [isAdding, setIsAdding] = useState(false);

    const mevcutButceKategorileri = new Set(butceDurumlari.map(b => b.kategori));
    const eklenmemisKategoriler = giderKategorileri.filter(k => !mevcutButceKategorileri.has(k));

    const [yeniButce, setYeniButce] = useState({
        kategori: eklenmemisKategoriler[0] || '',
        limit: ''
    });
    
    useEffect(() => {
        if (!isAdding && eklenmemisKategoriler.length > 0) {
            setYeniButce({ kategori: eklenmemisKategoriler[0] || '', limit: '' });
        }
    }, [isAdding, giderKategorileri, butceDurumlari]);

    const onEkle = () => {
        if (yeniButce.limit > 0 && yeniButce.kategori) {
            handleButceEkle({
                kategori: yeniButce.kategori,
                limit: parseFloat(yeniButce.limit)
            });
            setIsAdding(false);
        }
    };

    return (
        <div className="ozellestir-sayfasi-container">
            <div className="card">
                <div className="ozellestir-header">
                    <h1>Aylık Kategori Bütçeleri</h1>
                </div>
                <div className="ozellestir-icerik">
                    <div className="butce-listesi-container">
                        {butceDurumlari.map(butce => <ButceSatiri key={butce.id} butceDetay={butce} />)}
                        
                        {isAdding && (
                            <div className="butce-karti ekleme-formu">
                                <div className="butce-duzenleme-formu" style={{width: '100%'}}>
                                     <select
                                        value={yeniButce.kategori}
                                        onChange={(e) => setYeniButce({...yeniButce, kategori: e.target.value})}
                                        autoFocus
                                    >
                                        <option value="" disabled>Kategori Seç...</option>
                                        {eklenmemisKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                                    </select>
                                    <input
                                        type="number"
                                        value={yeniButce.limit}
                                        onChange={(e) => setYeniButce({...yeniButce, limit: e.target.value})}
                                        placeholder="Limit (₺)"
                                        className='limit-input'
                                    />
                                    <div className="liste-item-aksiyonlar">
                                        <button onClick={onEkle} className="icon-btn"><FaSave /></button>
                                        <button onClick={() => setIsAdding(false)} className="icon-btn"><FaTimes /></button>
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
                </div>
            </div>
        </div>
    );
}

export default Butceler;