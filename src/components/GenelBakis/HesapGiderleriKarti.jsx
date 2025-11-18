// src/components/GenelBakis/HesapGiderleriKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { getAccountIcon } from '../../utils/iconMap';

// Boş durum bileşeni
function EmptyState() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <div className="empty-state-container">
        <p>Bu ay için hesap bazlı gider kaydı bulunmuyor.</p>
        <Link to="/islemler" className="primary-btn-small">
          Harcama Ekle
        </Link>
      </div>
    );
  }

  return (
    <div className="empty-state-container">
      <p>Hesap bazlı gider dağılımını görmek için giriş yapın.</p>
      <div className="empty-state-actions">
        <Link to="/login" className="primary-btn-small">
          Giriş Yap
        </Link>
        <Link to="/signup" className="secondary-btn-small">
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}

function HesapGiderleriKarti() {
  const { aylikHesapGiderleri } = useFinans();

  if (!aylikHesapGiderleri || aylikHesapGiderleri.length === 0) {
    return (
      <div className="card hesap-gider-karti">
        <div className="card-header">
          <h2>Aylık Gider Dağılımı (Hesaba Göre)</h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="card hesap-gider-karti">
      <div className="card-header">
        <h2>Aylık Gider Dağılımı (Hesaba Göre)</h2>
      </div>

      <div className="hesap-gider-listesi">
        {aylikHesapGiderleri.map((hesap) => {
          const yuzde = Number(hesap.giderYuzdesi) || 0;
          const barWidth = Math.max(0, Math.min(yuzde, 100));

          return (
            <div key={hesap.id} className="hesap-gider-satiri">
              <div className="hesap-gider-ust">
                <div className="hesap-adi-ikon">
                  <span className="hesap-ikon">{getAccountIcon(hesap.ad)}</span>
                  <span className="hesap-adi">{hesap.ad}</span>
                </div>

                <span className="hesap-aylik-gider">
                  -{formatCurrency(hesap.aylikGider || 0)}
                </span>
              </div>

              <div className="hesap-gider-alt">
                <span className="hesap-gider-yuzdesi">
                  Toplam giderin %{yuzde.toFixed(1)}’i
                </span>
                <div className="progress-bar-konteyner">
                  <div
                    className="hesap-progress-bar-dolgu"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HesapGiderleriKarti;
