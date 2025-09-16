// src/components/GenelBakis/HedefOzetKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { Link } from 'react-router-dom';
import { FaBullseye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

function HedefOzetKarti() {
    const { onecelikliHedef } = useFinans();

    // Eğer gösterilecek bir hedef yoksa, hiçbir şey gösterme
    if (!onecelikliHedef) {
        // Alternatif olarak burada "Yeni bir hedef oluştur" linki de gösterebiliriz
        return null;
    }

    const { ad, mevcutTutar = 0, hedefTutar } = onecelikliHedef;
    const ilerlemeYuzdesi = hedefTutar > 0 ? (mevcutTutar / hedefTutar) * 100 : 0;

    return (
        <div className="card hedef-ozet-karti">
            <div className="mini-kart-baslik"><FaBullseye /><h3>Öncelikli Hedef</h3></div>
            <div className="hedef-ozet-icerik">
                <span className="hedef-adi">{ad}</span>
                <div className="hedef-tutar-bilgisi">
                    <span className="mevcut">{formatCurrency(mevcutTutar)}</span>
                    <span className="hedef">/ {formatCurrency(hedefTutar)}</span>
                </div>
                <div className="progress-bar-container">
                    <motion.div 
                        className="progress-bar-dolu"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(ilerlemeYuzdesi, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="hedef-ozet-alt-bilgi">
                    <span>%{ilerlemeYuzdesi.toFixed(1)} tamamlandı</span>
                    <Link to="/hedefler" className="detay-link">Tüm Hedefler →</Link>
                </div>
            </div>
        </div>
    );
}

export default HedefOzetKarti;