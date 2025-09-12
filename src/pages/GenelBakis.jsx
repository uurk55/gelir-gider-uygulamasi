// src/pages/GenelBakis.jsx (AKILLI BİLDİRİM ÇUBUĞU EKLENMİŞ NİHAİ VERSİYON)

import { useFinans } from '../context/FinansContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TarihSecici from '../components/TarihSecici';
import AylikOzetKarti from '../components/GenelBakis/AylikOzetKarti';
import HarcamaDagilimiKarti from '../components/GenelBakis/HarcamaDagilimiKarti';
import HesapGiderleriKarti from '../components/GenelBakis/HesapGiderleriKarti';
import GelirKaynaklariKarti from '../components/GenelBakis/GelirKaynaklariKarti';
import ButceDurumlariKarti from '../components/GenelBakis/ButceDurumlariKarti';
import KrediKartiOzetKarti from '../components/GenelBakis/KrediKartiOzetKarti'; // YENİ
import { FaPiggyBank, FaBell, FaRegHandPeace, FaExclamationCircle } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

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

function GenelBakis() {
    const { 
        toplamBakiye, 
        yaklasanOdemeler
    } = useFinans();
    const { currentUser } = useAuth();

    if (toplamBakiye === undefined || !yaklasanOdemeler) {
        return <div>Veriler yükleniyor...</div>;
    }

    const kullaniciAdi = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';

    return (
        <>
            <AkilliBildirimCubugu />

            <div className="selamlama-kutusu">
                <div className="selamlama-ikon">
                    <FaRegHandPeace />
                </div>
                <div className="selamlama-metin">
                    <h1>Hoş Geldin, {kullaniciAdi}!</h1>
                    <p>Finansal durumuna genel bir bakış atalım.</p>
                </div>
            </div>

            <TarihSecici />
            <div className="yeni-kartlar-grid">
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaPiggyBank /><h3>Genel Varlık Durumu</h3></div>
                    <div className="mini-kart-icerik"><span className="genel-bakiye-tutar">{formatCurrency(toplamBakiye)}</span><span className="mini-kart-aciklama">Tüm hesaplarınızın toplamı</span></div>
                </div>
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaBell /><h3>Yaklaşan Ödemeler</h3></div>
                    <div className="mini-kart-icerik">
                        {yaklasanOdemeler.length > 0 ? (
                            <ul className="yaklasan-odeme-listesi">
                                {yaklasanOdemeler.map(odeme => (
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
            </div>
            <KrediKartiOzetKarti />
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