// src/pages/GenelBakis.jsx (GERİ YÜKLENEN, TAM VE STABİL VERSİYON)
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';
import { getAccountIcon } from '../utils/iconMap';
import { FaPlus, FaPiggyBank, FaBell } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

function GenelBakis() {
    const navigate = useNavigate();
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const {
        seciliYil, seciliAy, toplamGelir, toplamGider, butceDurumlari, grafikVerisi,
        gelirGrafikVerisi, kategoriOzeti, kategoriRenkleri, filtrelenmisGiderler,
        filtrelenmisGelirler, setBirlesikFiltreKategori, setBirlesikFiltreTip,
        aylikHesapGiderleri,
        toplamBakiye,
        yaklasanOdemeler,
    } = useFinans();

    if (!butceDurumlari || !grafikVerisi || !kategoriOzeti || !kategoriRenkleri || !aylikHesapGiderleri || !yaklasanOdemeler) {
        return <div>Veriler yükleniyor...</div>;
    }

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

    const handleGrafikTiklama = (event, elements) => {
        if (!elements || elements.length === 0) return;
        const tiklananIndex = elements[0].index;
        const tiklananKategori = grafikVerisi.labels[tiklananIndex];
        setBirlesikFiltreKategori(tiklananKategori);
        setBirlesikFiltreTip('gider');
        navigate('/islemler');
    };

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

    const gelirGrafikOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true, text: `${ayAdi} Ayı Gelir Kaynakları`, padding: { bottom: 25 },
                font: { family: "'Roboto', sans-serif", size: 20, weight: '600' }, color: '#2f3542'
            },
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
        <>
            <TarihSecici />

            <div className="yeni-kartlar-grid">
                <div className="card mini-kart">
                    <div className="mini-kart-baslik">
                        <FaPiggyBank />
                        <h3>Genel Varlık Durumu</h3>
                    </div>
                    <div className="mini-kart-icerik">
                        <span className="genel-bakiye-tutar">{formatCurrency(toplamBakiye)}</span>
                        <span className="mini-kart-aciklama">Tüm hesaplarınızın toplamı</span>
                    </div>
                </div>

                <div className="card mini-kart">
                    <div className="mini-kart-baslik">
                        <FaBell />
                        <h3>Yaklaşan Ödemeler</h3>
                    </div>
                    <div className="mini-kart-icerik">
                        {yaklasanOdemeler.length > 0 ? (
                            <ul className="yaklasan-odeme-listesi">
                                {yaklasanOdemeler.map(odeme => (
                                    <li key={odeme.id} className="yaklasan-odeme-item">
                                        <span>{odeme.aciklama}</span>
                                        <span className="kalan-gun">{odeme.kalanGun} gün sonra</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mini-kart-aciklama">Yaklaşan bir sabit ödemeniz bulunmuyor.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>{ayAdi} Ayı Özeti</h2>
                    <button onClick={() => navigate('/islemler')} className="primary-btn card-header-action" aria-label="Yeni İşlem Ekle">
                        <FaPlus style={{ marginRight: '8px' }} /> Yeni İşlem
                    </button>
                </div>
                <div className="aylik-ozet-kutusu">
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gelir</span><span className="ozet-tutar gelir-renk">+ {formatCurrency(toplamGelir)}</span></div>
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gider</span><span className="ozet-tutar gider-renk">- {formatCurrency(toplamGider)}</span></div>
                    <div className="ozet-kalem">
                        <span className="ozet-baslik">Aylık Durum</span>
                        <span className={`ozet-tutar aylik-durum ${toplamGelir - toplamGider >= 0 ? 'gelir-renk' : 'gider-renk'}`}>
                            {formatCurrency(toplamGelir - toplamGider)}
                        </span>
                    </div>
                </div>
                <div className="aylik-durum-mesaji">
                    {toplamGelir - toplamGider >= 0 ? "Harika gidiyorsun! Bu ay hedeflerine yaklaştın." : "Bu ay harcamalar geliri aştı. Önümüzdeki ay dikkatli olalım."}
                </div>
            </div>

            <div className="analiz-bolumu-grid">
                {filtrelenmisGiderler.length > 0 && (
                    <div className="card">
                        <div className="card-header"><h2>{ayAdi} Ayı Harcama Dağılımı</h2></div>
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
                    </div>
                )}
                {aylikHesapGiderleri.length > 0 && (
                    <div className="card">
                        <div className="card-header"><h2>Aylık Gider Dağılımı (Hesaba Göre)</h2></div>
                        <div className="hesap-gider-listesi">
                            {aylikHesapGiderleri.map(hesap => (
                                <div key={hesap.id} className="hesap-gider-satiri">
                                    <div className="hesap-gider-ust">
                                        <div className="hesap-adi-ikon"><span className="hesap-ikon">{getAccountIcon(hesap.ad)}</span><span className="hesap-adi">{hesap.ad}</span></div>
                                        <span className="hesap-aylik-gider gider-renk">-{formatCurrency(hesap.aylikGider)}</span>
                                    </div>
                                    <div className="hesap-gider-alt">
                                        <span className="hesap-gider-yuzdesi">Toplam giderin %{hesap.giderYuzdesi.toFixed(1)}'i</span>
                                        <div className="progress-bar-konteyner"><div className="hesap-progress-bar-dolgu" style={{ width: `${hesap.giderYuzdesi}%` }}></div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {filtrelenmisGelirler.length > 0 && (
                    <div className="card"><Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} /></div>
                )}
                 {butceDurumlari.length > 0 && (
                    <div className="card">
                        <div className="card-header"><h2>Aylık Kategori Limitleri</h2></div>
                        <div className="butce-listesi">
                            {butceDurumlari.map(butce => (
                                <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                                    <div className="butce-bilgi">
                                        <span className="butce-kategori">{butce.kategori}</span>
                                        <span className="butce-yuzde">(%{butce.yuzdeRaw ? butce.yuzdeRaw.toFixed(0) : butce.yuzde.toFixed(0)})</span>
                                    </div>
                                    <div className="progress-bar-konteyner"><div className="progress-bar-dolgu" style={{ width: `${butce.yuzde}%` }}></div></div>
                                    <div className="butce-detay-yeni">
                                        <span className="butce-rakamlar">{formatCurrency(butce.harcanan)} / {formatCurrency(butce.limit)}</span>
                                        <span>{butce.kalan < 0 ? <span className="butce-durum gider-renk">{formatCurrency(-butce.kalan)} aşıldı!</span> : <span className="butce-durum">{formatCurrency(butce.kalan)} kaldı</span>}</span>
                                    </div>
                                    {butce.degisimYuzdesi !== 0 && (
                                        <div className={`degisim-yuzdesi ${butce.degisimYuzdesi > 0 ? 'gider-renk' : 'gelir-renk'}`}>
                                            Geçen aya göre %{butce.degisimYuzdesi.toFixed(0)}
                                            {butce.degisimYuzdesi > 0 ? ' artış' : ' azalış'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default GenelBakis;