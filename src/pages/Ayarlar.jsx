import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SayfaBasligi from '../components/SayfaBasligi';
import SayfaKontrolPaneli from '../components/SayfaKontrolPaneli';

// Sekmelerimizi ve yönlendirecekleri yolları tanımlıyoruz
const ayarSekmeleri = [
  { path: 'profil', label: 'Profil Bilgileri' },
  { path: 'tercihler', label: 'Tercihler' },
  { path: 'bildirimler', label: 'Bildirimler' },
  { path: 'sifre-degistir', label: 'Şifre Değiştir' },
  { path: 'veri-guvenlik', label: 'Veri & Güvenlik' }
];

function Ayarlar() {
  const location = useLocation(); // Animasyon için location'ı alıyoruz

  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Hesap Ayarları" />
      
      {/* DEĞİŞİKLİK: Eski <nav> yerine <SayfaKontrolPaneli> kullanıyoruz */}
      <SayfaKontrolPaneli>
        {ayarSekmeleri.map(sekme => (
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
    </div>
  );
}

export default Ayarlar;