// src/components/AppNavbar.jsx

import { NavLink } from "react-router-dom";
import { FaChartPie, FaListUl, FaChartBar, FaWallet, FaBullseye, FaRedo, FaSlidersH } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function AppNavbar() {
  const { currentUser } = useAuth() || {};
  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Misafir";

  const navLinks = [
    { to: "/", label: "Genel Bakış", icon: <FaChartPie /> },
    { to: "/islemler", label: "İşlemler", icon: <FaListUl /> },
    { to: "/raporlar", label: "Raporlar", icon: <FaChartBar /> },
    { to: "/butceler", label: "Bütçeler", icon: <FaWallet /> },
    { to: "/hedefler", label: "Hedefler", icon: <FaBullseye /> },
    { to: "/sabit-odemeler", label: "Sabit Ödemeler", icon: <FaRedo /> },
    { to: "/ozellestir", label: "Özelleştir", icon: <FaSlidersH /> },
  ];

  return (
    <header className="app-navbar">
      <div className="app-navbar-left">
        <div className="app-navbar-logo">
          <span className="logo-icon">₺</span>
          <span className="logo-text">FinansTakip</span>
        </div>
      </div>

      <nav className="app-navbar-center">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              "app-navbar-link" + (isActive ? " is-active" : "")
            }
            end={link.to === "/"}
          >
            <span className="link-icon">{link.icon}</span>
            <span className="link-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-navbar-right">
        <div className="user-pill">
          <div className="user-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-sub">Hesabım</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppNavbar;
