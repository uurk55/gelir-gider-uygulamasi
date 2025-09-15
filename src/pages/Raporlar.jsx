// src/pages/Raporlar.jsx (SADELEŞTİRİLMİŞ NİHAİ KOD)

import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { Line } from 'react-chartjs-2';
import { FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { motion, AnimatePresence } from 'framer-motion';
import { tr } from 'date-fns/locale';
// ARTIK GEREKLİ DEĞİL: import TarihSecici from '../components/TarihSecici'; 
import KategoriAnaliziRaporu from '../components/Raporlar/KategoriAnaliziRaporu';
import NakitAkisiRaporu from '../components/Raporlar/NakitAkisiRaporu';
import EnBuyukHarcamalarRaporu from '../components/Raporlar/EnBuyukHarcamalarRaporu';

const RAPOR_SEKMELERI = {
    GENEL_TREND: 'Genel Trend',
    KATEGORI_ANALIZI: 'Kategori Analizi',
    NAKIT_AKISI: 'Nakit Akışı',
    EN_BUYUK_HARCAMALAR: 'En Büyük Harcamalar'
};

function Raporlar() {
    const [aktifSekme, setAktifSekme] = useState(RAPOR_SEKMELERI.GENEL_TREND);
    const {
        trendVerisi, yillikRaporVerisi, seciliYil, handleVeriIndir,
        tarihAraligi, setTarihAraligi
    } = useFinans();
    const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);

    const lineChartData = {
        labels: trendVerisi.labels,
        datasets: [
            {
                label: 'Toplam Gelir', data: trendVerisi.gelirler,
                borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true, tension: 0.4
            },
            {
                label: 'Toplam Gider', data: trendVerisi.giderler,
                borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true, tension: 0.4
            }
        ]
    };

    const renderAktifRapor = () => {
        switch (aktifSekme) {
            case RAPOR_SEKMELERI.KATEGORI_ANALIZI:
                return <KategoriAnaliziRaporu />;
            case RAPOR_SEKMELERI.NAKIT_AKISI:
                return <NakitAkisiRaporu />;
            case RAPOR_SEKMELERI.EN_BUYUK_HARCAMALAR:
                return <EnBuyukHarcamalarRaporu />;
            case RAPOR_SEKMELERI.GENEL_TREND:
            default:
                return (
                    <>
                        <div className="card">
                            <div className="card-header"><h2>Son 6 Aylık Finansal Trend</h2></div>
                            <div style={{padding: '1rem'}}><Line data={lineChartData} /></div>
                        </div>
                        <div className="card">
                            <div className="card-header"><h2>{seciliYil} Yılı Özeti</h2></div>
                            <div className="tablo-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ay</th><th>Toplam Gelir</th><th>Toplam Gider</th><th>Aylık Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {yillikRaporVerisi.aylar.map(ayData => (
                                            <tr key={ayData.ay}>
                                                <td>{ayData.ay}</td>
                                                <td className="gelir-renk">₺{ayData.gelir.toFixed(2)}</td>
                                                <td className="gider-renk">₺{ayData.gider.toFixed(2)}</td>
                                                <td className={ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                                                    ₺{ayData.bakiye.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="toplam-satiri">
                                            <td>Yıllık Toplam</td>
                                            <td>₺{yillikRaporVerisi.toplamGelir.toFixed(2)}</td>
                                            <td>₺{yillikRaporVerisi.toplamGider.toFixed(2)}</td>
                                            <td>₺{yillikRaporVerisi.toplamBakiye.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="raporlar-sayfasi-container">
            <div className="raporlar-header">
                <h1>Raporlar</h1>
                <div className="rapor-kontrolleri">
                    {/* TarihSecici bileşeni buradan kaldırıldı */}
                    <button onClick={() => setIsDateRangeModalOpen(true)} className="secondary-btn">
                        <FaCalendarAlt /> Tarih Aralığı Seç
                    </button>
                    <button onClick={handleVeriIndir} className="primary-btn">
                        <FaDownload /> CSV İndir
                    </button>
                </div>
            </div>

            <div className="sekme-kontrol rapor-sekmeleri">
                {Object.values(RAPOR_SEKMELERI).map(sekme => (
                    <button 
                        key={sekme}
                        className={`sekme-btn ${aktifSekme === sekme ? 'aktif' : ''}`}
                        onClick={() => setAktifSekme(sekme)}
                    >
                        {sekme}
                    </button>
                ))}
            </div>

            <div className="rapor-icerik">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={aktifSekme}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderAktifRapor()}
                    </motion.div>
                </AnimatePresence>
            </div>


            <AnimatePresence>
                {isDateRangeModalOpen && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content date-range-modal" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                            <DateRange editableDateInputs={true} onChange={item => setTarihAraligi([item.selection])} moveRangeOnFirstSelection={false} ranges={tarihAraligi} locale={tr}/>
                            <button onClick={() => setIsDateRangeModalOpen(false)} className="primary-btn">Tamam</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Raporlar;