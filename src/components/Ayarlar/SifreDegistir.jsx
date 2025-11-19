// src/components/Ayarlar/SifreDegistir.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AyarKarti from './AyarKarti';
import { FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';

const SifreDegistir = () => {
    const { reauthenticateAndChangePassword } = useAuth();

    const [mevcutSifre, setMevcutSifre] = useState('');
    const [yeniSifre, setYeniSifre] = useState('');
    const [yeniTekrar, setYeniTekrar] = useState('');
    const [loading, setLoading] = useState(false);

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showRepeat, setShowRepeat] = useState(false);

    /* --- ŞİFRE GÜÇLÜ MÜ? --- */
    const sifreGucu = (() => {
        if (yeniSifre.length === 0) return 0;
        let puan = 0;
        if (yeniSifre.length >= 6) puan++;
        if (/[A-Z]/.test(yeniSifre)) puan++;
        if (/[0-9]/.test(yeniSifre)) puan++;
        if (/[^A-Za-z0-9]/.test(yeniSifre)) puan++;
        return puan;
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mevcutSifre.trim())
            return toast.error("Mevcut şifrenizi girmelisiniz.");

        if (yeniSifre.length < 6)
            return toast.error("Yeni şifre en az 6 karakter olmalıdır.");

        if (yeniSifre !== yeniTekrar)
            return toast.error("Yeni şifreler birbiriyle eşleşmiyor.");

        setLoading(true);

        try {
            await reauthenticateAndChangePassword(mevcutSifre, yeniSifre);

            toast.success("Şifre başarıyla güncellendi!");

            setMevcutSifre('');
            setYeniSifre('');
            setYeniTekrar('');
        } catch (err) {
            toast.error(err.message || "Şifre güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AyarKarti
            title="Şifre Değiştir"
            description="Güvenliğiniz için düzenli olarak şifrenizi güncellemeniz önerilir."
        >
            <form onSubmit={handleSubmit} className="ayar-formu">

                {/* === Mevcut Şifre === */}
                <div className="form-grup">
                    <label>Mevcut Şifre</label>
                    <div className="input-with-icon">
                        <input
                            type={showOld ? "text" : "password"}
                            placeholder="Mevcut şifrenizi girin"
                            value={mevcutSifre}
                            onChange={(e) => setMevcutSifre(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowOld(!showOld)}>
                            {showOld ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                {/* === Yeni Şifre === */}
                <div className="form-grup">
                    <label>Yeni Şifre</label>
                    <div className="input-with-icon">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="Yeni şifrenizi girin"
                            value={yeniSifre}
                            onChange={(e) => setYeniSifre(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)}>
                            {showNew ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {/* Şifre Güç Çubuğu */}
                    {yeniSifre.length > 0 && (
                        <div className="password-strength">
                            <div className={`bar ${sifreGucu >= 1 ? 'active' : ''}`}></div>
                            <div className={`bar ${sifreGucu >= 2 ? 'active' : ''}`}></div>
                            <div className={`bar ${sifreGucu >= 3 ? 'active' : ''}`}></div>
                            <div className={`bar ${sifreGucu >= 4 ? 'active' : ''}`}></div>
                        </div>
                    )}
                </div>

                {/* === Yeni Şifre Tekrar === */}
                <div className="form-grup">
                    <label>Yeni Şifre (Tekrar)</label>
                    <div className="input-with-icon">
                        <input
                            type={showRepeat ? "text" : "password"}
                            placeholder="Yeni şifreyi tekrar girin"
                            value={yeniTekrar}
                            onChange={(e) => setYeniTekrar(e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowRepeat(!showRepeat)}>
                            {showRepeat ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </button>
            </form>

            {/* Güvenlik önerisi kutusu */}
            <div className="security-tip">
                <FaShieldAlt className="s-icon" />
                <p>
                    Daha güçlü bir şifre için büyük/küçük harf, rakam ve sembol
                    kombinasyonları kullanmanız önerilir.
                </p>
            </div>
        </AyarKarti>
    );
};

export default SifreDegistir;
