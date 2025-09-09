// src/App.jsx (EKSİK IMPORT'LARI VE HATALARI DÜZELTİLMİŞ NİHAİ VERSİYON)

import { lazy, Suspense } from 'react';
// YENİ: useNavigate'i react-router-dom'dan import ediyoruz
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
// YENİ: toast'ı react-hot-toast'tan import ediyoruz
import { Toaster, toast } from 'react-hot-toast';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';
import { useFinans } from './context/FinansContext';
import { useAuth } from './context/AuthContext';

// Sayfaları "lazy" olarak import ediyoruz
const GenelBakis = lazy(() => import('./pages/GenelBakis.jsx'));
const IslemlerPage = lazy(() => import('./pages/IslemlerPage.jsx'));
const SabitOdemeler = lazy(() => import('./pages/SabitOdemeler.jsx'));
const Raporlar = lazy(() => import('./pages/Raporlar.jsx'));
const Butceler = lazy(() => import('./pages/Butceler.jsx'));
const Ozellestir = lazy(() => import('./pages/Ozellestir.jsx'));
const Ayarlar = lazy(() => import('./pages/Ayarlar.jsx'));

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Chart.js ayarları
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);


// ProtectedRoute bileşeni (değişiklik yok)
function ProtectedRoute({ children, guestAllowed = false }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    if (guestAllowed) {
      return children;
    }
    return <Navigate to="/login" />;
  }
  return children;
}


// Ana Uygulama Düzeni (AppLayout)
function AppLayout() {
  const { isModalOpen } = useFinans();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate(); // Artık import edildiği için hata vermeyecek

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success("Başarıyla çıkış yapıldı."); // Artık import edildiği için hata vermeyecek
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
        <div className="header-actions">
          {currentUser ? (
            <button onClick={handleLogout} className="logout-button">Çıkış Yap</button>
          ) : (
            <NavLink to="/login" className="login-button">Giriş Yap</NavLink>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Suspense fallback={<div className="sayfa-yukleniyor">Yükleniyor...</div>}>
            <Routes>
              {/* Rotalar aynı kalıyor */}
              <Route path="/" element={<ProtectedRoute guestAllowed={true}><GenelBakis /></ProtectedRoute>} />
              <Route path="/Islemler" element={<ProtectedRoute guestAllowed={true}><IslemlerPage /></ProtectedRoute>} />
              <Route path="/ozellestir" element={<ProtectedRoute><Ozellestir /></ProtectedRoute>} />
              <Route path="/raporlar" element={<ProtectedRoute><Raporlar /></ProtectedRoute>} />
              <Route path="/sabit-odemeler" element={<ProtectedRoute><SabitOdemeler /></ProtectedRoute>} />
              <Route path="/butceler" element={<ProtectedRoute><Butceler /></ProtectedRoute>} />
              <Route path="/ayarlar" element={<ProtectedRoute><Ayarlar /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* DÜZELTME: Modal'ı isModalOpen kontrolü ile gösteriyoruz */}
      {isModalOpen && (
        <Modal title="İşlemi Sil">
            <p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?</p>
        </Modal>
      )}
    </div>
  );
}

// Ana App bileşeni (değişiklik yok)
function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<AppLayout />} />
      </Routes>
    </>
  );
}

export default App;