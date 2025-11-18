// src/components/GenelBakis/GenelVarlikKarti.jsx
import { useFinans } from "../../context/FinansContext";
import { formatCurrency } from "../../utils/formatters";
import { FaCoins } from "react-icons/fa";

function GenelVarlikKarti() {
  const { toplamBakiye, toplamGelir, toplamGider } = useFinans();

  const aylikNetDegisim = (toplamGelir || 0) - (toplamGider || 0);
  const netPozitifMi = aylikNetDegisim >= 0;
  const durumEtiketi = netPozitifMi ? "Net Fazla" : "Net Açık";

  return (
    <div className="card genel-varlik-karti">
      <div className="mini-kart-baslik genel-varlik-baslik">
        <div className="genel-varlik-ikon-kapsayici">
          <FaCoins />
        </div>

        <div className="genel-varlik-baslik-metin">
          <h3>Genel Varlık Durumu</h3>
          <span className="genel-varlik-aciklama">
            Tüm hesaplarının toplam bakiyesi
          </span>
        </div>

        <span
          className={`genel-varlik-rozet ${
            netPozitifMi ? "pozitif" : "negatif"
          }`}
        >
          {durumEtiketi}
        </span>
      </div>

      <div className="genel-varlik-icerik">
        <div className="varlik-tutar-blok">
          <span className="varlik-label">Toplam Varlık</span>
          <div className="varlik-ana-tutar">
            {formatCurrency(toplamBakiye || 0)}
          </div>
        </div>

        <div className="varlik-alt-satir">
          <span className="varlik-aylik-label">Bu ayki net değişim</span>
          <span
            className={`varlik-aylik-net ${
              netPozitifMi ? "pozitif" : "negatif"
            }`}
          >
            {formatCurrency(aylikNetDegisim || 0)}
          </span>
        </div>

        <p className="genel-varlik-not">
          Kart, banka ve nakit hesaplarının genel görünümü.
        </p>
      </div>
    </div>
  );
}

export default GenelVarlikKarti;
