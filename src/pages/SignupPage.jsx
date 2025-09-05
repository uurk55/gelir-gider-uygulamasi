// src/pages/SignupPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return toast.error('Şifreler eşleşmiyor!');
        }

        try {
            setLoading(true);
            await signup(email, password);
            toast.success('Hesap başarıyla oluşturuldu!');
            navigate('/'); // Kayıt başarılıysa ana sayfaya yönlendir
        } catch (error) {
            toast.error('Hesap oluşturulamadı. Lütfen tekrar deneyin.');
            console.error("Kayıt hatası:", error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2 className="auth-title">Kayıt Ol</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-item-full">
                        <label>E-posta</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-item-full">
                        <label>Şifre</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-item-full">
                        <label>Şifre Tekrar</label>
                        <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
                    </div>
                    <button disabled={loading} type="submit" className="auth-button">
                        {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                    </button>
                </form>
                <div className="auth-switch">
                    Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;