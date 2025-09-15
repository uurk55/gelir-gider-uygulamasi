// src/components/GenelBakis/AylikOzetKarti.jsx (RENKLER DÜZELTİLDİ)

import { useNavigate } from 'react-router-dom';
import { useFinans } from '../../context/FinansContext';
import { FaPlus } from 'react-icons/fa';
// formatCurrency'e artık ihtiyacımız yok, silebiliriz
import CountUp from 'react-countup'; 

function AylikOzetKarti() {
    const navigate = useNavigate();
    const { seciliYil, seciliAy, toplamGelir, toplamGider } = useFinans();

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });
    const aylikDurum = toplamGelir - toplamGider;

    return (
        <div className="card">
            <div className="card-header">
                <h2>{ayAdi} Ayı Özeti</h2>
                <button onClick={() => navigate('/islemler')} className="primary-btn card-header-action" aria-label="Yeni İşlem Ekle">
                    <FaPlus style={{ marginRight: '8px' }} /> Yeni İşlem
                </button>
            </div>
            <div className="aylik-ozet-kutusu">
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Toplam Gelir</span>
                    {/* DÜZELTME: "gelir-renk" sınıfını geri ekledik */}
                    <span className="ozet-tutar gelir-renk"> 
                        + <CountUp end={toplamGelir} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Toplam Gider</span>
                    {/* DÜZELTME: "gider-renk" sınıfını geri ekledik */}
                    <span className="ozet-tutar gider-renk">
                        - <CountUp end={toplamGider} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Aylık Durum</span>
                    {/* DÜZELTME: Dinamik sınıfı geri ekledik */}
                    <span className={`ozet-tutar aylik-durum ${aylikDurum >= 0 ? 'gelir-renk' : 'gider-renk'}`}>
                        <CountUp end={aylikDurum} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                </div>
            </div>
            <div className="aylik-durum-mesaji">
                {aylikDurum >= 0 ? "Harika gidiyorsun! Bu ay hedeflerine yaklaştın." : "Bu ay harcamalar geliri aştı. Önümüzdeki ay dikkatli olalım."}
            </div>
        </div>
    );
}

export default AylikOzetKarti;