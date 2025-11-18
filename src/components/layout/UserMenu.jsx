// src/components/layout/UserMenu.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCog, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function UserMenu() {
  const { currentUser, logout } = useAuth() || {};
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName =
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "Kullanıcı";

  const initialLetter = displayName.charAt(0).toUpperCase();

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleGotoSettings = () => {
    setOpen(false);
    navigate("/ayarlar/profil");
  };

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      setOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Çıkış hatası:", err);
    }
  };

  return (
    <div className="user-menu-root" ref={menuRef}>
      {/* NAVBAR SAĞ TARAF – SADECE HESABIM YAZIYOR */}
      <button
        type="button"
        className="user-menu-button"
        onClick={handleToggle}
      >
        <div className="user-avatar">{initialLetter}</div>
        <div className="user-pill-text">
          {/* burada lakap/mail YOK, sadece Hesabım */}
          <span className="user-pill-name">Hesabım</span>
        </div>
      </button>

      {/* AÇILAN PANEL */}
      {open && (
        <div className="user-menu-panel">
          <div className="user-menu-header">
            <div className="avatar-circle">{initialLetter}</div>
            <div className="user-menu-header-text">
              {/* Başlık: Hesabım */}
              <div className="user-menu-name">Hesabım</div>
              {/* Alt satırda mail adresi */}
              {currentUser?.email && (
                <div className="user-menu-email">{currentUser.email}</div>
              )}
            </div>
          </div>

          <div className="user-menu-divider" />

          {/* BURASI ARTIK "AYARLAR" */}
          <button
            type="button"
            className="user-menu-item"
            onClick={handleGotoSettings}
          >
            <FaUserCog className="user-menu-item-icon" />
            <span>Ayarlar</span>
          </button>

          <button
            type="button"
            className="user-menu-item user-menu-item-danger"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="user-menu-item-icon" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
