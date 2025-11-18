// src/components/Raporlar/GenelTrendRaporu.jsx
import { useFinans } from '../../context/FinansContext';
import { Line } from 'react-chartjs-2';
import AnalizKutusu from './AnalizKutusu';
import { formatCurrency } from '../../utils/formatters';

const GenelTrendRaporu = () => {
  const { trendVerisi, yillikRaporVerisi, seciliYil, trendAnalizi } = useFinans();

  const labels = trendVerisi?.labels || [];
  const gelirler = trendVerisi?.gelirler || [];
  const giderler = trendVerisi?.giderler || [];

  const aylikNetler = labels.map((_, i) => (gelirler[i] || 0) - (giderler[i] || 0));

  const toplamGelir = gelirler.reduce((acc, v) => acc + v, 0);
  const toplamGider = giderler.reduce((acc, v) => acc + v, 0);
  const toplamNet = toplamGelir - toplamGider;

  let enIyiAy = '-';
  let enIyiNet = 0;
  let enKotuAy = '-';
  let enKotuNet = 0;

  if (aylikNetler.length > 0) {
    const maxNet = Math.max(...aylikNetler);
    const minNet = Math.min(...aylikNetler);
    const maxIndex = aylikNetler.indexOf(maxNet);
    const minIndex = aylikNetler.indexOf(minNet);

    enIyiAy = labels[maxIndex] || '-';
    enIyiNet = maxNet;
    enKotuAy = labels[minIndex] || '-';
    enKotuNet = minNet;
  }

  const sonAyNet = aylikNetler[aylikNetler.length - 1] || 0;
  const oncekiAyNet = aylikNetler.length > 1 ? aylikNetler[aylikNetler.length - 2] : 0;
  const sonAyDegisim = sonAyNet - oncekiAyNet;
  const sonAyDegisimYuzde =
    oncekiAyNet !== 0 ? (sonAyDegisim / Math.abs(oncekiAyNet)) * 100 : null;

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Toplam Gelir',
        data: gelirler,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.15)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Toplam Gider',
        data: giderler,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: { usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#2f3542',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderRadius: 8,
        padding: 12,
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const index = items[0].dataIndex;
            const ay = labels[index];
            const net = aylikNetler[index] || 0;
            return `${ay} – Net: ${formatCurrency(net)}`;
          },
          label: (ctx) => {
            const datasetLabel = ctx.dataset.label || '';
            const value = ctx.parsed.y || 0;
            const dataArr = ctx.dataset.data || [];
            const index = ctx.dataIndex;

            let metin = `${datasetLabel}: ${formatCurrency(value)}`;

            if (index > 0 && dataArr[index - 1] != null) {
              const prev = dataArr[index - 1];
              const diff = value - prev;
              const yuzde =
                prev !== 0 ? ((diff / Math.abs(prev)) * 100).toFixed(1) : null;

              if (prev !== 0 && !Number.isNaN(yuzde)) {
                metin += ` (${diff >= 0 ? '+' : ''}${formatCurrency(diff)} / ${
                  diff >= 0 ? '+' : ''
                }${yuzde}% önceki aya göre)`;
              }
            }

            return metin;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' }
      }
    }
  };

  const hasTrendData = labels.length > 0;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2>Son 6 Aylık Finansal Trend</h2>
        </div>

        <div style={{ padding: '1rem 1.5rem 0', minHeight: '320px' }}>
          {hasTrendData ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <p style={{ padding: '1rem 0', color: 'var(--secondary-text)' }}>
              Seçili tarih aralığında gösterilecek veri bulunmuyor. Yeni gelir/gider
              işlemleri eklediğinde trend grafiği burada görünecek.
            </p>
          )}
        </div>

        {hasTrendData && (
          <div className="trend-mini-ozet-grid">
            <div className="trend-mini-ozet-item">
              <span className="ozet-etiket">Toplam Net Değişim</span>
              <span
                className={`ozet-deger ${
                  toplamNet >= 0 ? 'gelir-renk' : 'gider-renk'
                }`}
              >
                {formatCurrency(toplamNet)}
              </span>
              <span className="ozet-alt">Seçili dönem geneli</span>
            </div>

            <div className="trend-mini-ozet-item">
              <span className="ozet-etiket">En İyi Ay</span>
              <span className="ozet-deger">{enIyiAy}</span>
              <span
                className={`ozet-alt ${
                  enIyiNet >= 0 ? 'gelir-renk' : 'gider-renk'
                }`}
              >
                {formatCurrency(enIyiNet)}
              </span>
            </div>

            <div className="trend-mini-ozet-item">
              <span className="ozet-etiket">En Zor Ay</span>
              <span className="ozet-deger">{enKotuAy}</span>
              <span
                className={`ozet-alt ${
                  enKotuNet >= 0 ? 'gelir-renk' : 'gider-renk'
                }`}
              >
                {formatCurrency(enKotuNet)}
              </span>
            </div>

            <div className="trend-mini-ozet-item">
              <span className="ozet-etiket">Son Ay Net Değişim</span>
              <span
                className={`ozet-deger ${
                  sonAyNet >= 0 ? 'gelir-renk' : 'gider-renk'
                }`}
              >
                {formatCurrency(sonAyNet)}
              </span>
              <span className="ozet-alt">
                {oncekiAyNet === 0 || sonAyDegisimYuzde == null
                  ? 'Önceki ay ile kıyaslanamadı'
                  : `${sonAyDegisim >= 0 ? '+' : ''}${formatCurrency(
                      sonAyDegisim
                    )} / ${sonAyDegisimYuzde.toFixed(1)}% önceki aya göre`}
              </span>
            </div>
          </div>
        )}

        {/* Mevcut yeşil analiz kutun burada kalıyor */}
        <AnalizKutusu analiz={trendAnalizi} />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>{seciliYil} Yılı Özeti</h2>
        </div>
        <div className="tablo-container">
          <table>
            <thead>
              <tr>
                <th>Ay</th>
                <th>Toplam Gelir</th>
                <th>Toplam Gider</th>
                <th>Aylık Durum</th>
              </tr>
            </thead>
            <tbody>
              {yillikRaporVerisi.aylar.map((ayData) => (
                <tr key={ayData.ay}>
                  <td>{ayData.ay}</td>
                  <td className="gelir-renk">
                    {formatCurrency(ayData.gelir)}
                  </td>
                  <td className="gider-renk">
                    {formatCurrency(ayData.gider)}
                  </td>
                  <td
                    className={
                      ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'
                    }
                  >
                    {formatCurrency(ayData.bakiye)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="toplam-satiri">
                <td>Yıllık Toplam</td>
                <td>{formatCurrency(yillikRaporVerisi.toplamGelir)}</td>
                <td>{formatCurrency(yillikRaporVerisi.toplamGider)}</td>
                <td>{formatCurrency(yillikRaporVerisi.toplamBakiye)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default GenelTrendRaporu;
