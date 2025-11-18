// src/components/GenelBakis/AylikOzetKarti.jsx
import { useFinans } from "../../context/FinansContext";
import { formatCurrency } from "../../utils/formatters";
import { FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

const AY_ADLARI = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function AylikOzetKarti() {
  const {
    seciliAy,
    seciliYil,
    toplamGelir,
    toplamGider,
    karsilastirmaliAylikOzet,
  } = useFinans();

  const netDurum = toplamGelir - toplamGider;
  const ayAdi = AY_ADLARI[seciliAy] || "Bu Ay";

  const gelirDegisim = karsilastirmaliAylikOzet?.gelirDegisimYuzdesi ?? 0;
  const giderDegisim = karsilastirmaliAylikOzet?.giderDegisimYuzdesi ?? 0;

  const NetDurumRozet = () => {
    if (netDurum > 0)
      return <span className="rozet net-pozitif">Net Fazla</span>;
    if (netDurum < 0)
      return <span className="rozet net-negatif">Net Açık</span>;
    return <span className="rozet net-nötr">Başabaş</span>;
  };

  const DegisimEtiketi = ({ yuzde, tip }) => {
    if (!yuzde || yuzde === 0) {
      return (
        <span className="degisim etiketsiz">
          <FaMinus /> Geçen aya göre değişim yok
        </span>
      );
    }

    const pozitifMi = yuzde > 0;

    const ikon =
      tip === "gelir"
        ? pozitifMi
          ? <FaArrowUp />
          : <FaArrowDown />
        : // gider
          pozitifMi
          ? <FaArrowUp />
          : <FaArrowDown />;

    const sinif =
      tip === "gelir"
        ? pozitifMi
          ? "degisim-pozitif"
          : "degisim-negatif"
        : // gider
          pozitifMi
          ? "degisim-negatif"
          : "degisim-pozitif";

    return (
      <span className={`degisim ${sinif}`}>
        {ikon}
        % {Math.abs(yuzde).toFixed(0)} geçen aya göre
      </span>
    );
  };

  const yorumMetni = () => {
    if (netDurum > 0) {
      return "Harcamaların gelirinin altında kalıyor. Güzel gidiyorsun! 🎯";
    }
    if (netDurum < 0) {
      return "Bu ay harcamalar geliri geçmiş. Sonraki ay biraz frenlemek iyi olabilir.";
    }
    return "Bu ay gelir ve giderin neredeyse eşit. Küçük bir tasarruf bile fark yaratır.";
  };

  return (
    <div className="card aylik-ozet-karti">
      <div className="card-header aylik-ozet-baslik">
        <div>
          <h3>{ayAdi} Ayı Özeti</h3>
          <span className="aylik-ozet-alt-baslik">
            {seciliYil} yılı için aylık gelir & gider özeti
          </span>
        </div>
        <div className="net-durum-alani">
          <span className="net-durum-tutar">
            {formatCurrency(netDurum)}
          </span>
          <NetDurumRozet />
        </div>
      </div>

      <div className="aylik-ozet-icerik">
        <div className="aylik-ozet-metrik">
          <span className="metrik-etiket">Toplam Gelir</span>
          <span className="metrik-deger pozitif">
            {formatCurrency(toplamGelir)}
          </span>
          <DegisimEtiketi yuzde={gelirDegisim} tip="gelir" />
        </div>

        <div className="aylik-ozet-metrik">
          <span className="metrik-etiket">Toplam Gider</span>
          <span className="metrik-deger negatif">
            {formatCurrency(toplamGider)}
          </span>
          <DegisimEtiketi yuzde={giderDegisim} tip="gider" />
        </div>

        <div className="aylik-ozet-metrik">
          <span className="metrik-etiket">Aylık Durum</span>
          <span
            className={`metrik-deger ${
              netDurum > 0 ? "pozitif" : netDurum < 0 ? "negatif" : "notr"
            }`}
          >
            {formatCurrency(netDurum)}
          </span>
          <span className="degisim notr">Gelir – Gider farkı</span>
        </div>
      </div>

      <p className="aylik-ozet-yorum">{yorumMetni()}</p>
    </div>
  );
}

export default AylikOzetKarti;
