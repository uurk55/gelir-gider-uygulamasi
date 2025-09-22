import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinans } from '../context/FinansContext';
import toast from 'react-hot-toast';
import { FaUserCircle, FaLock, FaDatabase, FaBell, FaSlidersH, FaExclamationTriangle } from 'react-icons/fa';

// Adım 1'de oluşturduğumuz yeni bileşeni import ediyoruz
import AyarKarti from '../components/Ayarlar/AyarKarti';

// --- AYAR İÇERİK BİLEŞENLERİ ---
// Her bir bileşen artık AyarKarti ile sarmalanıyor.

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
    const [orijinalAd, setOrijinalAd] = useState(currentUser?.displayName || '');
    const [gorunenAd, setGorunenAd] = useState(currentUser?.displayName || '');
    const [loading, setLoading] = useState(false);
    const degisiklikVar = orijinalAd !== gorunenAd;

    const handleProfilGuncelle = async (e) => {
        e.preventDefault();
        if (!degisiklikVar) return;
        setLoading(true);
        try {
            await updateProfileName(gorunenAd);
            setOrijinalAd(gorunenAd);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <AyarKarti
            title="Profil Bilgileri"
            description="Görünen adınızı güncelleyebilir veya e-posta adresinizi görüntüleyebilirsiniz."
        >
            <form onSubmit={handleProfilGuncelle} className="ayar-formu">
                <div className="form-grup">
                    <label>E-posta Adresi</label>
                    <input type="email" value={currentUser?.email || ''} disabled />
                </div>
                <div className="form-grup">
                    <label htmlFor="gorunenAd">Görünen Ad</label>
                    <input id="gorunenAd" type="text" value={gorunenAd} onChange={(e) => setGorunenAd(e.target.value)} />
                </div>
                <button 
                    type="submit" 
                    className="primary-btn" 
                    disabled={!degisiklikVar || loading}
                >
                    {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </form>
        </AyarKarti>
    );
};

const BildirimAyarlari = () => {
    const { ayarlar, updateBildirimAyarlari } = useFinans();
    const handleBildirimDegisikligi = (ayarAdi, yeniDeger) => {
        const yeniAyarlar = { ...ayarlar.bildirimler, [ayarAdi]: yeniDeger };
        updateBildirimAyarlari(yeniAyarlar);
    };

    return (
        <AyarKarti
            title="Bildirim Ayarları"
            description="Hangi durumlarda e-posta ile bildirim almak istediğinizi seçin."
        >
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
        </AyarKarti>
    );
};

const Tercihler = () => {
    const { ayarlar, updateTercihler } = useFinans();
    const [seciliParaBirimi, setSeciliParaBirimi] = useState(ayarlar.tercihler.paraBirimi || 'TRY');

    const handleParaBirimiDegistir = (e) => {
        const yeniBirim = e.target.value;
        setSeciliParaBirimi(yeniBirim);
        const guncelTercihler = { ...ayarlar.tercihler, paraBirimi: yeniBirim };
        updateTercihler(guncelTercihler);
    };

    return (
        <AyarKarti
            title="Tercihler"
            description="Uygulamanın genel davranışını ve görünümünü kişiselleştirin."
        >
            <div className="ayar-formu">
                <div className="form-grup">
                    <label htmlFor="paraBirimi">Varsayılan Para Birimi</label>
                    <select id="paraBirimi" value={seciliParaBirimi} onChange={handleParaBirimiDegistir}>
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                    </select>
                </div>
            </div>
        </AyarKarti>
    );
};

const SifreDegistir = () => {
    const { reauthenticateAndChangePassword } = useAuth();
    const [mevcutSifre, setMevcutSifre] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');
    const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSifreGuncelle = async (e) => {
        e.preventDefault();
        if (!mevcutSifre) return toast.error("Güvenliğiniz için mevcut şifrenizi girmelisiniz.");
        if (yeniSifre.length < 6) return toast.error("Yeni şifre en az 6 karakter olmalıdır.");
        if (yeniSifre !== yeniSifreTekrar) return toast.error("Girdiğiniz yeni şifreler eşleşmiyor.");
        setLoading(true);
        try {
            await reauthenticateAndChangePassword(mevcutSifre, yeniSifre);
            setMevcutSifre('');
            setYeniSifre('');
            setYeniSifreTekrar('');
        } catch (error) { /* Hata AuthContext'te yönetiliyor */ } 
        finally { setLoading(false); }
    };

    return (
        <AyarKarti
            title="Şifre Değiştir"
            description="Güvenliğiniz için düzenli olarak şifrenizi değiştirmeniz önerilir."
        >
            <form onSubmit={handleSifreGuncelle} className="ayar-formu">
                <div className="form-grup">
                    <label htmlFor="mevcutSifre">Mevcut Şifre</label>
                    <input id="mevcutSifre" type="password" placeholder="Mevcut şifrenizi girin" value={mevcutSifre} onChange={(e) => setMevcutSifre(e.target.value)} required />
                </div>
                <div className="form-grup">
                    <label htmlFor="yeniSifre">Yeni Şifre</label>
                    <input id="yeniSifre" type="password" placeholder="Yeni şifrenizi girin" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} required />
                </div>
                <div className="form-grup">
                    <label htmlFor="yeniSifreTekrar">Yeni Şifre (Tekrar)</label>
                    <input id="yeniSifreTekrar" type="password" placeholder="Yeni şifrenizi tekrar girin" value={yeniSifreTekrar} onChange={(e) => setYeniSifreTekrar(e.target.value)} required />
                </div>
                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
            </form>
        </AyarKarti>
    );
};

