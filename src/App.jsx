import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';

// Yeni Context'imizi içe aktarıyoruz
import { FinansProvider, useFinans } from './context/FinansContext';

// Eski sayfaları içe aktarıyoruz
import GenelBakis from './pages/GenelBakis';
import IslemlerPage from './pages/islemler/IslemlerPage';
import SabitOdemeler from './pages/SabitOdemeler';
import Raporlar from './pages/Raporlar';
import Butceler from './pages/Butceler';
import Ozellestir from './pages/Ozellestir';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// src/App.jsx -> AppContent fonksiyonunun içini güncelle

function AppContent() {
  const { isModalOpen, handleCloseModal, handleConfirmDelete } = useFinans();

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
        <Routes>
          <Route path="/" element={<GenelBakis />} />
          <Route path="/Islemler" element={<IslemlerPage />} />
          <Route path="/ozellestir" element={<Ozellestir />} />
          <Route path="/raporlar" element={<Raporlar />} />
          <Route path="/sabit-odemeler" element={<SabitOdemeler />} />
          <Route path="/butceler" element={<Butceler />} />
        </Routes>
      </main>

      {/* Bu bileşenler sayfa dışında kalabilir, sorun değil */}
      <Toaster position="bottom-center" />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} title="İşlemi Sil"><p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz?</p></Modal>
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
