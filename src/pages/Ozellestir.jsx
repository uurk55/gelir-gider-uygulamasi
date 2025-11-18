import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SayfaBasligi from '../components/SayfaBasligi';
import SayfaKontrolPaneli from '../components/SayfaKontrolPaneli';

// Sekmelerimizi ve yönlendirecekleri yolları tanımlıyoruz
const ozellestirSekmeleri = [
  { path: 'hesaplar', label: 'Hesaplar' },
  { path: 'kartlar', label: 'Kartlar' },
  { path: 'kategoriler', label: 'Kategoriler' }
];

function Ozellestir() {
  const location = useLocation(); // Animasyonun anahtarı için location'ı alıyoruz

  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Özelleştir" />
      
      <SayfaKontrolPaneli>
        {ozellestirSekmeleri.map(sekme => (
          <NavLink key={sekme.path} to={sekme.path}>
            {sekme.label}
          </NavLink>
        ))}
      </SayfaKontrolPaneli>

      <main className="sayfa-icerik-alani">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Animasyonun yol değişiminde tetiklenmesini sağlar
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Ozellestir;