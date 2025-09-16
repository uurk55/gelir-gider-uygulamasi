// src/components/GenelBakis/AylikOzetKarti.jsx (TREND OKLARI EKLENDİ)

import { useNavigate } from 'react-router-dom';
import { useFinans } from '../../context/FinansContext';
import { FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import CountUp from 'react-countup'; 

// YENİ: Trend göstergesini oluşturan küçük bir yardımcı bileşen
const TrendGostergesi = ({ yuzde }) => {
    if (yuzde === 0 || !isFinite(yuzde)) return null;

    const pozitifMi = yuzde > 0;
    const ikon = pozitifMi ? <FaArrowUp /> : <FaArrowDown />;
    
    // Gider için durum tersine döner: Artış kötüdür (kırmızı), azalış iyidir (yeşil)
    // Bu mantığı doğrudan renk sınıfı atamasında yöneteceğiz.

    return (
        <span className="trend-gostergesi">
            {ikon} {Math.abs(yuzde).toFixed(0)}%
        </span>
    );
};


function AylikOzetKarti() {
    const navigate = useNavigate();
    const { 
        seciliYil, seciliAy, toplamGelir, toplamGider,
        karsilastirmaliAylikOzet // YENİ: Akıllı özet verisini çekiyoruz
    } = useFinans();

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' }); 

    const { gelirDegisimYuzdesi, giderDegisimYuzdesi } = karsilastirmaliAylikOzet;
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
                    <div className="ozet-baslik-ve-trend">
                        <span className="ozet-baslik">Toplam Gelir</span>
                        {/* YENİ: Gelir için trend göstergesi */}
                        <span className="pozitif"><TrendGostergesi yuzde={gelirDegisimYuzdesi} /></span>
                    </div>
                    <span className="ozet-tutar gelir-renk">
                        + <CountUp end={toplamGelir} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                </div>
                <div className="ozet-kalem">
                    <div className="ozet-baslik-ve-trend">
                        <span className="ozet-baslik">Toplam Gider</span>
                        {/* YENİ: Gider için trend göstergesi (renk ters mantıkla çalışacak) */}
                        <span className={giderDegisimYuzdesi > 0 ? 'negatif' : 'pozitif'}>
                            <TrendGostergesi yuzde={giderDegisimYuzdesi} />
                        </span>
                    </div>
                    <span className="ozet-tutar gider-renk">
                        - <CountUp end={toplamGider} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Aylık Durum</span>
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