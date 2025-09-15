// src/components/Ozellestir/KrediKartlariYonetimi.jsx
// Bu bileşen, satır içi ekleme/düzenleme için henüz tam olarak hazır değil,
// çünkü birden fazla input alanı içeriyor. Şimdilik eski yapıyı koruyup
// görsel tutarlılığı sağlayacak şekilde basitleştiriyoruz.
// Bir sonraki adımda bunu da "satır içi" yapabiliriz.

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaTrash, FaEdit } from 'react-icons/fa';

function KrediKartlariYonetimi() {
    const { krediKartlari, handleKrediKartiEkle, handleKrediKartiSil, handleKrediKartiGuncelle } = useFinans();
    const [kartAdi, setKartAdi] = useState('');
    const [kesimGunu, setKesimGunu] = useState('');
    const [sonOdemeGunu, setSonOdemeGunu] = useState('');
    const [editingKart, setEditingKart] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const yeniKart = { ad: kartAdi, kesimGunu, sonOdemeGunu };
        if (editingKart) {
            handleKrediKartiGuncelle(editingKart.id, yeniKart);
        } else {
            handleKrediKartiEkle(yeniKart);
        }
        resetForm();
    };
    
    const resetForm = () => {
        setKartAdi('');
        setKesimGunu('');
        setSonOdemeGunu('');
        setEditingKart(null);
    };
    
    const onDuzenle = (kart) => {
        setEditingKart(kart);
        setKartAdi(kart.ad);
        setKesimGunu(kart.kesimGunu);
        setSonOdemeGunu(kart.sonOdemeGunu);
    };

    return (
        <div className="yonetim-bolumu-grid">
            <div className="form-alani">
                <h2>{editingKart ? 'Kredi Kartını Düzenle' : 'Yeni Kredi Kartı Ekle'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grup">
                        <label>Kart Adı</label>
                        <input type="text" value={kartAdi} onChange={(e) => setKartAdi(e.target.value)} placeholder="Örn: Garanti Bonus" required />
                    </div>
                    <div className="form-grup">
                        <label>Hesap Kesim Günü (1-31)</label>
                        <input type="number" value={kesimGunu} onChange={(e) => setKesimGunu(e.target.value)} placeholder="Örn: 27" required min="1" max="31" />
                    </div>
                    <div className="form-grup">
                        <label>Son Ödeme Günü (1-31)</label>
                        <input type="number" value={sonOdemeGunu} onChange={(e) => setSonOdemeGunu(e.target.value)} placeholder="Örn: 9" required min="1" max="31" />
                    </div>
                    <div className="form-aksiyonlar">
                         {editingKart && <button type="button" onClick={resetForm} className="secondary-btn">İptal</button>}
                        <button type="submit" className="primary-btn">{editingKart ? 'Güncelle' : 'Ekle'}</button>
                    </div>
                </form>
            </div>
            <div className="liste-alani">
                 <h2>Mevcut Kredi Kartları</h2>
                <div className="ozellestir-liste">
                    {krediKartlari.map(kart => (
                        <div key={kart.id} className="ozellestir-liste-item kk-item">
                            <div className="kk-item-bilgi">
                                <span>{kart.ad}</span>
                                <small>Kesim: {kart.kesimGunu}</small>
                                <small>Son Ödeme: {kart.sonOdemeGunu}</small>
                            </div>
                            <div className="liste-item-aksiyonlar">
                                <button onClick={() => onDuzenle(kart)} className="icon-btn"><FaEdit /></button>
                                <button onClick={() => handleKrediKartiSil(kart.id)} className="icon-btn danger"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KrediKartlariYonetimi;