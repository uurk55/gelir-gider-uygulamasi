// src/pages/Ayarlar.jsx (BİLDİRİMLER SEKİMESİ EKLENDİ)

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinans } from '../context/FinansContext'; // YENİ: FinansContext'i import ediyoruz
import toast from 'react-hot-toast';
import { FaUserCircle, FaLock, FaDatabase, FaBell } from 'react-icons/fa'; // YENİ: FaBell ikonu eklendi

// --- Küçük, yeniden kullanılabilir bileşen (Switch) ---
const SwitchInput = ({ label, ...props }) => (
    <div className="switch-container">
        <label className="switch-label">{label}</label>
        <label className="switch">
            <input type="checkbox" {...props} />
            <span className="slider round"></span>
        </label>
    </div>
);
const ProfilBilgileri = () => {
    const { currentUser, updateProfileName } = useAuth();
    const [gorunenAd, setGorunenAd] = useState(currentUser?.displayName || '');

    const handleProfilGuncelle = (e) => {
        e.preventDefault();
        if (currentUser.displayName !== gorunenAd) {
            updateProfileName(gorunenAd).catch(err => toast.error(err.message));
        }
    };
    
    return (
        <div className="ayar-icerik-bolumu">
            <h2>Profil Bilgileri</h2>
            <form onSubmit={handleProfilGuncelle} className="ayar-formu">
                <div className="form-grup">
                    <label>E-posta Adresi</label>
                    <input type="email" value={currentUser?.email || ''} disabled />
                </div>
                <div className="form-grup">
                    <label htmlFor="gorunenAd">Görünen Ad</label>
                    <input id="gorunenAd" type="text" value={gorunenAd} onChange={(e) => setGorunenAd(e.target.value)} />
                </div>
                <button type="submit" className="primary-btn">Değişiklikleri Kaydet</button>
            </form>
        </div>
    );
};
const BildirimAyarlari = () => {
    // FinansContext'ten ayarları ve güncelleme fonksiyonunu çekiyoruz
    const { ayarlar, updateBildirimAyarlari } = useFinans();

    const handleBildirimDegisikligi = (ayarAdi, yeniDeger) => {
        const yeniAyarlar = {
            ...ayarlar.bildirimler,
            [ayarAdi]: yeniDeger,
        };
        updateBildirimAyarlari(yeniAyarlar);
    };

    return (
        <div className="ayar-icerik-bolumu">
            <h2>Bildirim Ayarları</h2>
            <p className="ayar-aciklama">Hangi durumlarda e-posta ile bildirim almak istediğinizi seçin.</p>
            <div className="ayar-formu">
                <SwitchInput 
                    label="Yaklaşan ödemeler için hatırlatıcı gönder"
                    checked={ayarlar.bildirimler.yaklasanOdemeler}
                    onChange={(e) => handleBildirimDegisikligi('yaklasanOdemeler', e.target.checked)}
                />
                <SwitchInput 
                    label="Bütçe limitine yaklaşıldığında uyar (%90)"
                    checked={ayarlar.bildirimler.butceAsimi}
                    onChange={(e) => handleBildirimDegisikligi('butceAsimi', e.target.checked)}
                />
                <SwitchInput 
                    label="Haftalık harcama özetini e-posta ile gönder"
                    checked={ayarlar.bildirimler.haftalikOzet}
                    onChange={(e) => handleBildirimDegisikligi('haftalikOzet', e.target.checked)}
                />
            </div>
        </div>
    );
};

const SifreDegistir = () => (
    <div className="ayar-icerik-bolumu">
        <h2>Şifre Değiştir</h2>
        <form className="ayar-formu">
            <div className="form-grup">
                <label htmlFor="yeniSifre">Yeni Şifre</label>
                <input id="yeniSifre" type="password" placeholder="Yeni şifrenizi girin" />
            </div>
            <div className="form-grup">
                <label htmlFor="yeniSifreTekrar">Yeni Şifre (Tekrar)</label>
                <input id="yeniSifreTekrar" type="password" placeholder="Yeni şifrenizi tekrar girin" />
            </div>
            <button type="submit" className="primary-btn">Şifreyi Güncelle</button>
        </form>
    </div>
);

const VeriGuvenlik = () => {
    const { deleteAccount } = useAuth();
    const handleHesapSil = () => {
        if(window.confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            deleteAccount().catch(err => toast.error(err.message));
        }
    };
    return (
        <div className="ayar-icerik-bolumu">
            <h2>Veri & Güvenlik</h2>
            <div className="ayar-bolumu tehlikeli-bolge">
                <h4>Hesabı Kalıcı Olarak Sil</h4>
                <p>Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak yok edilir.</p>
                <button onClick={handleHesapSil} className="danger-btn">Hesabımı Sil</button>
            </div>
        </div>
    );
};

// --- Ana Ayarlar Sayfası ---
const AYAR_SEKMELERI = {
    PROFIL: 'Profil Bilgileri',
    BILDIRIMLER: 'Bildirimler', // YENİ SEKME
    SIFRE: 'Şifre Değiştir',
    VERI: 'Veri & Güvenlik'
};

const sekmeIkonlari = {
    [AYAR_SEKMELERI.PROFIL]: <FaUserCircle />,
    [AYAR_SEKMELERI.BILDIRIMLER]: <FaBell />, // YENİ İKON
    [AYAR_SEKMELERI.SIFRE]: <FaLock />,
    [AYAR_SEKMELERI.VERI]: <FaDatabase />
};

function Ayarlar() {
    const [aktifSekme, setAktifSekme] = useState(AYAR_SEKMELERI.PROFIL);

    const renderAktifSekme = () => {
        switch(aktifSekme) {
            case AYAR_SEKMELERI.BILDIRIMLER: return <BildirimAyarlari />; // YENİ CASE
            case AYAR_SEKMELERI.SIFRE: return <SifreDegistir />;
            case AYAR_SEKMELERI.VERI: return <VeriGuvenlik />;
            case AYAR_SEKMELERI.PROFIL:
            default: return <ProfilBilgileri />;
        }
    };

    return (
        <div className="sayfa-container ayarlar-sayfasi">
            <h1>Hesap Ayarları</h1>
            <div className="ayarlar-layout">
                <nav className="ayarlar-menu">
                    {Object.values(AYAR_SEKMELERI).map(sekme => (
                        <button 
                            key={sekme}
                            className={`ayar-menu-item ${aktifSekme === sekme ? 'aktif' : ''}`}
                            onClick={() => setAktifSekme(sekme)}
                        >
                            {sekmeIkonlari[sekme]}
                            <span>{sekme}</span>
                        </button>
                    ))}
                </nav>
                <main className="ayarlar-icerik">
                    {renderAktifSekme()}
                </main>
            </div>
        </div>
    );
}

export default Ayarlar;