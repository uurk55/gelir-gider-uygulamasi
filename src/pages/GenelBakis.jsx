// src/pages/GenelBakis.jsx (YENİDEN YAPILANDIRILMIŞ İSKELET)

import { useFinans } from '../context/FinansContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Bileşenleri import etmeye devam ediyoruz
import TarihSecici from '../components/TarihSecici';
import AylikOzetKarti from '../components/GenelBakis/AylikOzetKarti';
import HarcamaDagilimiKarti from '../components/GenelBakis/HarcamaDagilimiKarti';
import HesapGiderleriKarti from '../components/GenelBakis/HesapGiderleriKarti';
import GelirKaynaklariKarti from '../components/GenelBakis/GelirKaynaklariKarti';
import ButceDurumlariKarti from '../components/GenelBakis/ButceDurumlariKarti';
import KrediKartiOzetKarti from '../components/GenelBakis/KrediKartiOzetKarti';
import HedefOzetKarti from '../components/GenelBakis/HedefOzetKarti'; // YENİ IMPORT
import FinansalSaglikKarti from '../components/GenelBakis/FinansalSaglikKarti'; // YENİ IMPORT
import { FaPiggyBank, FaBell, FaRegHandPeace, FaExclamationCircle } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';
import CountUp from 'react-countup'; // YENİ: Kütüphaneyi import ediyoruz

function AkilliBildirimCubugu() {
    const { bekleyenOdemeler, handleBekleyenOdemeleriIsle } = useFinans();
    const navigate = useNavigate();

    if (bekleyenOdemeler.length === 0) {
        return null;
    }

    const handleYonet = () => {
        navigate('/sabit-odemeler');
    };

    return (
        <AnimatePresence>
            <motion.div 
                className="akilli-bildirim-cubugu"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
            >
                <div className="bildirim-sol-taraf">
                    <FaExclamationCircle className="bildirim-ikon" />
                    <div className="bildirim-metin">
                        <strong>İşlenmeyi Bekleyen Ödemeler</strong>
                        <span>{bekleyenOdemeler.length} adet vadesi geçmiş sabit ödemeniz var.</span>
                    </div>
                </div>
                <div className="bildirim-sag-taraf">
                    <button onClick={handleYonet} className="secondary-btn-small">Detayları Yönet</button>
                    <button onClick={handleBekleyenOdemeleriIsle} className="primary-btn-small">Tümünü Gider Ekle</button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function YaklasanOdemelerEmptyState() {
    const { currentUser } = useAuth();
    if (currentUser) {
        return (
            <div className="empty-state-container mini-kart-empty">
                <p>Kayıtlı bir sabit ödemeniz yok.</p>
                <Link to="/sabit-odemeler" className="primary-btn-small">
                    Sabit Ödeme Ekle
                </Link>
            </div>
        );
    }
    return (
        <div className="empty-state-container mini-kart-empty">
            <p>Sabit ödemelerinizi takip etmek için giriş yapın.</p>
            <div className="empty-state-actions">
                <Link to="/login" className="primary-btn-small">Giriş Yap</Link>
                <Link to="/signup" className="secondary-btn-small">Kayıt Ol</Link>
            </div>
        </div>
    );
}

function GenelVarlikKarti({ bakiye }) {
    // YENİ: Akıllı özet verisini context'ten çekiyoruz
    const { karsilastirmaliAylikOzet } = useFinans();
    const { aylikBakiyeDegisimi } = karsilastirmaliAylikOzet;

    return (
        <div className="card">
            <div className="mini-kart-baslik"><FaPiggyBank /><h3>Genel Varlık Durumu</h3></div>
            <div className="mini-kart-icerik">
                <span className="genel-bakiye-tutar">
                    <CountUp end={bakiye} duration={1.5} separator="." decimal="," prefix="₺" />
                </span>
                {/* YENİ: Aylık değişim bilgisini gösteren bölüm */}
                <div className="mini-kart-aciklama">
                    <span>Tüm hesaplarınızın toplamı</span>
                    {aylikBakiyeDegisimi !== 0 && (
                        <span className={`aylik-degisim ${aylikBakiyeDegisimi > 0 ? 'pozitif' : 'negatif'}`}>
                            Bu ay: {formatCurrency(aylikBakiyeDegisimi)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function YaklasanOdemelerKarti({ odemeler }) {
    return (
        <div className="card">
            <div className="mini-kart-baslik"><FaBell /><h3>Yaklaşan Ödemeler</h3></div>
            <div className="mini-kart-icerik">
                {odemeler.length > 0 ? (
                    <ul className="yaklasan-odeme-listesi">
                        {odemeler.map(odeme => (
                            <li key={odeme.id} className="yaklasan-odeme-item">
                                <div className="odeme-detay">
                                    <span className="odeme-aciklama">{odeme.aciklama}</span>
                                    <span className="odeme-tutar">{formatCurrency(odeme.tutar)}</span>
                                </div>
                                <span className={`kalan-gun ${odeme.kalanGun <= 3 ? 'uyari' : ''}`}>{odeme.kalanGun} gün sonra</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <YaklasanOdemelerEmptyState />
                )}
            </div>
        </div>
    );
}


// --- ANA GENELBAKIS BİLEŞENİ (TAMAMEN YENİ YAPI) ---
function GenelBakis() {
    const { toplamBakiye, yaklasanOdemeler } = useFinans();
    const { currentUser } = useAuth();

    if (toplamBakiye === undefined || !yaklasanOdemeler) {
        return <div className="sayfa-yukleniyor">Veriler yükleniyor...</div>;
    }

    const kullaniciAdi = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';

    return (
    <div className="sayfa-container">
        
        {/* Akıllı bildirim ve Hoş Geldin bölümleri aynı kalıyor */}
        <AkilliBildirimCubugu />
        <header className="kahraman-bolumu">
            <div className="selamlama-alani">
                <div className="selamlama-ikon"><FaRegHandPeace /></div>
                <div className="selamlama-metin">
                    <h1>Hoş Geldin, {kullaniciAdi}!</h1>
                    <p>Finansal durumuna genel bir bakış atalım.</p>
                </div>
            </div>
            <div className="tarih-secici-alani">
                <TarihSecici />
            </div>
        </header>

        {/* YENİ İKİ SÜTUNLU DÜZENİMİZ */}
        <div className="dengeli-kokpit">

            {/* --- SOL TARAF: ANA SÜTUN (Detaylı Bilgiler) --- */}
            <main className="ana-sutun">
                <AylikOzetKarti />
                <HarcamaDagilimiKarti />
                <GelirKaynaklariKarti />
                <ButceDurumlariKarti />
                <HesapGiderleriKarti />
            </main>

            {/* --- SAĞ TARAF: YAN SÜTUN (Hızlı Özetler) --- */}
            <aside className="yan-sutun">
                <FinansalSaglikKarti />
                <GenelVarlikKarti bakiye={toplamBakiye} />
                <HedefOzetKarti />
                <YaklasanOdemelerKarti odemeler={yaklasanOdemeler} />
                <KrediKartiOzetKarti />
            </aside>
            
        </div>
    </div>
);
}
export default GenelBakis;