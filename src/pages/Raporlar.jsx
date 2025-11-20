// src/pages/Raporlar.jsx
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useFinans } from '../context/FinansContext';
import { FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { motion, AnimatePresence } from 'framer-motion';
import { tr as baseTr } from 'date-fns/locale';

import SayfaBasligi from '../components/SayfaBasligi';
import SayfaKontrolPaneli from '../components/SayfaKontrolPaneli';

// 🔹 Gün isimlerini Türkçe kısaltma ile göstermek için locale override
const trLocaleFull = {
  ...baseTr,
  localize: {
    ...baseTr.localize,
    day: (n) => ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][n],
  },
};

const raporSekmeleri = [
  { path: 'genel-trend', label: 'Genel Trend' },
  { path: 'kategori-analizi', label: 'Kategori Analizi' },
  { path: 'nakit-akisi', label: 'Nakit Akışı' },
  { path: 'en-buyuk-harcamalar', label: 'En Büyük Harcamalar' },
];

function Raporlar() {
  // 🔹 Burada artık rapor için özel Excel indirme fonksiyonunu kullanacağız
  const { tarihAraligi, setTarihAraligi, handleRaporIndir } = useFinans();

  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [geciciTarihAraligi, setGeciciTarihAraligi] = useState(tarihAraligi);

  const location = useLocation();

  const handleDateModalOpen = () => {
    setGeciciTarihAraligi(tarihAraligi);
    setIsDateRangeModalOpen(true);
  };

  const handleDateSave = () => {
    setTarihAraligi(geciciTarihAraligi);
    setIsDateRangeModalOpen(false);
  };

  const handleDateCancel = () => {
    setIsDateRangeModalOpen(false);
  };

  const actionButtons = (
    <>
      <button
        onClick={handleDateModalOpen}
        className="page-action-btn page-action-secondary"
      >
        <FaCalendarAlt /> Tarih Aralığı Seç
      </button>

      <button
        onClick={handleRaporIndir}
        className="page-action-btn page-action-primary"
      >
        <FaDownload /> Excel Raporu
      </button>
    </>
  );

  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Raporlar" />

      <SayfaKontrolPaneli actions={actionButtons}>
        {raporSekmeleri.map((sekme) => (
          <NavLink key={sekme.path} to={sekme.path}>
            {sekme.label}
          </NavLink>
        ))}
      </SayfaKontrolPaneli>

      <main className="sayfa-icerik-alani">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isDateRangeModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDateCancel}
          >
            <motion.div
              className="modal-content date-range-modal"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DateRangePicker
                onChange={(item) => setGeciciTarihAraligi([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={geciciTarihAraligi}
                locale={trLocaleFull}   // ✅ Tamamen Türkçe
                months={2}
                direction="horizontal"
              />

              <div className="modal-actions">
                <button onClick={handleDateCancel} className="cancel-btn">
                  İptal
                </button>
                <button onClick={handleDateSave} className="primary-btn">
                  Tamam
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Raporlar;
