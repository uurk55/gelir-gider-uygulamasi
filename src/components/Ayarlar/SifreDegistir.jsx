import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AyarKarti from './AyarKarti';

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

export default SifreDegistir;