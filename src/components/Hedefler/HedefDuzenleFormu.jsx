// src/components/Hedefler/HedefDuzenleFormu.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

function HedefDuzenleFormu({ hedef, onClose }) {
    const { handleHedefGuncelle } = useFinans();
    const [hedefAdi, setHedefAdi] = useState(hedef.ad);
    const [hedefTutar, setHedefTutar] = useState(hedef.hedefTutar);
    const [hedefTarih, setHedefTarih] = useState(hedef.hedefTarih || '');
    const [hata, setHata] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hedefAdi.trim() || !hedefTutar || parseFloat(hedefTutar) <= 0) {
            setHata('Hedef adı ve geçerli bir hedef tutarı girmek zorunludur.');
            return;
        }

        const guncelVeri = {
            ad: hedefAdi.trim(),
            hedefTutar: parseFloat(hedefTutar),
            hedefTarih: hedefTarih
        };
        
        handleHedefGuncelle(hedef.id, guncelVeri);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <motion.div className="modal-content" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
                <div className="modal-header">
                    <h2>Hedefi Düzenle</h2>
                    <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {hata && <p className="form-hata">{hata}</p>}
                    <div className="form-grup">
                        <label htmlFor="hedefAdi">Hedef Adı</label>
                        <input type="text" id="hedefAdi" value={hedefAdi} onChange={(e) => setHedefAdi(e.target.value)} required />
                    </div>
                    <div className="form-grup">
                        <label htmlFor="hedefTutar">Hedef Tutar (₺)</label>
                        <input type="number" id="hedefTutar" value={hedefTutar} onChange={(e) => setHedefTutar(e.target.value)} required min="1" />
                    </div>
                    <div className="form-grup">
                        <label htmlFor="hedefTarih">Hedef Tarih (İsteğe Bağlı)</label>
                        <input type="date" id="hedefTarih" value={hedefTarih} onChange={(e) => setHedefTarih(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-aksiyonlar">
                        <button type="button" onClick={onClose} className="secondary-btn">İptal</button>
                        <button type="submit" className="primary-btn">Değişiklikleri Kaydet</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default HedefDuzenleFormu;