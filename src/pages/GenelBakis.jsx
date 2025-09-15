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

// DEĞİŞEN BİLEŞEN: GenelVarlikKarti
function GenelVarlikKarti({ bakiye }) {
    return (
        <div className="card">
            <div className="mini-kart-baslik"><FaPiggyBank /><h3>Genel Varlık Durumu</h3></div>
            <div className="mini-kart-icerik">
                <span className="genel-bakiye-tutar">
                    {/* YENİ: Normal rakam yerine CountUp bileşenini kullanıyoruz */}
                    <CountUp
                        end={bakiye}
                        duration={1.5} // Animasyon süresi (saniye)
                        separator="."
                        decimal=","
                        prefix="₺"
                    />
                </span>
                <span className="mini-kart-aciklama">Tüm hesaplarınızın toplamı</span>
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
        // Sayfayı saran ana kapsayıcı
        <div className="genel-bakis-sayfasi">
            <AkilliBildirimCubugu />

            {/* 1. KAHRAMAN BÖLÜMÜ */}
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

            {/* 2. ANA İÇERİK GRID'İ */}
            <div className="kokpit-grid">

                {/* 2.1 ANA SÜTUN (SOL) */}
                <main className="ana-sutun">
                    <AylikOzetKarti />
                    <HarcamaDagilimiKarti />
                    <GelirKaynaklariKarti />
                    <ButceDurumlariKarti />
                </main>

                {/* 2.2 YAN SÜTUN (SAĞ) */}
                <aside className="yan-sutun">
                    <GenelVarlikKarti bakiye={toplamBakiye} />
                    <YaklasanOdemelerKarti odemeler={yaklasanOdemeler} />
                    <KrediKartiOzetKarti />
                    <HesapGiderleriKarti />
                </aside>

            </div>
        </div>
    );
}

export default GenelBakis;