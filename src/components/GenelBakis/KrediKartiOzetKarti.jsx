// src/components/GenelBakis/KrediKartiOzetKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import { FaCreditCard } from 'react-icons/fa';

function KrediKartiOzetKarti() {
    const { krediKartiOzetleri } = useFinans();
    const { currentUser } = useAuth();

    if (!currentUser || !krediKartiOzetleri || krediKartiOzetleri.length === 0) {
        return null;
    }

    const rozetSinifi = (gun) => {
        if (gun < 0) return "kk-rozet gecmis";
        if (gun === 0) return "kk-rozet kritik";
        if (gun <= 3) return "kk-rozet yaklasan";
        if (gun <= 7) return "kk-rozet uyari";
        return "kk-rozet normal";
    };

    const rozetMetni = (gun) => {
        if (gun < 0) return "Vadesi Geçti";
        if (gun === 0) return "Bugün";
        if (gun === 1) return "1 gün kaldı";
        return `${gun} gün kaldı`;
    };

    return (
        <div className="card kk-ozet-karti">
            <div className="mini-kart-baslik">
                <FaCreditCard />
                <h3>Kredi Kartı Özetleri</h3>
            </div>

            <ul className="kk-ozet-listesi">
                {krediKartiOzetleri.map((kart) => (
                    <li key={kart.id} className="kk-ozet-item">
                        <div className="kk-ozet-sol">
                            <span className="kk-adi">{kart.ad}</span>
                            <span className="kk-son-odeme">
                                Son Ödeme: <strong>{kart.sonOdemeTarihi}</strong>
                            </span>
                        </div>

                        <div className="kk-ozet-sag">
                            <span className="kk-borc">
                                {formatCurrency(kart.guncelBorc)}
                            </span>

                            <span className={rozetSinifi(kart.kalanGun)}>
                                {rozetMetni(kart.kalanGun)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="kk-footer">
                <Link to="/ozellestir/kartlar" className="detay-link">
                    Kartları Yönet →
                </Link>
            </div>
        </div>
    );
}

export default KrediKartiOzetKarti;
