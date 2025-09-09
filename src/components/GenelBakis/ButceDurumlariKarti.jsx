// src/components/GenelBakis/ButceDurumlariKarti.jsx (Akıllı "Boş Durum" Eklenmiş Hali)

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom'; // YENİ: Butonlar için Link bileşenini import ediyoruz

// YENİ: "Boş Durum" için ayrı bir bileşen oluşturalım
function EmptyState() {
    const { currentUser } = useAuth();

    // Eğer kullanıcı giriş yapmışsa (üye ise)
    if (currentUser) {
        return (
            <div className="empty-state-container">
                <p>Henüz bir bütçe belirlemediniz.</p>
                <Link to="/butceler" className="primary-btn-small">
                    Hemen Bütçe Ekle
                </Link>
            </div>
        );
    }

    // Eğer kullanıcı giriş yapmamışsa (misafir ise)
    return (
        <div className="empty-state-container">
            <p>Bütçelerinizi takip ederek harcamalarınızı kontrol altına alın.</p>
            <p>Bu özelliği kullanmak için lütfen giriş yapın veya kayıt olun.</p>
            <div className="empty-state-actions">
                <Link to="/login" className="primary-btn-small">Giriş Yap</Link>
                <Link to="/signup" className="secondary-btn-small">Kayıt Ol</Link>
            </div>
        </div>
    );
}


function ButceDurumlariKarti() {
    const { butceDurumlari } = useFinans();

    return (
        <div className="card">
            <div className="card-header">
                <h2>Aylık Kategori Limitleri</h2>
            </div>
            
            {/* YENİ MANTIK: Veri var mı yok mu diye burada kontrol ediyoruz */}
            {(!butceDurumlari || butceDurumlari.length === 0) ? (
                // Eğer veri YOKSA, EmptyState bileşenini göster
                <EmptyState />
            ) : (
                // Eğer veri VARSA, bütçe listesini göster
                <div className="butce-listesi">
                    {butceDurumlari.map(butce => {
                        const yuzde = butce.yuzde || 0;
                        const harcanan = butce.harcanan || 0;
                        const limit = butce.limit || 0;
                        const kalan = butce.kalan !== undefined ? butce.kalan : limit;
                        const degisimYuzdesi = butce.degisimYuzdesi || 0;

                        return (
                            <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                                <div className="butce-bilgi">
                                    <span className="butce-kategori">{butce.kategori}</span>
                                    <span className="butce-yuzde">(%{yuzde.toFixed(0)})</span>
                                </div>
                                <div className="progress-bar-konteyner">
                                    <div className="progress-bar-dolgu" style={{ width: `${yuzde}%` }}></div>
                                </div>
                                <div className="butce-detay-yeni">
                                    <span className="butce-rakamlar">{formatCurrency(harcanan)} / {formatCurrency(limit)}</span>
                                    <span>
                                        {kalan < 0
                                            ? <span className="butce-durum gider-renk">{formatCurrency(-kalan)} aşıldı!</span>
                                            : <span className="butce-durum">{formatCurrency(kalan)} kaldı</span>
                                        }
                                    </span>
                                </div>
                                {degisimYuzdesi !== 0 && (
                                    <div className={`degisim-yuzdesi ${degisimYuzdesi > 0 ? 'gider-renk' : 'gelir-renk'}`}>
                                        Geçen aya göre %{degisimYuzdesi.toFixed(0)}
                                        {degisimYuzdesi > 0 ? ' artış' : ' azalış'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ButceDurumlariKarti;