// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            toast.success('Başarıyla giriş yapıldı!');
            navigate('/'); // Giriş başarılıysa ana sayfaya yönlendir
        } catch (error) {
            toast.error('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
            console.error("Giriş hatası:", error);
        }
        setLoading(false);
    };

    return (
    <div className="auth-container">
        <div className="card auth-card">
            
            {/* YENİ: Marka Başlığı */}
            <div className="auth-header">
                <h1 className="auth-logo">FinansTakip</h1>
                <p className="auth-subtitle">Hesabınıza giriş yaparak bütçenizi yönetmeye devam edin.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-item-full">
                    <label>E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="ornek@mail.com"
                    />
                </div>
                <div className="form-item-full">
                    <label>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <button disabled={loading} type="submit" className="auth-button">
                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
            <div className="auth-switch">
                Hesabın yok mu? <Link to="/signup">Kayıt Ol</Link>
            </div>
        </div>
    </div>
);
}
export default LoginPage;