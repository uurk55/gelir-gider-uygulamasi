// src/components/GenelBakis/AylikOzetKarti.jsx (SON NİHAİ VERSİYON)

import { useNavigate } from 'react-router-dom';
import { useFinans } from '../../context/FinansContext';
import { FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import CountUp from 'react-countup'; 

const TrendGostergesi = ({ yuzde, tip }) => {
    if (yuzde === 0 || !isFinite(yuzde)) return <span className="trend-gostergesi bos">&nbsp;</span>;
    const pozitifMi = yuzde > 0;
    const ikon = pozitifMi ? <FaArrowUp /> : <FaArrowDown />;
    const renkSinifi = tip === 'gider' ? (pozitifMi ? 'negatif' : 'pozitif') : (pozitifMi ? 'pozitif' : 'negatif');
    return (
        <span className={`trend-gostergesi ${renkSinifi}`}>
            {ikon} {Math.abs(yuzde).toFixed(0)}% önceki aya göre
        </span>
    );
};

function AylikOzetKarti() {
    const navigate = useNavigate();
    const { 
        seciliYil, seciliAy, toplamGelir, toplamGider,
        karsilastirmaliAylikOzet 
    } = useFinans();

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });
    const { gelirDegisimYuzdesi, giderDegisimYuzdesi } = karsilastirmaliAylikOzet;
    const aylikDurum = toplamGelir - toplamGider;

    return (
        <div className="card aylik-ozet-karti-container"> 
            <div className="card-header">
                <h2>{ayAdi} Ayı Özeti</h2>
                <button onClick={() => navigate('/islemler')} className="primary-btn card-header-action">
                    <FaPlus style={{ marginRight: '8px' }} /> Yeni İşlem
                </button>
            </div>
            <div className="aylik-ozet-kutusu">
                <div className="ozet-kalem">
                    <span className="ozet-baslik gelir-renk">Toplam Gelir</span>
                    <span className="ozet-tutar">
                        <CountUp className="gelir-renk" end={toplamGelir} duration={1.5} separator="." decimal="," prefix="+ ₺" />
                    </span>
                    <TrendGostergesi yuzde={gelirDegisimYuzdesi} tip="gelir" />
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik gider-renk">Toplam Gider</span>
                    <span className="ozet-tutar">
                        <CountUp className="gider-renk" end={toplamGider} duration={1.5} separator="." decimal="," prefix="- ₺" />
                    </span>
                    <TrendGostergesi yuzde={giderDegisimYuzdesi} tip="gider" />
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Aylık Durum</span>
                    <span className="ozet-tutar">
                        <CountUp className={aylikDurum >= 0 ? 'gelir-renk' : 'gider-renk'} end={aylikDurum} duration={1.5} separator="." decimal="," prefix="₺" />
                    </span>
                     <span className="trend-gostergesi bos">&nbsp;</span>
                </div>
            </div>
            <div className="aylik-durum-mesaji">
                {aylikDurum >= 0 ? "Harika gidiyorsun! Bu ay hedeflerine yaklaştın." : "Bu ay harcamalar geliri aştı. Önümüzdeki ay dikkatli olalım."}
            </div>
        </div>
    );
}

export default AylikOzetKarti;