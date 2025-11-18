// src/layout/AppLayout.jsx
import { Outlet } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

function AppLayout() {
  return (
    <div className="app-shell">
      <AppNavbar />

      <main className="app-main">
        {/* Eski sayfa-container'ların hepsi bu Outlet'in içinde render oluyor */}
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
