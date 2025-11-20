// src/components/GenelBakis/YaklasanOdemelerKarti.jsx  
import { useFinans } from "../../context/FinansContext";
import { formatCurrency } from "../../utils/formatters";
import { Link } from "react-router-dom";

function YaklasanOdemelerKarti() {
  const { yaklasanOdemeler } = useFinans();

  // 🔵 Toplam yaklaşan tutar
  const toplamYaklasanTutar = yaklasanOdemeler.reduce(
    (sum, o) => sum + (o.tutar || 0),
    0
  );

  const rozetSinifi = (kalanGun) => {
    if (kalanGun < 0) return "rozet-kritik";
    if (kalanGun === 0) return "rozet-kritik";
    if (kalanGun <= 3) return "rozet-yaklasan";
    if (kalanGun <= 7) return "rozet-uyari";
    return "rozet-normal";
  };

  const rozetMetni = (kalanGun) => {
    if (kalanGun < 0) return "Gecikti";
    if (kalanGun === 0) return "Bugün";
    if (kalanGun === 1) return "1 gün sonra";
    return `${kalanGun} gün sonra`;
  };

  return (
    <div className="card yaklasan-odemeler-karti">
      <div className="card-header">
        <h3>Yaklaşan Ödemeler</h3>
      </div>

      {/* Özet alanı */}
      <div className="yaklasan-odeme-ozet">
        <span>Toplam yaklaşan tutar:</span>
        <strong>{formatCurrency(toplamYaklasanTutar)}</strong>
      </div>

      <div className="yaklasan-odemeler-liste">
        {yaklasanOdemeler.length === 0 && (
          <p className="bos-mesaj">Yaklaşan ödeme bulunmuyor.</p>
        )}

        {yaklasanOdemeler.slice(0, 5).map((odeme) => (
          <div key={odeme.id} className="yaklasan-odeme-item">
            <div className="odeme-sol">
              <div className="odeme-aciklama">{odeme.aciklama}</div>
              <div className="odeme-tutar">
                {formatCurrency(odeme.tutar || 0)}
              </div>
            </div>

            <span className={`odeme-rozet ${rozetSinifi(odeme.kalanGun)}`}>
              {rozetMetni(odeme.kalanGun)}
            </span>
          </div>
        ))}
      </div>

      {/* Tüm Sabit Ödemeler butonu */}
      <div className="kart-alt-buton">
        <Link to="/sabit-odemeler" className="btn-primary-small">
          Tüm Sabit Ödemeleri Gör →
        </Link>
      </div>
    </div>
  );
}

export default YaklasanOdemelerKarti;
