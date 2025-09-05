// src/components/GenelBakis/AylikOzetKarti.jsx

import { useNavigate } from 'react-router-dom';
import { useFinans } from '../../context/FinansContext'; // Dosya yolu önemli: ../../context/FinansContext
import { FaPlus } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters'; // Dosya yolu önemli: ../../utils/formatters

function AylikOzetKarti() {
    const navigate = useNavigate();

    // Sadece bu bileşenin ihtiyacı olan verileri Context'ten çekiyoruz
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
                    <span className="ozet-tutar gelir-renk">+ {formatCurrency(toplamGelir)}</span>
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Toplam Gider</span>
                    <span className="ozet-tutar gider-renk">- {formatCurrency(toplamGider)}</span>
                </div>
                <div className="ozet-kalem">
                    <span className="ozet-baslik">Aylık Durum</span>
                    <span className={`ozet-tutar aylik-durum ${aylikDurum >= 0 ? 'gelir-renk' : 'gider-renk'}`}>
                        {formatCurrency(aylikDurum)}
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