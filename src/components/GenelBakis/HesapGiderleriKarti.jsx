// src/components/GenelBakis/HesapGiderleriKarti.jsx (Akıllı "Boş Durum" Eklenmiş Hali)

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { Link } from 'react-router-dom'; // YENİ: Link'i import ediyoruz
import { formatCurrency } from '../../utils/formatters';
import { getAccountIcon } from '../../utils/iconMap';

// YENİ: Bu kart için özel "Boş Durum" bileşeni
// Not: Bu bileşen bir öncekiyle neredeyse aynı, istersen ortak bir
// "EmptyState" bileşeni oluşturup oradan da çağırabilirsin.
// Şimdilik temizlik için her bileşenin kendi içinde tutuyoruz.
function EmptyState() {
    const { currentUser } = useAuth();

    if (currentUser) {
        return (
            <div className="empty-state-container">
                <p>Bu ay için gösterilecek harcama verisi bulunmuyor.</p>
                <Link to="/islemler" className="primary-btn-small">
                    Harcama Ekle
                </Link>
            </div>
        );
    }

    return (
        <div className="empty-state-container">
            <p>Hesap bazlı gider dağılımınızı görmek için giriş yapın.</p>
            <div className="empty-state-actions">
                <Link to="/login" className="primary-btn-small">Giriş Yap</Link>
                <Link to="/signup" className="secondary-btn-small">Kayıt Ol</Link>
            </div>
        </div>
    );
}


function HesapGiderleriKarti() {
    const { aylikHesapGiderleri } = useFinans();

    return (
        <div className="card">
            <div className="card-header"><h2>Aylık Gider Dağılımı (Hesaba Göre)</h2></div>

            {/* YENİ MANTIK: aylikHesapGiderleri dizisi boş mu diye kontrol ediyoruz */}
            {(!aylikHesapGiderleri || aylikHesapGiderleri.length === 0) ? (
                // Eğer BOŞSA, EmptyState bileşenini göster
                <EmptyState />
            ) : (
                // Eğer DOLUYSA, mevcut hesap giderleri listesini göster
                <div className="hesap-gider-listesi">
                    {aylikHesapGiderleri.map(hesap => (
                        <div key={hesap.id} className="hesap-gider-satiri">
                            <div className="hesap-gider-ust">
                                <div className="hesap-adi-ikon">
                                    <span className="hesap-ikon">{getAccountIcon(hesap.ad)}</span>
                                    <span className="hesap-adi">{hesap.ad}</span>
                                </div>
                                <span className="hesap-aylik-gider gider-renk">-{formatCurrency(hesap.aylikGider)}</span>
                            </div>
                            <div className="hesap-gider-alt">
                                <span className="hesap-gider-yuzdesi">Toplam giderin %{hesap.giderYuzdesi.toFixed(1)}'i</span>
                                <div className="progress-bar-konteyner">
                                    <div className="hesap-progress-bar-dolgu" style={{ width: `${hesap.giderYuzdesi}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HesapGiderleriKarti;