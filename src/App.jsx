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

// Sayfaları "lazy" olarak import ediyoruz (DOĞRU VE TAM HALİ)
const GenelBakis = lazy(() => import('./pages/GenelBakis.jsx'));
const IslemlerPage = lazy(() => import('./pages/IslemlerPage.jsx'));
const SabitOdemeler = lazy(() => import('./pages/SabitOdemeler.jsx'));
const Raporlar = lazy(() => import('./pages/Raporlar.jsx'));
const Butceler = lazy(() => import('./pages/Butceler.jsx'));
const Ozellestir = lazy(() => import('./pages/Ozellestir.jsx'));
const Ayarlar = lazy(() => import('./pages/Ayarlar.jsx')); // <-- EKSİK OLAN SATIR BU

// YENİ: Giriş ve Kayıt sayfalarını import ediyoruz (Bunlar lazy olmamalı)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Chart.js ayarları (Mevcut yapınız korundu)
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);


// YENİ: ProtectedRoute'u daha esnek hale getiriyoruz
// guestAllowed: Bu sayfanın misafir tarafından görülüp görülemeyeceğini belirtir.
// premiumRequired: Bu sayfanın premium üyelik gerektirip gerektirmediğini belirtir (gelecek için).

function ProtectedRoute({ children, guestAllowed = false }) {
  const { currentUser } = useAuth();
  
  // Eğer kullanıcı giriş yapmamışsa...
  if (!currentUser) {
    // ...ama bu sayfa misafir erişimine AÇIKSA, sayfayı göster.
    if (guestAllowed) {
      return children;
    }
    // ...ve sayfa misafir erişimine KAPALIYSA, login sayfasına yönlendir.
    return <Navigate to="/login" />;
  }
  
  // Kullanıcı giriş yapmışsa her zaman sayfayı göster.
  return children;
}


// LoggedInLayout'u artık "Ana Uygulama Düzeni" (AppLayout) olarak yeniden adlandırıyoruz,
// çünkü artık hem giriş yapmış kullanıcılar hem de misafirler tarafından kullanılacak.
function AppLayout() {
  const { isModalOpen } = useFinans();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
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
          {/* NavLink'leri artık ProtectedRoute gibi sarmalamaya gerek yok,
              çünkü hangi sayfanın görüneceğine Route kendisi karar verecek */}
          <NavLink to="/">Genel Bakış</NavLink>
          <NavLink to="/Islemler">İşlemler</NavLink>
          {/* Sadece giriş yapmış kullanıcıların görebileceği linkler */}
          {currentUser && (
            <>
              <NavLink to="/ozellestir">Özelleştir</NavLink>
              <NavLink to="/raporlar">Raporlar</NavLink>
              <NavLink to="/sabit-odemeler">Sabit Ödemeler</NavLink>
              <NavLink to="/butceler">Bütçeler</NavLink>
              <NavLink to="/ayarlar">Ayarlar</NavLink>
            </>
          )}
        </nav>

        {/* Duruma göre "Çıkış Yap" veya "Giriş Yap" butonu göster */}
        {currentUser ? (
          <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>
        ) : (
          <NavLink to="/login" className="login-button">Giriş Yap</NavLink>
        )}
      </header>

      <main className="main-content">
         <Suspense fallback={<div className="sayfa-yukleniyor">Yükleniyor...</div>}>
          <Routes>
            {/* Misafirlerin görebileceği sayfalar */}
            <Route path="/" element={<ProtectedRoute guestAllowed={true}><GenelBakis /></ProtectedRoute>} />
            <Route path="/Islemler" element={<ProtectedRoute guestAllowed={true}><IslemlerPage /></ProtectedRoute>} />

            {/* SADECE giriş yapmış kullanıcıların görebileceği sayfalar */}
            <Route path="/ozellestir" element={<ProtectedRoute><Ozellestir /></ProtectedRoute>} />
            <Route path="/raporlar" element={<ProtectedRoute><Raporlar /></ProtectedRoute>} />
            <Route path="/sabit-odemeler" element={<ProtectedRoute><SabitOdemeler /></ProtectedRoute>} />
            <Route path="/butceler" element={<ProtectedRoute><Butceler /></ProtectedRoute>} />
            <Route path="/ayarlar" element={<ProtectedRoute><Ayarlar /></ProtectedRoute>} />
            
            {/* Yanlış bir adrese gidilirse ana sayfaya yönlendir */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>

      {/* Modal, hala tüm uygulama içinde kullanılabilir olmalı */}
      <Modal title="İşlemi Sil">
        <p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
}

// Ana App bileşeni artık çok daha basit.
function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
          {/* Giriş ve Kayıt sayfaları her zaman ana düzenin dışında olacak */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Diğer tüm adresler (*), ana uygulama düzenini (AppLayout) render edecek */}
          <Route path="/*" element={<AppLayout />} />
      </Routes>
    </>
  );
}
export default App;