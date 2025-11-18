// src/components/Hedefler/HedeflerOzetPanosu.jsx

import { useMemo } from 'react';
import { useFinans } from '../../context/FinansContext';
import { formatCurrency } from '../../utils/formatters';
import { FaPiggyBank, FaBullseye, FaCheckCircle } from 'react-icons/fa';

function OzetKarti({ ikon, baslik, deger, aciklama }) {
    return (
        <div className="ozet-karti card">
            <div className="ozet-karti-ikon">{ikon}</div>
            <div className="ozet-karti-icerik">
                <span className="ozet-karti-deger">{deger}</span>
                <span className="ozet-karti-baslik">{baslik}</span>
                <p className="ozet-karti-aciklama">{aciklama}</p>
            </div>
        </div>
    );
}

function HedeflerOzetPanosu() {
    const { hedefler } = useFinans();

    const ozetVerisi = useMemo(() => {
        const toplamBirikim = hedefler.reduce((acc, hedef) => acc + (hedef.mevcutTutar || 0), 0);
        const devamEdenHedefSayisi = hedefler.filter(h => h.mevcutTutar < h.hedefTutar).length;
        const tamamlananHedefSayisi = hedefler.length - devamEdenHedefSayisi;
        return { toplamBirikim, devamEdenHedefSayisi, tamamlananHedefSayisi };
    }, [hedefler]);

    if (!hedefler || hedefler.length === 0) return null;

    return (
        <div className="hedefler-ozet-panosu">
            <div className="ozet-panosu-grid">
                <OzetKarti 
                    ikon={<FaPiggyBank />}
                    deger={formatCurrency(ozetVerisi.toplamBirikim)}
                    baslik="Toplam Birikim"
                    aciklama="Tüm hedeflerinize biriktirdiğiniz toplam tutar."
                />
                <OzetKarti 
                    ikon={<FaBullseye />}
                    deger={ozetVerisi.devamEdenHedefSayisi}
                    baslik="Aktif Hedef"
                    aciklama="Şu anda birikim yaptığınız hedeflerinizin sayısı."
                />
                 <OzetKarti 
                    ikon={<FaCheckCircle />}
                    deger={ozetVerisi.tamamlananHedefSayisi}
                    baslik="Tamamlanan Hedef"
                    aciklama="Başarıyla ulaştığınız hedeflerinizin sayısı."
                />
            </div>
        </div>
    );
}

export default HedeflerOzetPanosu;