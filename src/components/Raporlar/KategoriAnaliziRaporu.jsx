// src/components/Raporlar/KategoriAnaliziRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { Bar } from 'react-chartjs-2';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

function KategoriAnaliziRaporu() {
  const {
    kategoriHarcamaOzeti,
    kategoriRenkleri,
    setBirlesikFiltreKategori,
    setBirlesikFiltreTip,
  } = useFinans();

  const navigate = useNavigate();

  const hasData =
    kategoriHarcamaOzeti &&
    Object.keys(kategoriHarcamaOzeti).length > 0;

  // 🔹 Veri yoksa: akıllı boş durum kartı
  if (!hasData) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Kategori Analizi</h2>
        </div>
        <div className="empty-state-container" style={{ padding: '2rem' }}>
          <p>Seçili tarih aralığında gösterilecek kategori harcaması bulunmuyor.</p>
          <Link to="/islemler" className="primary-btn-small" style={{ marginTop: '0.75rem' }}>
            İşlem Ekle
          </Link>
        </div>
      </div>
    );
  }

  // 🔹 Veriyi tutarlı şekilde sıralıyoruz (yüksekten düşüğe)
  const entries = Object.entries(kategoriHarcamaOzeti).sort(
    ([_a, tutarA], [_b, tutarB]) => tutarB - tutarA
  );

  const labels = entries.map(([kategori]) => kategori);
  const values = entries.map(([, tutar]) => tutar);

  const toplamHarcama = values.reduce((acc, v) => acc + v, 0);

  const enBuyuk = entries[0];
  const enKucuk = entries[entries.length - 1];

  const top3Toplam = entries
    .slice(0, 3)
    .reduce((acc, [, tutar]) => acc + tutar, 0);
  const top3Yuzde = toplamHarcama
    ? (top3Toplam / toplamHarcama) * 100
    : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Kategoriye Göre Harcama',
        data: values,
        backgroundColor: labels.map(
          (kategori) => kategoriRenkleri[kategori] || '#cccccc'
        ),
        borderColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 22,
        maxBarThickness: 26,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      // 🔹 Bara tıklayınca İşlemler sayfasına, o kategori filtresiyle git
      if (!elements || elements.length === 0) return;
      const barIndex = elements[0].index;
      const kategori = labels[barIndex];

      setBirlesikFiltreKategori(kategori);
      setBirlesikFiltreTip('gider');
      navigate('/islemler');
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Seçili Tarih Aralığındaki Kategori Harcamaları',
        font: { size: 16 },
      },
      tooltip: {
        backgroundColor: '#2f3542',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.x || 0;
            const yuzde = toplamHarcama
              ? ((value / toplamHarcama) * 100).toFixed(1)
              : 0;
            return `${formatCurrency(value)} (${yuzde}% toplam harcama)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.04)',
          borderDash: [4, 4],
        },
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
      y: {
        grid: { display: false },
      },
    },
  };

  return (
    <>
      {/* 1. Kart: Grafik + mini özet */}
      <div className="card">
        <div className="card-header">
          <h2>Kategori Analizi</h2>
        </div>

        <div style={{ padding: '1rem 1.5rem 0', minHeight: '320px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Mini özet şeridi – Genel Trend sayfasındaki stile yakın */}
        <div className="trend-mini-ozet-grid kategori-ozet-grid">
          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">Toplam Harcama</span>
            <span className="ozet-deger gider-renk">
              {formatCurrency(toplamHarcama)}
            </span>
            <span className="ozet-alt">
              Seçili tarih aralığındaki toplam gider
            </span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">En Çok Harcama</span>
            <span className="ozet-deger">
              {enBuyuk?.[0] || '-'}
            </span>
            <span className="ozet-alt gider-renk">
              {formatCurrency(enBuyuk?.[1] || 0)}
            </span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">En Az Harcama</span>
            <span className="ozet-deger">
              {enKucuk?.[0] || '-'}
            </span>
            <span className="ozet-alt">
              {formatCurrency(enKucuk?.[1] || 0)}
            </span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">İlk 3 Kategorinin Payı</span>
            <span className="ozet-deger">
              %{top3Yuzde.toFixed(1)}
            </span>
            <span className="ozet-alt">
              Harcamanın ne kadarı 3 ana kategoriye yoğunlaşmış
            </span>
          </div>
        </div>
      </div>

      {/* 2. Kart: Tablo detayı */}
      <div className="card">
        <div className="card-header">
          <h2>Kategori Bazlı Detay</h2>
        </div>
        <div className="tablo-container">
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Toplam Harcama</th>
                <th>Toplam İçindeki Payı</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([kategori, tutar]) => {
                const yuzde = toplamHarcama
                  ? (tutar / toplamHarcama) * 100
                  : 0;
                return (
                  <tr key={kategori}>
                    <td>{kategori}</td>
                    <td className="gider-renk">
                      {formatCurrency(tutar)}
                    </td>
                    <td>%{yuzde.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default KategoriAnaliziRaporu;
