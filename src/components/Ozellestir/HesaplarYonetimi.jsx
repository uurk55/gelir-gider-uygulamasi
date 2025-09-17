// src/components/Ozellestir/HesaplarYonetimi.jsx (İkonlar Eklendi)

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
// YENİ: İkonlar için getAccountIcon fonksiyonu ve FaWallet ikonu import edildi
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit, FaWallet } from 'react-icons/fa';
import { getAccountIcon } from '../../utils/iconMap';

function HesapSatiri({ hesap }) {
    const { handleHesapSil, handleHesapGuncelle } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [hesapAdi, setHesapAdi] = useState(hesap.ad);

    const onGuncelle = () => {
        if (hesapAdi.trim() !== hesap.ad && hesapAdi.trim() !== '') {
            handleHesapGuncelle(hesap.id, hesapAdi);
        }
        setIsEditing(false);
    };

    return (
        <div className="ozellestir-liste-item">
            {isEditing ? (
                <>
                    {/* YENİ: Düzenleme modunda da ikon gösteriliyor */}
                    <div className="liste-item-ikon">{getAccountIcon(hesap.ad)}</div>
                    <input 
                        type="text" 
                        value={hesapAdi} 
                        onChange={(e) => setHesapAdi(e.target.value)} 
                        className="liste-item-input"
                    />
                    <div className="liste-item-aksiyonlar">
                        <button onClick={onGuncelle} className="icon-btn"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                    </div>
                </>
            ) : (
                <>
                    {/* YENİ: Sol tarafa ikon ve yazı grubunu içeren bir div eklendi */}
                    <div className="kk-item-bilgi">
                        <div className="liste-item-ikon">{getAccountIcon(hesap.ad)}</div>
                        <span>{hesap.ad}</span>
                    </div>
                    <div className="liste-item-aksiyonlar">
                        <button onClick={() => setIsEditing(true)} className="icon-btn"><FaEdit /></button>
                        <button onClick={() => handleHesapSil(hesap.id)} className="icon-btn danger"><FaTrash /></button>
                    </div>
                </>
            )}
        </div>
    );
}

function HesaplarYonetimi() {
    const { hesaplar, handleHesapEkle } = useFinans();
    const [yeniHesapAdi, setYeniHesapAdi] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const onEkle = () => {
        if(yeniHesapAdi.trim() !== '') {
            handleHesapEkle(yeniHesapAdi);
            setYeniHesapAdi('');
            setIsAdding(false);
        }
    };

    return (
        <div className="yonetim-bolumu">
            <h2>Mevcut Hesaplar</h2>
            <div className="ozellestir-liste">
                {hesaplar.map(hesap => <HesapSatiri key={hesap.id} hesap={hesap} />)}
                
                {isAdding && (
                    <div className="ozellestir-liste-item ekleme-formu">
                        {/* YENİ: Ekleme satırına da varsayılan bir ikon eklendi */}
                        <div className="liste-item-ikon"><FaWallet /></div>
                        <input
                            type="text"
                            value={yeniHesapAdi}
                            onChange={(e) => setYeniHesapAdi(e.target.value)}
                            placeholder="Yeni Hesap Adı"
                            className="liste-item-input"
                            autoFocus
                        />
                        <div className="liste-item-aksiyonlar">
                            <button onClick={onEkle} className="icon-btn"><FaSave /></button>
                            <button onClick={() => setIsAdding(false)} className="icon-btn"><FaTimes /></button>
                        </div>
                    </div>
                )}
            </div>
            {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="ekle-btn">
                    <FaPlus /> Yeni Hesap Ekle
                </button>
            )}
        </div>
    );
}

export default HesaplarYonetimi;