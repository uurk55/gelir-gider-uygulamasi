// src/pages/Ozellestir.jsx (YENİDEN YAPILANDIRILMIŞ HALİ)

import { useState } from 'react';
import HesaplarYonetimi from '../components/Ozellestir/HesaplarYonetimi';
import KrediKartlariYonetimi from '../components/Ozellestir/KrediKartlariYonetimi';
import KategorilerYonetimi from '../components/Ozellestir/KategorilerYonetimi';

const TABS = {
    HESAPLAR: 'Hesaplar',
    KREDI_KARTLARI: 'Kartlar',
    KATEGORILER: 'Kategoriler'
};

function Ozellestir() {
    const [aktifSekme, setAktifSekme] = useState(TABS.HESAPLAR);

    const renderAktifSekme = () => {
        switch (aktifSekme) {
            case TABS.KREDI_KARTLARI:
                return <KrediKartlariYonetimi />;
            case TABS.KATEGORILER:
                return <KategorilerYonetimi />;
            case TABS.HESAPLAR:
            default:
                return <HesaplarYonetimi />;
        }
    };

    return (
        <div className="ozellestir-sayfasi-container">
            <div className="card">
                <div className="ozellestir-header">
                    <h1>Özelleştir</h1>
                    <div className="sekme-kontrol">
                        {Object.values(TABS).map(sekme => (
                            <button 
                                key={sekme} 
                                className={`sekme-btn ${aktifSekme === sekme ? 'aktif' : ''}`}
                                onClick={() => setAktifSekme(sekme)}
                            >
                                {sekme}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="ozellestir-icerik">
                    {renderAktifSekme()}
                </div>
            </div>
        </div>
    );
}

export default Ozellestir;