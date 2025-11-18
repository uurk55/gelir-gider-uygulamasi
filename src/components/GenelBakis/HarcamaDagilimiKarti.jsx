// src/components/GenelBakis/HarcamaDagilimiKarti.jsx

import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { useFinans } from "../../context/FinansContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/formatters";

// Boş durum bileşeni
function EmptyState() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <div className="empty-state-container">
        <p>Bu ay için gösterilecek harcama verisi bulunmuyor.</p>
        <Link to="/islemler" className="primary-btn-small">
          İlk harcamanı ekle
        </Link>
      </div>
    );
  }

  return (
    <div className="empty-state-container">
      <p>Harcama dağılımını görmek için giriş yap ya da hesap oluştur.</p>
      <div className="empty-state-actions">
        <Link to="/login" className="primary-btn-small">
          Giriş yap
        </Link>
        <Link to="/signup" className="secondary-btn-small">
          Kayıt ol
        </Link>
      </div>
    </div>
  );
}

function HarcamaDagilimiKarti() {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const {
    seciliYil,
    seciliAy,
    grafikVerisi,
    kategoriOzeti,
    kategoriRenkleri,
    toplamGider,
    setBirlesikFiltreKategori,
    setBirlesikFiltreTip,
    filtrelenmisGiderler = [],
  } = useFinans();

  const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString("tr-TR", {
    month: "long",
  });

  // Pasta grafiği tıklanınca İşlemler sayfasına ilgili kategori ile git
  const handleGrafikTiklama = (event, elements) => {
    if (!elements || elements.length === 0) return;

    const tiklananIndex = elements[0].index;
    const tiklananKategori = grafikVerisi.labels[tiklananIndex];

    setBirlesikFiltreKategori(tiklananKategori);
    setBirlesikFiltreTip("gider");
    navigate("/islemler");
  };

  // Hover olduğunda ilgili slice'ı dışarı çıkar
  const interactiveGrafikVerisi = useMemo(() => {
    if (!grafikVerisi.labels) return grafikVerisi;

    const hoverIndex = hoveredCategory
      ? grafikVerisi.labels.indexOf(hoveredCategory)
      : -1;

    return {
      ...grafikVerisi,
      datasets: grafikVerisi.datasets.map((dataset) => ({
        ...dataset,
        offset: grafikVerisi.labels.map((_, index) =>
          index === hoverIndex ? 20 : 0
        ),
        borderWidth: grafikVerisi.labels.map((_, index) =>
          index === hoverIndex ? 3 : 2
        ),
      })),
    };
  }, [hoveredCategory, grafikVerisi]);

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleGrafikTiklama,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#2f3542",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderRadius: 8,
        padding: 10,
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw;
            const total = tooltipItem.chart.getDatasetMeta(0).total;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="card harcama-dagilimi-karti">
      <div className="card-header harcama-header">
        <div>
          <h3>{ayAdi} Ayı Harcama Dağılımı</h3>
          <p className="card-subtitle">
            Toplam gider: <strong>{formatCurrency(toplamGider || 0)}</strong>
          </p>
        </div>
      </div>

      {filtrelenmisGiderler.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="analiz-icerik">
          <div className="ozet-tablosu">
            <ul className="harcama-listesi">
              {Object.entries(kategoriOzeti)
                .sort(([, a], [, b]) => b - a)
                .map(([kategori, tutar]) => {
                  const yuzde =
                    toplamGider > 0
                      ? ((tutar / toplamGider) * 100).toFixed(1)
                      : 0;

                  return (
                    <li
                      key={kategori}
                      className="harcama-list-item"
                      onMouseEnter={() => setHoveredCategory(kategori)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="kategori-sol-taraf">
                        <span
                          className="renk-noktasi"
                          style={{
                            backgroundColor:
                              kategoriRenkleri[kategori] || "#CCCCCC",
                          }}
                        ></span>
                        <div className="kategori-detay">
                          <span className="kategori-adi">{kategori}</span>
                          <span className="kategori-yuzdesi">% {yuzde}</span>
                        </div>
                      </div>
                      <span className="kategori-tutari">
                        {formatCurrency(tutar)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="grafik-konteyner">
            <Pie data={interactiveGrafikVerisi} options={pieChartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}

export default HarcamaDagilimiKarti;
