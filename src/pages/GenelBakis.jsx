// src/pages/GenelBakis.jsx (REFACTORING TAMAMLANDI - NİHAİ TEMİZ HALİ)

import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';
import AylikOzetKarti from '../components/GenelBakis/AylikOzetKarti';
import HarcamaDagilimiKarti from '../components/GenelBakis/HarcamaDagilimiKarti';
import HesapGiderleriKarti from '../components/GenelBakis/HesapGiderleriKarti';
import GelirKaynaklariKarti from '../components/GenelBakis/GelirKaynaklariKarti';
import ButceDurumlariKarti from '../components/GenelBakis/ButceDurumlariKarti';
import { FaPiggyBank, FaBell } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

function GenelBakis() {
    // Gördüğün gibi, artık ana sayfada sadece mini kartlar için gerekli
    // en temel bilgilere ihtiyacımız var. Diğer her şey silindi.
    const { 
        toplamBakiye, 
        yaklasanOdemeler
    } = useFinans();

    // Yükleniyor durumu için birkaç temel veriyi kontrol etmemiz yeterli.
    if (toplamBakiye === undefined || !yaklasanOdemeler) {
        return <div>Veriler yükleniyor...</div>;
    }

    return (
        <>
            <TarihSecici />

            {/* Mini Kartlar */}
            <div className="yeni-kartlar-grid">
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaPiggyBank /><h3>Genel Varlık Durumu</h3></div>
                    <div className="mini-kart-icerik"><span className="genel-bakiye-tutar">{formatCurrency(toplamBakiye)}</span><span className="mini-kart-aciklama">Tüm hesaplarınızın toplamı</span></div>
                </div>
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaBell /><h3>Yaklaşan Ödemeler</h3></div>
                    <div className="mini-kart-icerik">
                        {yaklasanOdemeler.length > 0 ? (
                            <ul className="yaklasan-odeme-listesi">{yaklasanOdemeler.map(odeme => (<li key={odeme.id} className="yaklasan-odeme-item"><span>{odeme.aciklama}</span><span className="kalan-gun">{odeme.kalanGun} gün sonra</span></li>))}</ul>
                        ) : (<p className="mini-kart-aciklama">Yaklaşan bir sabit ödemeniz bulunmuyor.</p>)}
                    </div>
                </div>
            </div>

            {/* Ana Kartlar - Her biri artık kendi işinden sorumlu */}
            <AylikOzetKarti />

            <div className="analiz-bolumu-grid">
                <HarcamaDagilimiKarti />
                <HesapGiderleriKarti />
                <GelirKaynaklariKarti />
                <ButceDurumlariKarti />
            </div>
        </>
    );
}

export default GenelBakis;