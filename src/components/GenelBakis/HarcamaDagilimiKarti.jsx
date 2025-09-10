// src/components/GenelBakis/HarcamaDagilimiKarti.jsx (Akıllı "Boş Durum" Eklenmiş Hali)

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // YENİ: Link'i import ediyoruz
import { Pie } from 'react-chartjs-2';
import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { formatCurrency } from '../../utils/formatters';

// YENİ: Bu kart için özel "Boş Durum" bileşeni
function EmptyState() {
    const { currentUser } = useAuth();

    // Üye ise, işlem ekleme sayfasına yönlendir
    if (currentUser) {
        return (
            <div className="empty-state-container">
                <p>Bu ay için gösterilecek harcama verisi bulunmuyor.</p>
                <Link to="/islemler" className="primary-btn-small">
                    İlk Harcamanı Ekle
                </Link>
            </div>
        );
    }

    // Misafir ise, üye olmaya teşvik et
    return (
        <div className="empty-state-container">
            <p>Harcama dağılımınızı görmek ve analizinizi yapmak için giriş yapın.</p>
            <div className="empty-state-actions">
                <Link to="/login" className="primary-btn-small">Giriş Yap</Link>
                <Link to="/signup" className="secondary-btn-small">Kayıt Ol</Link>
            </div>
        </div>
    );
}


function HarcamaDagilimiKarti() {
    const navigate = useNavigate();
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const {
        seciliYil,
        seciliAy,
        grafikVerisi,
        kategoriOzeti,
        kategoriRenkleri,
        toplamGider,
        setBirlesikFiltreKategori,
        setBirlesikFiltreTip,
        filtrelenmisGiderler
    } = useFinans();

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

    // Grafik tıklama fonksiyonu (değişiklik yok)
    const handleGrafikTiklama = (event, elements) => {
        if (!elements || elements.length === 0) return;
        const tiklananIndex = elements[0].index;
        const tiklananKategori = grafikVerisi.labels[tiklananIndex];
        setBirlesikFiltreKategori(tiklananKategori);
        setBirlesikFiltreTip('gider');
        navigate('/islemler');
    };
    
    // Grafik hover mantığı (değişiklik yok)
    const interactiveGrafikVerisi = useMemo(() => {
        if (!grafikVerisi.labels) return grafikVerisi;
        const hoverIndex = hoveredCategory ? grafikVerisi.labels.indexOf(hoveredCategory) : -1;
        return {
            ...grafikVerisi,
            datasets: grafikVerisi.datasets.map(dataset => ({
                ...dataset,
                offset: grafikVerisi.labels.map((_, index) => (index === hoverIndex ? 20 : 0)),
                borderWidth: grafikVerisi.labels.map((_, index) => (index === hoverIndex ? 3 : 2)),
            })),
        };
    }, [hoveredCategory, grafikVerisi]);
    
    // Grafik ayarları (değişiklik yok)
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleGrafikTiklama,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true, backgroundColor: '#2f3542', titleColor: '#ffffff', bodyColor: '#ffffff', borderRadius: 8, padding: 10,
                callbacks: {
                    label: function(tooltipItem) {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw;
                        const total = tooltipItem.chart.getDatasetMeta(0).total;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    return (
        <div className="card">
            <div className="card-header"><h2>{ayAdi} Ayı Harcama Dağılımı</h2></div>
            
            {/* YENİ MANTIK: filtrelenmisGiderler dizisi boş mu diye kontrol ediyoruz */}
            {filtrelenmisGiderler.length === 0 ? (
                // Eğer BOŞSA, EmptyState bileşenini göster
                <EmptyState />
            ) : (
                // Eğer DOLUYSA, mevcut grafik ve listeyi göster
                <div className="analiz-icerik">
                    <div className="ozet-tablosu">
                        <ul className="harcama-listesi">
                            {Object.entries(kategoriOzeti).sort(([, a], [, b]) => b - a).map(([kategori, tutar]) => {
                                const yuzde = toplamGider > 0 ? ((tutar / toplamGider) * 100).toFixed(1) : 0;
                                return (
                                    <li key={kategori} onMouseEnter={() => setHoveredCategory(kategori)} onMouseLeave={() => setHoveredCategory(null)}>
                                        <div className="kategori-sol-taraf">
                                            <span className="renk-noktasi" style={{ backgroundColor: kategoriRenkleri[kategori] || '#CCCCCC' }}></span>
                                            <div className="kategori-detay">
                                                <span className="kategori-adi">{kategori}</span>
                                                <span className="kategori-yuzdesi">% {yuzde}</span>
                                            </div>
                                        </div>
                                        <span className="kategori-tutari">{formatCurrency(tutar)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="grafik-konteyner"><Pie data={interactiveGrafikVerisi} options={pieChartOptions} /></div>
                </div>
            )}
        </div>
    );
}

export default HarcamaDagilimiKarti;