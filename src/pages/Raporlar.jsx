// src/pages/Raporlar.jsx
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom'; // useLocation eklendi
import { useFinans } from '../context/FinansContext';
import { FaCalendarAlt, FaDownload } from 'react-icons/fa';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { motion, AnimatePresence } from 'framer-motion';
import { tr } from 'date-fns/locale';

import SayfaBasligi from '../components/SayfaBasligi';
import SayfaKontrolPaneli from '../components/SayfaKontrolPaneli';

const raporSekmeleri = [
  { path: 'genel-trend', label: 'Genel Trend' },
  { path: 'kategori-analizi', label: 'Kategori Analizi' },
  { path: 'nakit-akisi', label: 'Nakit Akışı' },
  { path: 'en-buyuk-harcamalar', label: 'En Büyük Harcamalar' }
];

function Raporlar() {
  const { tarihAraligi, setTarihAraligi, handleVeriIndir } = useFinans();
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const location = useLocation(); // 🔹 animasyon için current path

  const actionButtons = (
    <>
      <button onClick={() => setIsDateRangeModalOpen(true)} className="secondary-btn">
        <FaCalendarAlt /> Tarih Aralığı Seç
      </button>
      <button onClick={handleVeriIndir} className="primary-btn">
        <FaDownload /> CSV İndir
      </button>
    </>
  );

  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Raporlar" />
      
      <SayfaKontrolPaneli actions={actionButtons}>
        {raporSekmeleri.map(sekme => (
          <NavLink key={sekme.path} to={sekme.path}>
            {sekme.label}
          </NavLink>
        ))}
      </SayfaKontrolPaneli>

      <main className="sayfa-icerik-alani">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}   // 🔹 sekme değişince yumuşak animasyon
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
          >
            <motion.div
              className="modal-content date-range-modal"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <DateRange
                editableDateInputs={true}
                onChange={item => setTarihAraligi([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={tarihAraligi}
                locale={tr}
              />
              <button
                onClick={() => setIsDateRangeModalOpen(false)}
                className="primary-btn"
              >
                Tamam
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Raporlar;
