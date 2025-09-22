import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaChartPie, FaExchangeAlt, FaCogs, FaListAlt, FaBullseye, FaFileInvoiceDollar, FaCog, FaSignOutAlt, FaUserCircle, FaPiggyBank } from 'react-icons/fa';

function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const kullaniciAdi = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success("Başarıyla çıkış yapıldı.");
    } catch {
      toast.error("Çıkış yapılamadı.");
    }
  };
  
  return (
    <aside className="sidebar">
      <div className="sidebar-ust">
        <div className="sidebar-logo">
          <FaPiggyBank /> FinansTakip
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/"><FaChartPie /> Genel Bakış</NavLink>
          <NavLink to="/islemler"><FaExchangeAlt /> İşlemler</NavLink>
          <NavLink to="/raporlar"><FaListAlt /> Raporlar</NavLink>
          <NavLink to="/butceler"><FaBullseye /> Bütçeler</NavLink>
          <NavLink to="/hedefler"><FaFileInvoiceDollar /> Hedefler</NavLink>
          <NavLink to="/sabit-odemeler"><FaCogs /> Sabit Ödemeler</NavLink>
          <NavLink to="/ozellestir"><FaCog /> Özelleştir</NavLink>
        </nav>
      </div>
      <div className="sidebar-alt">
        <div className="kullanici-profili">
          <FaUserCircle className="kullanici-avatar" />
          <span className="kullanici-adi">{kullaniciAdi}</span>
        </div>
        <NavLink to="/ayarlar" className="ayar-linki"><FaCog /> Ayarlar</NavLink>
        <button onClick={handleLogout} className="cikis-butonu">
          <FaSignOutAlt /> Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;