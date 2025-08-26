import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';
import { getAccountIcon } from '../utils/iconMap';
import { FaPlus } from 'react-icons/fa';

function GenelBakis() {
    const navigate = useNavigate();

    const {
        seciliYil, seciliAy,
        hesapDurumlari, toplamBakiye, toplamGelir, toplamGider,
        onayBekleyenAbonelikler, handleAbonelikOnayla, butceDurumlari,
        grafikVerisi, gelirGrafikVerisi, kategoriOzeti, setGiderFiltreKategori,
        filtrelenmisGiderler, filtrelenmisGelirler,
        kategoriRenkleri,
        aktifIslemTipi, setAktifIslemTipi, handleSubmit, hesaplar, seciliHesapId, setSeciliHesapId,
        gelirDuzenlemeModu, gelirKategori, setGelirKategori, gelirKategorileri, gelirAciklama, setGelirAciklama, gelirTarih, setGelirTarih, gelirTutar, setGelirTutar, handleGelirVazgec,
        giderDuzenlemeModu, kategori, setKategori, giderKategorileri, aciklama, setAciklama, tarih, setTarih, tutar, setTutar, handleGiderVazgec
    } = useFinans();

    if (!hesapDurumlari || !butceDurumlari || !grafikVerisi || !kategoriOzeti || !kategoriRenkleri) {
        return <div>Veriler yükleniyor...</div>;
    }

    const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString('tr-TR', { month: 'long' });

    const { setBirlesikFiltreKategori, setBirlesikFiltreTip } = useFinans(); // Bu iki fonksiyonu context'ten al

    const handleGrafikTiklama = (event, elements) => {
    if (!elements || elements.length === 0) return;
    const tiklananIndex = elements[0].index;
    const tiklananKategori = grafikVerisi.labels[tiklananIndex];

    setBirlesikFiltreKategori(tiklananKategori); // İşlemler sayfasının filtresini ayarla
    setBirlesikFiltreTip('gider'); // Sadece giderleri göstermesi için tipi de ayarla
    navigate('/islemler'); // İşlemler sayfasına git
};

    // YENİ VE GELİŞMİŞ HALİ
const gelirGrafikOptions = {
    indexAxis: 'y', // Barların yatay olmasını sağlar
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false // Grafik üzerindeki renk etiketini gizler
        },
        title: {
        display: true, // Başlığı tekrar görünür yap
        text: `${ayAdi} Ayı Gelir Kaynakları`, // Başlık metni (zaten dinamik)
        padding: {
            bottom: 25 // Başlık ile grafik arasına boşluk bırak
        },
        font: {
            family: "'Roboto', sans-serif",
            size: 18,
            weight: '600', // Başlığı kalın yap
        },
        color: '#2f3542' // Başlık rengini ana metin rengiyle aynı yap
    },
        tooltip: {
            // Üzerine gelince çıkan kutucuğun stilleri
            backgroundColor: '#2f3542',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderRadius: 8,
            padding: 10,
            callbacks: {
                // Tutarı daha güzel formatlamak için
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.x !== null) {
                        label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.x);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        x: { // Yatay Eksen (Tutar çizgileri)
            beginAtZero: true,
            grid: {
                color: '#dfe4ea', // Kılavuz çizgilerinin rengini daha soluk yap
                borderDash: [5, 5], // Çizgileri kesikli yap
            },
            ticks: {
                color: '#576574', // Rakamların rengi
                font: {
                    family: "'Roboto', sans-serif",
                }
            }
        },
        y: { // Dikey Eksen (Kategori isimleri)
            grid: {
                display: false, // Dikey kılavuz çizgilerini kaldır
            },
            ticks: {
                color: '#2f3542', // Kategori isimlerinin rengi
                font: {
                    family: "'Roboto', sans-serif",
                    size: 13, // Yazı boyutunu biraz büyüt
                }
            }
        }
    }
};

    const pieChartOptions = {
        responsive: true, maintainAspectRatio: false, onClick: handleGrafikTiklama,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true, backgroundColor: '#2f3542', titleColor: '#ffffff', bodyColor: '#ffffff', borderRadius: 8, padding: 10,
                animation: { duration: 400, easing: 'easeOutCubic' }
            }
        }
    };

    const handleFormSubmitAndClose = (e) => {
        handleSubmit(e);
        const isEditing = aktifIslemTipi === 'gider' ? giderDuzenlemeModu : gelirDuzenlemeModu;
        if (!isEditing) {
            closeHizliEkleModal();
        }
    };

    const FormContent = ({ isGelir }) => (
        <form onSubmit={handleFormSubmitAndClose} className="form-modern form-grid">
            <div className="form-item-full"><label htmlFor="aciklama">Açıklama</label><input id="aciklama" type="text" value={isGelir ? gelirAciklama : aciklama} onChange={(e) => isGelir ? setGelirAciklama(e.target.value) : setAciklama(e.target.value)} /></div>
            <div className="form-item-half"><label htmlFor="kategori">Kategori</label><select id="kategori" value={isGelir ? gelirKategori : kategori} onChange={(e) => isGelir ? setGelirKategori(e.target.value) : setKategori(e.target.value)}>{(isGelir ? gelirKategorileri : giderKategorileri).map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
            <div className="form-item-half"><label htmlFor="hesap">Hesap</label><select id="hesap" value={seciliHesapId} onChange={(e) => setSeciliHesapId(parseInt(e.target.value))}>{hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}</select></div>
            <div className="form-item-half"><label htmlFor="tutar">Tutar (₺)</label><input id="tutar" type="number" value={isGelir ? gelirTutar : tutar} onChange={(e) => isGelir ? setGelirTutar(e.target.value) : setTutar(e.target.value)} /></div>
            <div className="form-item-half"><label htmlFor="tarih">Tarih</label><input id="tarih" type="date" value={isGelir ? gelirTarih : tarih} onChange={(e) => isGelir ? setGelirTarih(e.target.value) : setTarih(e.target.value)} /></div>
            <div className="form-item-full form-buton-grubu"><button type="submit">{(isGelir ? gelirDuzenlemeModu : giderDuzenlemeModu) ? 'Güncelle' : 'Ekle'}</button>{(isGelir ? gelirDuzenlemeModu : giderDuzenlemeModu) && (<button type="button" onClick={isGelir ? handleGelirVazgec : handleGiderVazgec} className="vazgec-btn">Vazgeç</button>)}</div>
        </form>
    );

    return (
        <>
            {onayBekleyenAbonelikler.length > 0 && (
                <div className="card">
                    <h3>Bu Ay Onay Bekleyen Abonelikler</h3>
                    <ul>
                        {onayBekleyenAbonelikler.map(abonelik => (
                            <li key={abonelik.id} style={{background:'transparent', border:0, padding: '10px 0'}}>
                                <div className="bildirim-sol"><span className="bildirim-aciklama">{abonelik.aciklama}</span><span className="bildirim-tutar">{abonelik.tutar.toFixed(2)} ₺</span></div>
                                <button onClick={() => handleAbonelikOnayla(abonelik)} className="onayla-btn">Onayla ve Ekle</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <TarihSecici />

            <div className="card">
                <div className="card-header">
                    <h2>{ayAdi} Ayı Özeti</h2>
                    <button onClick={() => navigate('/islemler')} className="card-header-action" aria-label="Yeni İşlem Ekle">
                        <FaPlus style={{ marginRight: '8px' }} /> Yeni İşlem
                    </button>
                </div>
                <div className="aylik-ozet-kutusu">
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gelir</span><span className="ozet-tutar gelir-renk">+ {toplamGelir.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span className="ozet-baslik">Toplam Gider</span><span className="ozet-tutar gider-renk">- {toplamGider.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span className="ozet-baslik">Aylık Durum</span><span className={`ozet-tutar ${toplamGelir - toplamGider >= 0 ? 'gelir-renk' : 'gider-renk'}`}>{(toplamGelir - toplamGider).toFixed(2)} ₺</span></div>
                </div>
                <hr className="kart-ici-ayirici" />
                <div className="hesap-durumlari-listesi">
                    <h3>Hesap Durumları</h3>
                    {hesapDurumlari.map(hesap => (
                        <div key={hesap.id} className="hesap-satiri">
                            <div className="hesap-adi-ikon"><span className="hesap-ikon">{getAccountIcon(hesap.ad)}</span><span className="hesap-adi">{hesap.ad}</span></div>
                            <span className={`hesap-bakiye ${hesap.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}`}>{hesap.bakiye.toFixed(2)} ₺</span>
                        </div>
                    ))}
                    <div className="hesap-satiri toplam-bakiye">
                        <span className="hesap-adi"><strong>Toplam Varlık</strong></span>
                        <span className={`hesap-bakiye ${toplamBakiye >= 0 ? 'gelir-renk' : 'gider-renk'}`}><strong>{toplamBakiye.toFixed(2)} ₺</strong></span>
                    </div>
                </div>
            </div>

            <div className="analiz-bolumu-grid">
                {filtrelenmisGiderler.length > 0 && (
                    <div className="card">
                        <h2>{ayAdi} Ayı Harcama Dağılımı</h2>
                        <div className="analiz-icerik">
                            <div className="ozet-tablosu">
                                <ul className="harcama-listesi">
                                    {Object.entries(kategoriOzeti).sort(([, a], [, b]) => b - a).map(([kategori, tutar]) => (
                                        <li key={kategori}>
                                            <div className="kategori-sol-taraf">
                                                <span className="renk-noktasi" style={{ backgroundColor: kategoriRenkleri[kategori] || '#CCCCCC' }}></span>
                                                <span className="kategori-adi">{kategori}</span>
                                            </div>
                                            <span className="kategori-tutari">{tutar.toFixed(2)} ₺</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="grafik-konteyner"><Pie data={grafikVerisi} options={pieChartOptions} /></div>
                        </div>
                    </div>
                )}
                {filtrelenmisGelirler.length > 0 && (
                    <div className="card"><Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} /></div>
                )}
            </div>

            {butceDurumlari.length > 0 && (
    <div className="card">
        {/* YENİ EKLENEN SATIRLAR */}
        <div className="card-header">
            <h2>Aylık Kategori Limitleri</h2>
        </div>
        {/* --- */}
        <div className="butce-listesi">{butceDurumlari.map(butce => (<div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}><div className="butce-bilgi"><span className="butce-kategori">{butce.kategori}</span><span className="butce-yuzde">(%{butce.yuzdeRaw ? butce.yuzdeRaw.toFixed(0) : butce.yuzde.toFixed(0)})</span></div><div className="progress-bar-konteyner"><div className="progress-bar-dolgu" style={{ width: `${butce.yuzde}%` }}></div></div><div className="butce-detay-yeni"><span className="butce-rakamlar">{butce.harcanan.toFixed(2)} ₺ / {butce.limit.toFixed(2)} ₺</span>{butce.kalan < 0 ? (<span className="butce-durum gider-renk">{(-butce.kalan).toFixed(2)} ₺ aşıldı!</span>) : (<span className="butce-durum">{butce.kalan.toFixed(2)} ₺ kaldı</span>)}</div></div>))}</div>
    </div>
)}
        </>
    );
}

export default GenelBakis;