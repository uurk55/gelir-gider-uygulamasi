// src/components/GenelBakis/YaklasanOdemelerKarti.jsx 
import { useFinans } from "../../context/FinansContext";
import { formatCurrency } from "../../utils/formatters";

function YaklasanOdemelerKarti() {
  const { yaklasanOdemeler } = useFinans();

  // 🔵 YENİ: Toplam yaklaşan tutar
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

      {/* 🔵 YENİ EKLENDİ: Özet alanı */}
      <div className="yaklasan-odeme-ozet">
        <span>Toplam yaklaşan tutar:</span>
        <strong>{formatCurrency(toplamYaklasanTutar)}</strong>
      </div>

      <div className="yaklasan-odemeler-liste">
        {yaklasanOdemeler.length === 0 && (
          <p className="bos-mesaj">Yaklaşan ödeme bulunmuyor.</p>
        )}

        {yaklasanOdemeler.map((odeme) => (
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
    </div>
  );
}

export default YaklasanOdemelerKarti;
