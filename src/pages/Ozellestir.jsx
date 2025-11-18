import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SayfaBasligi from '../components/SayfaBasligi';
import SayfaKontrolPaneli from '../components/SayfaKontrolPaneli';

const ozellestirSekmeleri = [
  { path: 'hesaplar', label: 'Hesaplar' },
  { path: 'kartlar', label: 'Kartlar' },
  { path: 'kategoriler', label: 'Kategoriler' },
];

// Aktif sekmeye göre küçük açıklama ve ipucu metni
function getSekmeBilgisi(pathname) {
  if (pathname.includes('kartlar')) {
    return {
      baslik: 'Kayıtlı Kartlar',
      aciklama:
        'Kredi kartlarınızı, kesim ve son ödeme günlerini buradan yönetebilirsiniz.',
    };
  }
  if (pathname.includes('kategoriler')) {
    return {
      baslik: 'Gelir / Gider Kategorileri',
      aciklama:
        'Hareketlerinizi gruplayacağınız kategorileri düzenleyin, yeni kategoriler ekleyin.',
    };
  }
  // varsayılan: hesaplar
  return {
    baslik: 'Mevcut Hesaplar',
    aciklama:
      'Nakit, banka hesabı ve kart benzeri tüm hesaplarınızı burada tanımlayın.',
  };
}

function Ozellestir() {
  const location = useLocation();
  const sekmeBilgisi = getSekmeBilgisi(location.pathname);

  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Özelleştir" />

      {/* Sekme butonları */}
      <SayfaKontrolPaneli>
        {ozellestirSekmeleri.map((sekme) => (
          <NavLink key={sekme.path} to={sekme.path}>
            {sekme.label}
          </NavLink>
        ))}
      </SayfaKontrolPaneli>

      {/* Aktif sekmeye özel mini açıklama bloğu */}
      <div className="ozellestir-sekme-bilgi">
        <div className="ozellestir-sekme-bilgi-baslik">
          {sekmeBilgisi.baslik}
        </div>
        <p className="ozellestir-sekme-bilgi-aciklama">
          {sekmeBilgisi.aciklama}
        </p>
      </div>

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

export default Ozellestir;