const VeriGuvenlik = () => {
    const { deleteAccount } = useAuth();
    const handleHesapSil = () => {
        if(window.confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            deleteAccount().catch(err => toast.error(err.message));
        }
    };
    return (
        <AyarKarti title="Veri & Güvenlik">
            <div className="ayar-bolumu tehlikeli-bolge">
                <div className='tehlike-baslik'>
                    <FaExclamationTriangle />
                    <h4>Hesabı Kalıcı Olarak Sil</h4>
                </div>
                <p>Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak yok edilir.</p>
                <button onClick={handleHesapSil} className="danger-btn">Hesabımı Sil</button>
            </div>
        </AyarKarti>
    );
};

// --- ANA AYARLAR BİLEŞENİ ---
// Bu kısım neredeyse aynı, sadece render fonksiyonu sadeleşti.

const AYAR_SEKMELERI = {
    PROFIL: { id: 'PROFIL', label: 'Profil Bilgileri', component: ProfilBilgileri, icon: <FaUserCircle /> },
    TERCIHLER: { id: 'TERCIHLER', label: 'Tercihler', component: Tercihler, icon: <FaSlidersH /> },
    BILDIRIMLER: { id: 'BILDIRIMLER', label: 'Bildirimler', component: BildirimAyarlari, icon: <FaBell /> },
    SIFRE: { id: 'SIFRE', label: 'Şifre Değiştir', component: SifreDegistir, icon: <FaLock /> },
    VERI: { id: 'VERI', label: 'Veri & Güvenlik', component: VeriGuvenlik, icon: <FaDatabase /> }
};

function Ayarlar() {
    const [aktifSekme, setAktifSekme] = useState(AYAR_SEKMELERI.PROFIL.id);
    const AktifBilesen = AYAR_SEKMELERI[aktifSekme].component;

    return (
        <div className="sayfa-container ayarlar-sayfasi ayarlar-layout">
            <nav className="ayarlar-menu">
                    {Object.values(AYAR_SEKMELERI).map(sekme => (
                        <button 
                            key={sekme.id}
                            className={`ayar-menu-item ${aktifSekme === sekme.id ? 'aktif' : ''}`}
                            onClick={() => setAktifSekme(sekme.id)}
                        >
                            {sekme.icon}
                            <span>{sekme.label}</span>
                        </button>
                    ))}
                </nav>
                <main className="ayarlar-icerik">
                    <AktifBilesen />
                </main>
            </div>
    );
}

export default Ayarlar;