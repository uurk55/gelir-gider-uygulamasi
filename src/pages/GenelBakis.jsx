// src/pages/GenelBakis.jsx
import { useFinans } from "../context/FinansContext";
import AylikOzetKarti from "../components/GenelBakis/AylikOzetKarti";
import HarcamaDagilimiKarti from "../components/GenelBakis/HarcamaDagilimiKarti";
import GelirKaynaklariKarti from "../components/GenelBakis/GelirKaynaklariKarti";
import HedefOzetKarti from "../components/GenelBakis/HedefOzetKarti";
import KrediKartiOzetKarti from "../components/GenelBakis/KrediKartiOzetKarti";
import HesapGiderleriKarti from "../components/GenelBakis/HesapGiderleriKarti";
import ButceDurumlariKarti from "../components/GenelBakis/ButceDurumlariKarti";
import FinansalSaglikKarti from "../components/GenelBakis/FinansalSaglikKarti";
import YaklasanOdemelerKarti from "../components/GenelBakis/YaklasanOdemelerKarti";
import GenelVarlikKarti from "../components/GenelBakis/GenelVarlikKarti";

// Eski sevdiğin tarih bileşeni
import TarihSecici from "../components/TarihSecici";

function GenelBakis() {
  const {
    seciliAy,
    seciliYil,
    toplamBakiye,
    toplamGelir,
    toplamGider,
  } = useFinans();

  const ayIsimleri = [
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

  const aktifAyAdi = ayIsimleri[(seciliAy || 1) - 1] || "";
  const netDurumEtiketi = toplamBakiye >= 0 ? "Net Varlık" : "Net Borç";

  return (
    <div className="sayfa-icerik genel-bakis-sayfasi">
      {/* HOŞ GELDİN ALANI */}
      <section className="hosgeldin-alani">
        <div className="hosgeldin-sol">
          <div className="hosgeldin-ikon-kapsayici">
            <span className="hosgeldin-ikon" aria-hidden="true">
              💸
            </span>
          </div>

          <div className="hosgeldin-metinler">
            <h1 className="hosgeldin-baslik">Hoş geldin, Uur K. 👋</h1>
            <p className="hosgeldin-alt">
              {aktifAyAdi} {seciliYil} finansal görünümün hazır.
            </p>

            {/* Küçük özet chip'ler */}
            <div className="hosgeldin-pill-row">
              <span className="hosgeldin-pill hosgeldin-pill-net">
                <span className="pill-label">{netDurumEtiketi}</span>
                <span className="pill-value">
                  {Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                    maximumFractionDigits: 0,
                  }).format(toplamBakiye || 0)}
                </span>
              </span>

              {typeof toplamGelir === "number" && (
                <span className="hosgeldin-pill">
                  <span className="pill-label">Bu Ay Gelir</span>
                  <span className="pill-value">
                    {Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                      maximumFractionDigits: 0,
                    }).format(toplamGelir || 0)}
                  </span>
                </span>
              )}

              {typeof toplamGider === "number" && (
                <span className="hosgeldin-pill">
                  <span className="pill-label">Bu Ay Gider</span>
                  <span className="pill-value negatif">
                    {Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                      maximumFractionDigits: 0,
                    }).format(toplamGider || 0)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hosgeldin-sag">
          {/* Eski güzel TarihSecici geri geldi */}
          <TarihSecici />
        </div>
      </section>

      {/* ANA 2 SÜTUNLU GRID */}
      <section className="genelbakis-main-grid">
        {/* SOL GENİŞ KOLON */}
        <div className="genelbakis-sol-kolon">
          {/* Aylık Özet */}
          <AylikOzetKarti />

          {/* Harcama Dağılımı + Gelir Kaynakları */}
          <div className="genelbakis-sol-iki-grid">
            <HarcamaDagilimiKarti />
            <GelirKaynaklariKarti />
          </div>

          {/* Bütçe Durumları */}
          <ButceDurumlariKarti />

          {/* Hesap / Varlık bazlı giderler */}
          <HesapGiderleriKarti />
        </div>

        {/* SAĞ DAR KOLON (YAN PANEL) */}
        <aside className="genelbakis-sag-kolon">
          <GenelVarlikKarti />
          <FinansalSaglikKarti />
          <HedefOzetKarti />
          <YaklasanOdemelerKarti />
          <KrediKartiOzetKarti />
        </aside>
      </section>
    </div>
  );
}

export default GenelBakis;
