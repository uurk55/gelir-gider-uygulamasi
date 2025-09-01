// src/pages/GenelBakis.jsx (TAM VE DÜZELTİLMİŞ)
import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';
import { getAccountIcon } from '../utils/iconMap';
import { FaPlus } from 'react-icons/fa';

function GenelBakis() {
    const navigate = useNavigate();

    const {
        seciliYil, seciliAy, toplamGelir, toplamGider, butceDurumlari, grafikVerisi,
        gelirGrafikVerisi, kategoriOzeti, kategoriRenkleri, filtrelenmisGiderler,
        filtrelenmisGelirler, setBirlesikFiltreKategori, setBirlesikFiltreTip,
        aylikHesapGiderleri,
    } = useFinans();

    if (!butceDurumlari || !grafikVerisi || !kategoriOzeti || !kategoriRenkleri || !aylikHesapGiderleri) {
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
                            label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.x);
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

    // EKSİK OLAN PASTA GRAFİK OPSİYONLARI BURADA
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: handleGrafikTiklama,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true, backgroundColor: '#2f3542', titleColor: '#ffffff', bodyColor: '#ffffff', borderRadius: 8, padding: 10 }
        }
    };
    return (
        <>
            <TarihSecici />

            <div className="card">
                <div className="card-header">
                    <h2>{ayAdi} Ayı Özeti</h2>
                    <button onClick={() => navigate('/islemler')} className="primary-btn card-header-action" aria-label="Yeni İşlem Ekle">
                        <FaPlus style={{ marginRight: '8px' }} /> Yeni İşlem
                    </button>
                </div>
                <div className="aylik-ozet-kutusu">
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gelir</span><span className="ozet-tutar gelir-renk">+ {toplamGelir.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gider</span><span className="ozet-tutar gider-renk">- {toplamGider.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span className="ozet-baslik">Aylık Durum</span><span className={`ozet-tutar ${toplamGelir - toplamGider >= 0 ? 'gelir-renk' : 'gider-renk'}`}>{(toplamGelir - toplamGider).toFixed(2)} ₺</span></div>
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
                                    {Object.entries(kategoriOzeti).sort(([, a], [, b]) => b - a).map(([kategori, tutar]) => (
                                        <li key={kategori}>
                                            <div className="kategori-sol-taraf"><span className="renk-noktasi" style={{ backgroundColor: kategoriRenkleri[kategori] || '#CCCCCC' }}></span><span className="kategori-adi">{kategori}</span></div>
                                            <span className="kategori-tutari">{tutar.toFixed(2)} ₺</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grafik-konteyner"><Pie data={grafikVerisi} options={pieChartOptions} /></div>
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
                                        <span className="hesap-aylik-gider gider-renk">-{hesap.aylikGider.toFixed(2)} ₺</span>
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
            </div>

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
                                    <span className="butce-rakamlar">{butce.harcanan.toFixed(2)} ₺ / {butce.limit.toFixed(2)} ₺</span>
                                    <span>{butce.kalan < 0 ? <span className="butce-durum gider-renk">{(-butce.kalan).toFixed(2)} ₺ aşıldı!</span> : <span className="butce-durum">{butce.kalan.toFixed(2)} ₺ kaldı</span>}</span>
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
        </>
    );
}

export default GenelBakis;