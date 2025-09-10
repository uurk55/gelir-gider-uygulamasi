// src/pages/GenelBakis.jsx (YAKLAŞAN ÖDEMELER İÇİN AKILLI BOŞ DURUM EKLENDİ)

import { useFinans } from '../context/FinansContext';
import { useAuth } from '../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { Link } from 'react-router-dom'; // YENİ: Link bileşenini import ediyoruz
import TarihSecici from '../components/TarihSecici';
import AylikOzetKarti from '../components/GenelBakis/AylikOzetKarti';
import HarcamaDagilimiKarti from '../components/GenelBakis/HarcamaDagilimiKarti';
import HesapGiderleriKarti from '../components/GenelBakis/HesapGiderleriKarti';
import GelirKaynaklariKarti from '../components/GenelBakis/GelirKaynaklariKarti';
import ButceDurumlariKarti from '../components/GenelBakis/ButceDurumlariKarti';
import { FaPiggyBank, FaBell } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

// YENİ: Yaklaşan Ödemeler kartı için özel "Boş Durum" bileşeni
function YaklasanOdemelerEmptyState() {
    const { currentUser } = useAuth();

    // Üye ise, sabit ödeme ekleme sayfasına yönlendir
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

    // Misafir ise, üye olmaya teşvik et
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

    if (toplamBakiye === undefined || !yaklasanOdemeler) {
        return <div>Veriler yükleniyor...</div>;
    }

    return (
        <>
            <TarihSecici />

            {/* Mini Kartlar */}
            <div className="yeni-kartlar-grid">
                {/* Genel Varlık Kartı (Değişiklik yok) */}
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaPiggyBank /><h3>Genel Varlık Durumu</h3></div>
                    <div className="mini-kart-icerik"><span className="genel-bakiye-tutar">{formatCurrency(toplamBakiye)}</span><span className="mini-kart-aciklama">Tüm hesaplarınızın toplamı</span></div>
                </div>

                {/* Yaklaşan Ödemeler Kartı (İÇERİĞİ GÜNCELLENDİ) */}
                <div className="card mini-kart">
                    <div className="mini-kart-baslik"><FaBell /><h3>Yaklaşan Ödemeler</h3></div>
                    <div className="mini-kart-icerik">
                        {yaklasanOdemeler.length > 0 ? (
                            // Eğer veri VARSA, listeyi göster
                            <ul className="yaklasan-odeme-listesi">{yaklasanOdemeler.map(odeme => (<li key={odeme.id} className="yaklasan-odeme-item"><span>{odeme.aciklama}</span><span className={`kalan-gun ${odeme.kalanGun <= 3 ? 'uyari' : ''}`}>{odeme.kalanGun} gün sonra</span></li>))}</ul>
                        ) : (
                            // Eğer veri YOKSA, yeni akıllı "Boş Durum" bileşenini göster
                            <YaklasanOdemelerEmptyState />
                        )}
                    </div>
                </div>
            </div>

            {/* Ana Kartlar (Değişiklik yok) */}
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