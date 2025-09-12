// src/components/GenelBakis/KrediKartiOzetKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';

function KrediKartiOzetKarti() {
    const { krediKartiOzetleri } = useFinans();
    const { currentUser } = useAuth();

    // Eğer kullanıcı giriş yapmamışsa veya hiç kredi kartı eklememişse, kartı gösterme
    if (!currentUser || !krediKartiOzetleri || krediKartiOzetleri.length === 0) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2><FaCreditCard /> Kredi Kartı Özetleri</h2>
            </div>
            <ul className="kk-ozet-listesi">
                {krediKartiOzetleri.map(kart => (
                    <li key={kart.id} className="kk-ozet-item">
                        <div className="kk-ozet-sol">
                            <span className="kk-adi">{kart.ad}</span>
                            <span className="kk-son-odeme">Son Ödeme: {kart.sonOdemeTarihi}</span>
                        </div>
                        <div className="kk-ozet-sag">
                            <span className="kk-borc">{formatCurrency(kart.guncelBorc)}</span>
                            <span className={`kk-kalan-gun ${kart.kalanGun <= 7 ? 'uyari' : ''}`}>
                                {kart.kalanGun < 0 ? 'Vadesi Geçti' : `${kart.kalanGun} gün kaldı`}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default KrediKartiOzetKarti;