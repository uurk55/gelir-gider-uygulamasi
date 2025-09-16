// src/components/GenelBakis/FinansalSaglikKarti.jsx (MODAL BAĞLANDI)

import { useState } from 'react'; // YENİ: useState'i import ediyoruz
import { useFinans } from '../../context/FinansContext';
import { FaHeartbeat } from 'react-icons/fa';
import CountUp from 'react-countup';
import FinansalSaglikModal from './FinansalSaglikModal'; // YENİ: Modal bileşenini import ediyoruz
import { AnimatePresence } from 'framer-motion'; // YENİ: Animasyon için

function FinansalSaglikKarti() {
    const { finansalSaglikPuani } = useFinans();
    const [isModalOpen, setIsModalOpen] = useState(false); 

    // --- YENİ KONTROL BLOĞU ---
    // Eğer finansalSaglikPuani objesi veya içindeki 'puan' değeri henüz gelmediyse,
    // bir yüklenme durumu göster (veya hiçbir şey gösterme).
    // typeof puan !== 'number' kontrolü, puanın 0 olduğu durumu yanlışlıkla atlamamızı engeller.
    if (!finansalSaglikPuani || typeof finansalSaglikPuani.puan !== 'number') {
        return (
            <div className="card finansal-saglik-karti is-loading">
                {/* İsteğe bağlı olarak bir yüklenme animasyonu veya iskelet gösterilebilir */}
                Yükleniyor...
            </div>
        );
    }
    // --- KONTROL BLOĞUNUN SONU ---

    // Bu noktadan sonra, 'puan' ve 'durum'un kesinlikle dolu olduğunu biliyoruz.
    const { puan, durum } = finansalSaglikPuani;

    const durumRengi = () => {
        if (durum === 'Mükemmel') return 'pozitif';
        if (durum === 'İyi') return 'uyari';
        return 'negatif';
    };

     return (
        <>
            <button className="card finansal-saglik-karti" onClick={() => setIsModalOpen(true)}>
                <div className="mini-kart-baslik">
                    <FaHeartbeat />
                    <h3>Finansal Sağlık Puanın</h3>
                </div>
                <div className="saglik-karti-icerik">
                    <div className="puan-daire">
                        <span className="puan-sayisi">
                            {/* Artık key'e gerek yok, çünkü veri hazır olduğunda render ediliyor */}
                            <CountUp end={puan} duration={2} />
                        </span>
                        <span className="puan-maksimum">/ 100</span>
                    </div>
                    <div className={`durum-etiketi ${durumRengi()}`}>
                        {durum}
                    </div>
                    <small className="detay-ipucu">Detaylar için tıkla</small>
                </div>
            </button>
            
            <AnimatePresence>
                {isModalOpen && <FinansalSaglikModal onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </>
    );
}

export default FinansalSaglikKarti;