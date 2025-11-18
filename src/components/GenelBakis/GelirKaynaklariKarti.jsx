// src/components/GenelBakis/GelirKaynaklariKarti.jsx

import { Bar } from "react-chartjs-2";
import { useFinans } from "../../context/FinansContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";

// Boş durum bileşeni
function EmptyState() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return (
      <div className="empty-state-container">
        <p>Bu ay için gösterilecek gelir verisi bulunmuyor.</p>
        <Link to="/islemler" className="primary-btn-small">
          İlk gelirini ekle
        </Link>
      </div>
    );
  }

  return (
    <div className="empty-state-container">
      <p>Gelir kaynaklarını grafikle görmek için giriş yap veya kayıt ol.</p>
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

function GelirKaynaklariKarti() {
  const {
    gelirGrafikVerisi,
    filtrelenmisGelirler = [],
    seciliYil,
    seciliAy,
    toplamGelir,
  } = useFinans();

  const ayAdi = new Date(seciliYil, seciliAy - 1, 1).toLocaleString("tr-TR", {
    month: "long",
  });

  const gelirGrafikOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "#2f3542",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderRadius: 8,
        padding: 10,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.x !== null) {
              label += formatCurrency(context.parsed.x);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#dfe4ea", borderDash: [5, 5] },
        ticks: {
          color: "#576574",
          font: { family: "'Roboto', sans-serif" },
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#2f3542",
          font: { family: "'Roboto', sans-serif", size: 13 },
        },
      },
    },
  };

  return (
    <div className="card gelir-kaynaklari-karti">
      <div className="card-header gelir-header">
        <div>
          <h3>{ayAdi} Ayı Gelir Kaynakları</h3>
          <p className="card-subtitle">
            Toplam gelir:{" "}
            <strong>{formatCurrency(toplamGelir || 0)}</strong>
          </p>
        </div>
      </div>

      {filtrelenmisGelirler.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="gelir-grafik-konteyner">
          <Bar options={gelirGrafikOptions} data={gelirGrafikVerisi} />
        </div>
      )}
    </div>
  );
}

export default GelirKaynaklariKarti;
