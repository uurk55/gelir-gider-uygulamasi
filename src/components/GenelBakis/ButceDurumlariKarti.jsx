// src/components/GenelBakis/ButceDurumlariKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { formatCurrency } from '../../utils/formatters';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function ButceDurumlariKarti() {
  const { butceDurumlari } = useFinans();

  if (!butceDurumlari || butceDurumlari.length === 0) {
    return (
      <div className="card butce-durum-karti">
        <div className="card-header">
          <h2>Aylık Kategori Limitleri</h2>
        </div>
        <div className="empty-state-container mini-kart-empty" style={{ padding: '1rem' }}>
          <p>Henüz bir bütçe oluşturmadınız.</p>
          <Link to="/butceler" className="primary-btn-small">
            Bütçe Oluştur
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card butce-durum-karti">
      <div className="card-header">
        <h2>Aylık Kategori Limitleri</h2>
      </div>

      <ul className="butce-listesi">
        {butceDurumlari.map((butce) => {
          const yuzdeRaw = Number(butce.yuzdeRaw) || 0;
          const yuzdeSafe = Math.max(0, Math.min(Number(butce.yuzde) || 0, 130)); // biraz over-limit gösterebilsin
          const kalanPozitif = butce.kalan >= 0;

          return (
            <li key={butce.id} className="butce-item">
              <div className="butce-item-header">
                <span className="kategori-adi">{butce.kategori}</span>
                <span className={`yuzde-gosterge ${butce.durum}`}>
                  (%{Math.round(yuzdeRaw)})
                </span>
              </div>

              <div className="progress-bar-container">
                <div
                  className={`progress-bar-dolu ${butce.durum}`}
                  style={{ width: `${yuzdeSafe}%` }}
                />
              </div>

              <div className="butce-item-footer">
                <span className="harcanan-tutar">
                  {formatCurrency(butce.harcanan)} / {formatCurrency(butce.limit)}
                </span>
                <span className={`kalan-tutar ${kalanPozitif ? '' : 'negatif'}`}>
                  {kalanPozitif
                    ? `${formatCurrency(butce.kalan)} kaldı`
                    : `${formatCurrency(Math.abs(butce.kalan))} aşıldı`}
                </span>
              </div>

              {butce.tahminiAsim > 0 && (
                <div className="tahmin-uyari-kutusu">
                  <FaExclamationTriangle className="uyari-ikonu" />
                  <span className="uyari-metni">
                    Tahmin: Bu gidişle bütçeyi ~{formatCurrency(butce.tahminiAsim)} aşacaksınız.
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ButceDurumlariKarti;
