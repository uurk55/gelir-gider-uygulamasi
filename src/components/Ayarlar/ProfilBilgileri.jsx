import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AyarKarti from './AyarKarti';

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

export default ProfilBilgileri;