import { NavLink, Outlet } from 'react-router-dom';
import SayfaBasligi from '../components/SayfaBasligi';
import '../components/SayfaIciNav.css';

const ayarSekmeleri = [
  { path: 'profil', label: 'Profil Bilgileri' },
  { path: 'tercihler', label: 'Tercihler' },
  { path: 'bildirimler', label: 'Bildirimler' },
  { path: 'sifre-degistir', label: 'Şifre Değiştir' },
  { path: 'veri-guvenlik', label: 'Veri & Güvenlik' }
];

function Ayarlar() {
  return (
    <div className="sayfa-container">
      <SayfaBasligi title="Hesap Ayarları" />
      
      <nav className="sayfa-ici-nav">
        {ayarSekmeleri.map(sekme => (
          <NavLink key={sekme.path} to={sekme.path}>
            {sekme.label}
          </NavLink>
        ))}
      </nav>

      <main className="sayfa-icerik-alani">
        <Outlet />
      </main>
    </div>
  );
}

export default Ayarlar;