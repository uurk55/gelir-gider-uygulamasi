// src/components/GenelBakis/HedefOzetKarti.jsx

import { useFinans } from "../../context/FinansContext";
import { Link } from "react-router-dom";
import { FaBullseye } from "react-icons/fa";
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatters";

function HedefOzetKarti() {
  const { onecelikliHedef } = useFinans();

  // Gösterilecek öncelikli hedef yoksa kartı render etme
  if (!onecelikliHedef) {
    return null;
  }

  const { ad, mevcutTutar = 0, hedefTutar = 0 } = onecelikliHedef;
  const ilerlemeYuzdesi =
    hedefTutar > 0 ? (mevcutTutar / hedefTutar) * 100 : 0;

  return (
    <div className="card hedef-ozet-karti">
      <div className="mini-kart-baslik">
        <FaBullseye />
        <h3>Öncelikli Hedefin</h3>
      </div>

      <div className="hedef-ozet-icerik">
        <div className="hedef-ust-satir">
          <span className="hedef-adi">{ad}</span>
          <span className="hedef-yuzde-rozet">
            %{ilerlemeYuzdesi.toFixed(1)}
          </span>
        </div>

        <div className="hedef-tutar-bilgisi">
          <span className="mevcut">
            {formatCurrency(mevcutTutar)}
          </span>
          <span className="hedef">
            {" "}
            / {formatCurrency(hedefTutar)}
          </span>
        </div>

        <div className="progress-bar-container">
          <motion.div
            className="progress-bar-dolu"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(ilerlemeYuzdesi, 100)}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>

        <div className="hedef-ozet-alt-bilgi">
          <span className="hedef-aciklama">
            Hedefine biraz daha yaklaştın. Böyle devam! 💪
          </span>
          <Link to="/hedefler" className="detay-link">
            Tüm hedefler →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HedefOzetKarti;
