import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Toaster } from 'react-hot-toast';
import './App.css';

import AppLayout from './components/AppLayout'; // ✅ DÜZGÜN PATH
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from './context/AuthContext';

// --- Lazy Yüklenen Sayfalar ---
const GenelBakis = lazy(() => import('./pages/GenelBakis.jsx'));
const IslemlerPage = lazy(() => import('./pages/IslemlerPage.jsx'));
const SabitOdemeler = lazy(() => import('./pages/SabitOdemeler.jsx'));
const Raporlar = lazy(() => import('./pages/Raporlar.jsx'));
const Butceler = lazy(() => import('./pages/Butceler.jsx'));
const Ozellestir = lazy(() => import('./pages/Ozellestir.jsx'));
const Ayarlar = lazy(() => import('./pages/Ayarlar.jsx'));
const HedeflerPage = lazy(() => import('./pages/HedeflerPage.jsx'));

// --- Raporlar alt bileşenleri ---
const GenelTrendRaporu = lazy(() => import('./components/Raporlar/GenelTrendRaporu.jsx'));
const KategoriAnaliziRaporu = lazy(() => import('./components/Raporlar/KategoriAnaliziRaporu.jsx'));
const NakitAkisiRaporu = lazy(() => import('./components/Raporlar/NakitAkisiRaporu.jsx'));
const EnBuyukHarcamalarRaporu = lazy(() => import('./components/Raporlar/EnBuyukHarcamalarRaporu.jsx'));

// --- Özelleştir alt bileşenleri ---
const HesaplarYonetimi = lazy(() => import('./components/Ozellestir/HesaplarYonetimi.jsx'));
const KrediKartlariYonetimi = lazy(() => import('./components/Ozellestir/KrediKartlariYonetimi.jsx'));
const KategorilerYonetimi = lazy(() => import('./components/Ozellestir/KategorilerYonetimi.jsx'));

// --- Ayarlar alt bileşenleri ---
const ProfilBilgileri = lazy(() => import('./components/Ayarlar/ProfilBilgileri.jsx'));
const BildirimAyarlari = lazy(() => import('./components/Ayarlar/BildirimAyarlari.jsx'));
const Tercihler = lazy(() => import('./components/Ayarlar/Tercihler.jsx'));
const SifreDegistir = lazy(() => import('./components/Ayarlar/SifreDegistir.jsx'));
const VeriGuvenlik = lazy(() => import('./components/Ayarlar/VeriGuvenlik.jsx'));

// --- Chart.js Kurulumu ---
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

// 🔐 Giriş kontrolü + layout
function PrivateLayout() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // AppLayout içinde AppNavbar + <Outlet /> var
  return <AppLayout />;
}

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Suspense fallback={<div className="sayfa-yukleniyor">Yükleniyor...</div>}>
        <Routes>
          {/* Auth sayfaları: üst menü yok */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Giriş gerektiren tüm sayfalar: üst menülü layout */}
          <Route path="/" element={<PrivateLayout />}>
            {/* Ana sayfa */}
            <Route index element={<GenelBakis />} />

            {/* Diğer ana sayfalar */}
            <Route path="islemler" element={<IslemlerPage />} />
            <Route path="butceler" element={<Butceler />} />
            <Route path="hedefler" element={<HedeflerPage />} />
            <Route path="sabit-odemeler" element={<SabitOdemeler />} />

            {/* Raporlar (içinde tablı alt route’lar) */}
            <Route path="raporlar" element={<Raporlar />}>
              <Route index element={<Navigate to="genel-trend" replace />} />
              <Route path="genel-trend" element={<GenelTrendRaporu />} />
              <Route path="kategori-analizi" element={<KategoriAnaliziRaporu />} />
              <Route path="nakit-akisi" element={<NakitAkisiRaporu />} />
              <Route path="en-buyuk-harcamalar" element={<EnBuyukHarcamalarRaporu />} />
            </Route>

            {/* Özelleştir */}
            <Route path="ozellestir" element={<Ozellestir />}>
              <Route index element={<Navigate to="hesaplar" replace />} />
              <Route path="hesaplar" element={<HesaplarYonetimi />} />
              <Route path="kartlar" element={<KrediKartlariYonetimi />} />
              <Route path="kategoriler" element={<KategorilerYonetimi />} />
            </Route>

            {/* Ayarlar */}
            <Route path="ayarlar" element={<Ayarlar />}>
              <Route index element={<Navigate to="profil" replace />} />
              <Route path="profil" element={<ProfilBilgileri />} />
              <Route path="tercihler" element={<Tercihler />} />
              <Route path="bildirimler" element={<BildirimAyarlari />} />
              <Route path="sifre-degistir" element={<SifreDegistir />} />
              <Route path="veri-guvenlik" element={<VeriGuvenlik />} />
            </Route>

            {/* Bilinmeyen path’ler için fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
