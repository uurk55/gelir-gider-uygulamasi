import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';
import Hesaplar from './pages/Hesaplar';

// Yeni Context'imizi içe aktarıyoruz
import { FinansProvider, useFinans } from './context/FinansContext';

// Eski sayfaları içe aktarıyoruz
import GenelBakis from './pages/GenelBakis';
import Islemler from './pages/Islemler';
import SabitOdemeler from './pages/SabitOdemeler';
import Raporlar from './pages/Raporlar';
import Ayarlar from './pages/Ayarlar';
import Butceler from './pages/Butceler';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AppContent() {
  const { isModalOpen, handleCloseModal, handleConfirmDelete } = useFinans();

  // Yalnızca uygulamanın ana yapısı ve routing (yönlendirme) burada kalıyor.
  return (
    <div className="app-container">
      <Toaster position="bottom-center" reverseOrder={false} toastOptions={{ style: { background: '#363636', color: '#fff', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.16)', }, success: { iconTheme: { primary: '#4ade80', secondary: '#fff', }, }, error: { iconTheme: { primary: '#f87171', secondary: '#fff', }, },}} />
      <h1>Gelir - Gider Takip</h1>
      <nav className="nav-menu">
        <NavLink to="/">Genel Bakış</NavLink>
        <NavLink to="/Islemler">İşlemler</NavLink>
        <NavLink to="/raporlar">Raporlar</NavLink>
        <NavLink to="/sabit-odemeler">Sabit Ödemeler</NavLink>
        <NavLink to="/butceler">Bütçeler</NavLink>
        <NavLink to="/ayarlar">Ayarlar</NavLink>
        <NavLink to="/hesaplar">Hesaplar</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<GenelBakis />} />
          <Route path="/Islemler" element={<Islemler />} />
          <Route path="/raporlar" element={<Raporlar />} />
          <Route path="/sabit-odemeler" element={<SabitOdemeler />} />
          <Route path="/butceler" element={<Butceler />} />
          <Route path="/ayarlar" element={<Ayarlar />} />
          <Route path="/hesaplar" element={<Hesaplar />} />
        </Routes>
      </main>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} title="İşlemi Sil"><p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p></Modal>
    </div>
  );
}

// Uygulamanın tamamını Context'imiz ile sarmalıyoruz.
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