// src/components/Raporlar/NakitAkisiRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import AnalizKutusu from './AnalizKutusu';
import { formatCurrency } from '../../utils/formatters';

const NakitAkisiRaporu = () => {
  const { nakitAkisiVerisi, nakitAkisiOzeti } = useFinans();

  const labels = nakitAkisiVerisi?.labels || [];
  const data = nakitAkisiVerisi?.netAkim || [];

  const hasData = labels.length > 0 && data.length > 0;

  // 🔹 Boş durum
  if (!hasData) {
    return (
      <>
        <div className="card">
          <div className="card-header">
            <h2>Son 6 Aylık Nakit Akışı</h2>
          </div>
          <div className="empty-state-container" style={{ padding: '2rem' }}>
            <p>Seçili tarih aralığında gösterilecek nakit akışı verisi bulunmuyor.</p>
            <Link to="/islemler" className="primary-btn-small" style={{ marginTop: '0.75rem' }}>
              İşlem Ekle
            </Link>
          </div>
        </div>

        {nakitAkisiOzeti && <AnalizKutusu analiz={nakitAkisiOzeti} />}
      </>
    );
  }

  // 🔹 Özet hesaplamalar
  const toplamNet = data.reduce((acc, v) => acc + v, 0);

  let bestAy = '-';
  let bestTutar = 0;
  let worstAy = '-';
  let worstTutar = 0;

  if (data.length > 0) {
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const maxIndex = data.indexOf(maxVal);
    const minIndex = data.indexOf(minVal);
    bestAy = labels[maxIndex];
    bestTutar = maxVal;
    worstAy = labels[minIndex];
    worstTutar = minVal;
  }

  const pozitifSayisi = data.filter((v) => v > 0).length;
  const negatifSayisi = data.filter((v) => v < 0).length;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Net Nakit Akışı',
        data,
        backgroundColor: data.map((v) =>
          v >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        ),
        borderColor: data.map((v) =>
          v >= 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'
        ),
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Son 6 Aylık Nakit Akışı',
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
            const v = ctx.parsed.y || 0;
            return formatCurrency(v);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.04)',
          borderDash: [4, 4],
        },
        ticks: {
          callback: (value) => formatCurrency(value),
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Son 6 Aylık Nakit Akışı</h2>
        </div>

        <div style={{ padding: '1rem 1.5rem', minHeight: '320px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Mini özet şeridi */}
        <div className="trend-mini-ozet-grid">
          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">Toplam Net Nakit Akışı</span>
            <span className={toplamNet >= 0 ? 'ozet-deger gelir-renk' : 'ozet-deger gider-renk'}>
              {formatCurrency(toplamNet)}
            </span>
            <span className="ozet-alt">Son 6 ayın toplam net sonucu</span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">En İyi Ay</span>
            <span className="ozet-deger">{bestAy}</span>
            <span className="ozet-alt gelir-renk">
              {formatCurrency(bestTutar)}
            </span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">En Zor Ay</span>
            <span className="ozet-deger">{worstAy}</span>
            <span className="ozet-alt gider-renk">
              {formatCurrency(worstTutar)}
            </span>
          </div>

          <div className="trend-mini-ozet-item">
            <span className="ozet-etiket">Pozitif / Negatif Ay</span>
            <span className="ozet-deger">
              {pozitifSayisi} / {negatifSayisi}
            </span>
            <span className="ozet-alt">Son 6 ayda nakit fazlası / açığı</span>
          </div>
        </div>
      </div>

      {nakitAkisiOzeti && <AnalizKutusu analiz={nakitAkisiOzeti} />}
    </>
  );
};

export default NakitAkisiRaporu;
