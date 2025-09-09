// src/pages/Ayarlar.jsx (DOĞRU VE NİHAİ VERSİYON)

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Profil Bilgileri Formu
function ProfilBilgileriFormu() {
    const { currentUser, updateProfileName } = useAuth();
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (displayName === (currentUser?.displayName || '')) {
            return;
        }
        setLoading(true);
        try {
            await updateProfileName(displayName);
        } catch (error) {
            console.error("Profil güncelleme hatası:", error);
            toast.error("Profil adı güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bolum">
            <h3>Profil Bilgileri</h3>
            <form onSubmit={handleSubmit} className="form-modern">
                <div>
                    <label htmlFor="email">E-posta Adresi</label>
                    <input
                        id="email"
                        type="email"
                        value={currentUser?.email || ''}
                        disabled 
                        style={{ backgroundColor: '#f1f2f6', cursor: 'not-allowed' }}
                    />
                </div>
                <div>
                    <label htmlFor="displayName">Görünen Ad</label>
                    <input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Adınız veya takma adınız"
                    />
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </form>
        </div>
    );
}

// Şifre Değiştirme Formu
function SifreDegistirFormu() {
    const { currentUser } = useAuth();
    const [yeniSifre, setYeniSifre] = useState('');
    const [sifreTekrar, setSifreTekrar] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (yeniSifre.length < 6) {
            return toast.error("Yeni şifre en az 6 karakter olmalıdır.");
        }
        if (yeniSifre !== sifreTekrar) {
            return toast.error("Şifreler uyuşmuyor.");
        }
        setLoading(true);
        try {
            await updatePassword(currentUser, yeniSifre);
            toast.success("Şifreniz başarıyla güncellendi!");
            setYeniSifre('');
            setSifreTekrar('');
        } catch (error) {
            console.error("Şifre güncelleme hatası:", error);
            toast.error("Şifre güncellenemedi. Lütfen çıkış yapıp tekrar giriş yaptıktan sonra deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bolum">
            <h3>Şifre Değiştir</h3>
            <form onSubmit={handleSubmit} className="form-modern">
                <div>
                    <label htmlFor="yeni-sifre">Yeni Şifre</label>
                    <input
                        id="yeni-sifre"
                        type="password"
                        value={yeniSifre}
                        onChange={(e) => setYeniSifre(e.target.value)}
                        placeholder="Yeni şifrenizi girin"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="sifre-tekrar">Yeni Şifre (Tekrar)</label>
                    <input
                        id="sifre-tekrar"
                        type="password"
                        value={sifreTekrar}
                        onChange={(e) => setSifreTekrar(e.target.value)}
                        placeholder="Yeni şifrenizi tekrar girin"
                        required
                    />
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </button>
            </form>
        </div>
    );
}

// Tehlikeli Bölge
function TehlikeliBolge() {
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleHesapSil = async () => {
        const eminMisin = window.confirm("Emin misiniz? Bu işlem geri alınamaz. Hesabınız ve tüm finansal verileriniz kalıcı olarak silinecektir.");
        if (eminMisin) {
            setLoading(true);
            try {
                await deleteAccount();
                navigate('/login'); 
            } catch (error) {
                console.error("Hesap silme hatası:", error);
                // AuthContext'teki hata mesajı zaten gösterilecek, burada tekrar göstermeye gerek yok.
                setLoading(false);
            }
        }
    };

    return (
        <div className="bolum danger-zone">
            <h3>Tehlikeli Bölge</h3>
            <div className="danger-zone-item">
                <div>
                    <h4>Hesabı Kalıcı Olarak Sil</h4>
                    <p>Bu işlem geri alınamaz. Tüm verileriniz silinecektir.</p>
                </div>
                <button onClick={handleHesapSil} className="danger-btn" disabled={loading}>
                    {loading ? "Siliniyor..." : "Hesabımı Sil"}
                </button>
            </div>
        </div>
    );
}

// Ana Ayarlar Bileşeni
function Ayarlar() {
  return (
    <div className="card">
      <div className="card-header">
        <h2>Hesap Ayarları</h2>
      </div>
      <div className="yonetim-sayfasi-layout" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        <ProfilBilgileriFormu />
        <SifreDegistirFormu />
        <TehlikeliBolge />
      </div>
    </div>
  );
}

export default Ayarlar;