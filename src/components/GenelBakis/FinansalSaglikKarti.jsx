// src/components/GenelBakis/FinansalSaglikKarti.jsx

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaHeartbeat } from 'react-icons/fa';
import CountUp from 'react-countup';
import FinansalSaglikModal from './FinansalSaglikModal';
import { AnimatePresence } from 'framer-motion';

function FinansalSaglikKarti() {
    const { finansalSaglikPuani } = useFinans();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Veri henüz hazır değilse
    if (!finansalSaglikPuani || typeof finansalSaglikPuani.puan !== 'number') {
        return (
            <div className="card finansal-saglik-karti is-loading">
                Yükleniyor...
            </div>
        );
    }

    const { puan, durum } = finansalSaglikPuani;

    const durumRengi = () => {
        if (durum === 'Mükemmel') return 'pozitif';
        if (durum === 'İyi') return 'uyari';
        return 'negatif';
    };

    // PUAN ALTINDA GÖRÜNECEK KISA YORUM
    const kisaYorumMetni = (() => {
        if (durum === 'Mükemmel') {
            return "Finansal durumun çok güçlü, bu istikrarı korumaya odaklan.";
        }
        if (durum === 'İyi') {
            return "Sağlam bir seviyedesin, küçük iyileştirmelerle puanın daha da artabilir.";
        }
        // Geliştirilmeli vb. durumlar
        return "Tasarrufunu ve bütçe takibini güçlendirirsen puanın hızla yükselebilir.";
    })();

    return (
        <>
            <button
                className="card finansal-saglik-karti"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="mini-kart-baslik">
                    <FaHeartbeat />
                    <h3>Finansal Sağlık Puanın</h3>
                </div>

                <div className="saglik-karti-icerik">
                    <div className="puan-daire">
                        <span className="puan-sayisi">
                            <CountUp end={puan} duration={2} />
                        </span>
                        <span className="puan-maksimum">/ 100</span>
                    </div>

                    <div className={`durum-etiketi ${durumRengi()}`}>
                        {durum}
                    </div>

                    {/* YENİ: PUAN ALTINDA KISA YORUM */}
                    <p className="kisa-finansal-yorum">
                        {kisaYorumMetni}
                    </p>

                    <small className="detay-ipucu">Detaylar için tıkla</small>
                </div>
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <FinansalSaglikModal onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

export default FinansalSaglikKarti;
