// src/components/Hedefler/HedefEkleFormu.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

function HedefEkleFormu({ onClose }) {
    const { handleHedefEkle } = useFinans();
    const [hedefAdi, setHedefAdi] = useState('');
    const [hedefTutar, setHedefTutar] = useState('');
    const [hedefTarih, setHedefTarih] = useState('');
    const [hata, setHata] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!hedefAdi.trim() || !hedefTutar || parseFloat(hedefTutar) <= 0) {
            setHata('Hedef adı ve geçerli bir hedef tutarı girmek zorunludur.');
            return;
        }

        const yeniHedef = {
            ad: hedefAdi.trim(),
            hedefTutar: parseFloat(hedefTutar),
            hedefTarih: hedefTarih // Tarih boş olabilir
        };

        handleHedefEkle(yeniHedef);
        onClose(); // Formu kapat
    };

    return (
        <div className="modal-overlay">
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
            >
                <div className="modal-header">
                    <h2>Yeni Tasarruf Hedefi Oluştur</h2>
                    <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {hata && <p className="form-hata">{hata}</p>}
                    
                    <div className="form-grup">
                        <label htmlFor="hedefAdi">Hedef Adı</label>
                        <input
                            type="text"
                            id="hedefAdi"
                            value={hedefAdi}
                            onChange={(e) => setHedefAdi(e.target.value)}
                            placeholder="Örn: Yeni Bilgisayar"
                            required
                        />
                    </div>
                    
                    <div className="form-grup">
                        <label htmlFor="hedefTutar">Hedef Tutar (₺)</label>
                        <input
                            type="number"
                            id="hedefTutar"
                            value={hedefTutar}
                            onChange={(e) => setHedefTutar(e.target.value)}
                            placeholder="Örn: 45000"
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-grup">
                        <label htmlFor="hedefTarih">Hedef Tarih (İsteğe Bağlı)</label>
                        <input
                            type="date"
                            id="hedefTarih"
                            value={hedefTarih}
                            onChange={(e) => setHedefTarih(e.target.value)}
                            min={new Date().toISOString().split('T')[0]} // Geçmiş bir tarih seçilemesin
                        />
                    </div>

                    <div className="form-aksiyonlar">
                        <button type="button" onClick={onClose} className="secondary-btn">İptal</button>
                        <button type="submit" className="primary-btn">Hedefi Oluştur</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default HedefEkleFormu;