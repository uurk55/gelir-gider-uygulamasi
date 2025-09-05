// src/App.jsx (AUTHENTICATION ENTEGRE EDİLMİŞ NİHAİ VERSİYON)

import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';
import { useFinans } from './context/FinansContext';
import { useAuth } from './context/AuthContext'; // YENİ: AuthContext'i import ediyoruz

// Sayfaları "lazy" olarak import ediyoruz (Mevcut yapınız korundu)
const GenelBakis = lazy(() => import('./pages/GenelBakis'));
const IslemlerPage = lazy(() => import('./pages/Islemler/IslemlerPage'));
const SabitOdemeler = lazy(() => import('./pages/SabitOdemeler'));
const Raporlar = lazy(() => import('./pages/Raporlar'));
const Butceler = lazy(() => import('./pages/Butceler'));
const Ozellestir = lazy(() => import('./pages/Ozellestir'));

// YENİ: Giriş ve Kayıt sayfalarını import ediyoruz (Bunlar lazy olmamalı)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Chart.js ayarları (Mevcut yapınız korundu)
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);


// YENİ: ProtectedRoute Bileşeni
// Bu bileşen, bir sayfanın sadece giriş yapmış kullanıcılar tarafından görülmesini sağlar.
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  // Eğer kullanıcı giriş yapmamışsa, onu login sayfasına yönlendirir.
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Giriş yapmışsa, istenen sayfayı gösterir.
  return children;
}


// DEĞİŞİKLİK: AppContent bileşeninin adı LoggedInLayout olarak değiştirildi ve App içine taşındı
// Bu, sadece giriş yapmış kullanıcıların göreceği ana uygulama düzenidir.
function LoggedInLayout() {
  const { isModalOpen } = useFinans();
  const { logout } = useAuth(); // YENİ: AuthContext'ten logout fonksiyonunu alıyoruz

  // YENİ: Çıkış yapma işlemini yönetecek fonksiyon
  const handleLogout = async () => {
    try {
      await logout();
      // Yönlendirmeye gerek yok, AuthContext'teki değişiklik App.jsx'i otomatik olarak güncelleyecek.
      toast.success("Başarıyla çıkış yapıldı.");
    } catch {
      toast.error("Çıkış yapılamadı.");
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-logo">FinansTakip</div>
        <nav className="header-nav">
          <NavLink to="/">Genel Bakış</NavLink>
          <NavLink to="/Islemler">İşlemler</NavLink>
          <NavLink to="/ozellestir">Özelleştir</NavLink>
          <NavLink to="/raporlar">Raporlar</NavLink>
          <NavLink to="/sabit-odemeler">Sabit Ödemeler</NavLink>
          <NavLink to="/butceler">Bütçeler</NavLink>
        </nav>

        {/* YENİ: Çıkış Yap Butonu */}
        <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>

      </header>

      <main className="main-content">
         <Suspense fallback={<div className="sayfa-yukleniyor">Yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><GenelBakis /></ProtectedRoute>} />
            <Route path="/Islemler" element={<ProtectedRoute><IslemlerPage /></ProtectedRoute>} />
            <Route path="/ozellestir" element={<ProtectedRoute><Ozellestir /></ProtectedRoute>} />
            <Route path="/raporlar" element={<ProtectedRoute><Raporlar /></ProtectedRoute>} />
            <Route path="/sabit-odemeler" element={<ProtectedRoute><SabitOdemeler /></ProtectedRoute>} />
            <Route path="/butceler" element={<ProtectedRoute><Butceler /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>

      <Modal title="İşlemi Sil">
        <p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
}

// DEĞİŞİKLİK: Ana App bileşeni artık tüm yönlendirme mantığını yönetiyor.
function App() {
  const { currentUser } = useAuth();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {currentUser ? (
          // Eğer kullanıcı giriş yapmışsa, ana uygulama düzenini ve korumalı rotaları göster
          <Route path="/*" element={<LoggedInLayout />} />
        ) : (
          // Eğer kullanıcı giriş yapmamışsa, sadece login ve signup sayfalarını göster
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            {/* Giriş yapmamış kullanıcı başka bir adrese giderse login'e yönlendir */}
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </>
  );
}

// DEĞİŞİKLİK: Buradaki Router ve FinansProvider sarmalayıcıları,
// zaten main.jsx dosyasında olduğu için buradan kaldırıldı.
export default App;