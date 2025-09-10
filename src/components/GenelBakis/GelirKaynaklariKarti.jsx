// src/components/GenelBakis/GelirKaynaklariKarti.jsx (Akıllı "Boş Durum" Eklenmiş Hali)

import { Bar } from 'react-chartjs-2';
import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { Link } from 'react-router-dom'; // YENİ: Link'i import ediyoruz
import { formatCurrency } from '../../utils/formatters';

// YENİ: Bu kart için özel "Boş Durum" bileşeni
function EmptyState() {
    const { currentUser } = useAuth();

    if (currentUser) {
        return (
            <div className="empty-state-container">
                <p>Bu ay için gösterilecek gelir verisi bulunmuyor.</p>
                <Link to="/islemler" className="primary-btn-small">
                    İlk Gelirini Ekle
                </Link>
            </div>
        );
    }

    return (
        <div className="empty-state-container">
            <p>Gelir kaynaklarınızı grafik üzerinde görmek için giriş yapın.</p>
            <div className="empty-state-actions">
                <Link to="/login" className="primary-btn-small">Giriş Yap</Link>
                <Link to="/signup" className="secondary-btn-small">Kayıt Ol</Link>
            </div>
        </div>
    );
}


function GelirKaynaklariKarti() {
    const { 
        gelirGrafikVerisi, 
        filtrelenmisGelirler,
        seciliYil,
        seciliAy
    } = useFinans();

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

    // Grafik ayarları (options)
    const gelirGrafikOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false, // Kartın yüksekliğine uyması için false olmalı
        plugins: {
            legend: { display: false },
            // YENİ: Başlığı artık kartın kendi başlığı yönetecek, buradan kaldırıyoruz.
            title: { display: false },
            tooltip: {
                backgroundColor: '#2f3542', titleColor: '#ffffff', bodyColor: '#ffffff', borderRadius: 8, padding: 10,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.x !== null) {
                            label += formatCurrency(context.parsed.x);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: { beginAtZero: true, grid: { color: '#dfe4ea', borderDash: [5, 5] }, ticks: { color: '#576574', font: { family: "'Roboto', sans-serif" } } },
            y: { grid: { display: false }, ticks: { color: '#2f3542', font: { family: "'Roboto', sans-serif", size: 13 } } }
        }
    };

    return (
        <div className="card">
            {/* YENİ: Kart başlığını tutarlılık için buraya taşıdık */}
            <div className="card-header"><h2>{ayAdi} Ayı Gelir Kaynakları</h2></div>
            
            {/* YENİ MANTIK: filtrelenmisGelirler dizisi boş mu diye kontrol ediyoruz */}
            {(!filtrelenmisGelirler || filtrelenmisGelirler.length === 0) ? (
                // Eğer BOŞSA, EmptyState bileşenini göster
                <EmptyState />
            ) : (
                // Eğer DOLUYSA, mevcut bar grafiğini göster
                // YENİ: Grafiğin yüksekliğini ayarlamak için bir sarmalayıcı ekledik
                <div style={{ height: '300px', position: 'relative' }}>
                    <Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} />
                </div>
            )}
        </div>
    );
}

export default GelirKaynaklariKarti;