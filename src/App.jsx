// src/App.jsx (CHART.JS HATASI GİDERİLMİŞ NİHAİ VERSİYON)

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
// DEĞİŞİKLİK: LineElement ve PointElement eklendi
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';
import { FinansProvider, useFinans } from './context/FinansContext';

// Sayfaları "lazy" olarak import ediyoruz
const GenelBakis = lazy(() => import('./pages/GenelBakis'));
const IslemlerPage = lazy(() => import('./pages/Islemler/IslemlerPage'));
const SabitOdemeler = lazy(() => import('./pages/SabitOdemeler'));
const Raporlar = lazy(() => import('./pages/Raporlar'));
const Butceler = lazy(() => import('./pages/Butceler'));
const Ozellestir = lazy(() => import('./pages/Ozellestir'));

// DEĞİŞİKLİK: LineElement ve PointElement kaydedildi
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

function AppContent() {
  const { isModalOpen } = useFinans(); // Artık Modal kendi fonksiyonlarını alıyor

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
      </header>

      <main className="main-content">
        <Suspense fallback={<div className="sayfa-yukleniyor">Yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<GenelBakis />} />
            <Route path="/Islemler" element={<IslemlerPage />} />
            <Route path="/ozellestir" element={<Ozellestir />} />
            <Route path="/raporlar" element={<Raporlar />} />
            <Route path="/sabit-odemeler" element={<SabitOdemeler />} />
            <Route path="/butceler" element={<Butceler />} />
          </Routes>
        </Suspense>
      </main>

      <Toaster position="bottom-center" />
      {/* Modal artık context'ten kendi durumunu ve fonksiyonlarını alıyor */}
      <Modal title="İşlemi Sil">
        <p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?</p>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <Router>
      <FinansProvider>
        <AppContent />
      </FinansProvider>
    </Router>
  );
}

export default App;