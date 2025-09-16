// src/components/GenelBakis/FinansalSaglikModal.jsx (EKSİK BİLGİ DÜZELTİLDİ - NİHAİ KOD)

import { useFinans } from '../../context/FinansContext';
import { motion } from 'framer-motion';
import { FaTimes, FaPiggyBank, FaClipboardCheck, FaShieldAlt } from 'react-icons/fa';

// MetrikDetay alt bileşeni (Değişiklik yok)
const MetrikDetay = ({ ikon, baslik, metrik }) => {
    const ilerlemeYuzdesi = (metrik.puan / metrik.maksimumPuan) * 100;
    const durumRengi = () => {
        if (metrik.durum === 'Mükemmel') return 'pozitif';
        if (metrik.durum === 'İyi') return 'uyari';
        return 'negatif';
    };
    return (
        <div className="metrik-detay-item">
            <div className="metrik-header">
                <div className="metrik-ikon">{ikon}</div>
                <div className="metrik-baslik-puan">
                    <h4>{baslik}</h4>
                    <span className={`metrik-durum ${durumRengi()}`}>{metrik.durum}</span>
                </div>
                <span className="metrik-puan">{metrik.puan}<small>/{metrik.maksimumPuan} Puan</small></span>
            </div>
            <div className="metrik-progress-bar-container">
                <div className={`metrik-progress-bar-dolu ${durumRengi()}`} style={{width: `${ilerlemeYuzdesi}%`}}></div>
            </div>
            <p className="metrik-aciklama">{metrik.aciklama}</p>
        </div>
    );
};

// Ana Modal Bileşeni
function FinansalSaglikModal({ onClose }) {
    const { finansalSaglikPuani } = useFinans();

    if (!finansalSaglikPuani || !finansalSaglikPuani.metrikler) {
        return (
            <motion.div className="modal-overlay">
                <motion.div className="modal-content saglik-modal">
                    <div className="modal-header">
                        <h2>Finansal Sağlık Raporu</h2>
                        <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
                    </div>
                    <p style={{padding: '2rem'}}>Detaylar yükleniyor...</p>
                </motion.div>
            </motion.div>
        );
    }

    // DEĞİŞİKLİK: 'puan' ve 'durum' isimlerini doğru şekilde alıyoruz.
    const { puan, durum, metrikler } = finansalSaglikPuani;

    const durumRengiClass = (durumMetni) => {
        if (durumMetni === 'Mükemmel') return 'pozitif';
        if (durumMetni === 'İyi') return 'uyari';
        return 'negatif';
    };


    return (
        <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="modal-content saglik-modal"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
            >
                <div className="modal-header">
                    <h2>Finansal Sağlık Raporu</h2>
                    <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
                </div>

                <div className="saglik-modal-ozet">
    <span className="ozet-puan">{puan}</span> 
    <span className="ozet-durum">
        Genel Durum: <span className={durumRengiClass(durum)}>{durum}</span>
    </span>
</div>

                <div className="metrik-detay-listesi">
                    <MetrikDetay ikon={<FaPiggyBank />} baslik="Tasarruf Oranı" metrik={metrikler.tasarrufOrani} />
                    <MetrikDetay ikon={<FaClipboardCheck />} baslik="Bütçe Kontrolü" metrik={metrikler.butceKontrolu} />
                    <MetrikDetay ikon={<FaShieldAlt />} baslik="Acil Durum Fonu" metrik={metrikler.acilDurumFonu} />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default FinansalSaglikModal;