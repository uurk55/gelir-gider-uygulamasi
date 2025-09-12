// src/pages/Raporlar.jsx (YENİ TARİH SEÇİCİLİ NİHAİ VERSİYON)

import { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useFinans } from '../context/FinansContext';
import { formatCurrency } from '../utils/formatters';
import { FaDownload } from 'react-icons/fa';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { tr } from 'date-fns/locale';
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear } from 'date-fns';

const predefinedRanges = [
    { label: 'Bugün', range: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Dün', range: () => ({ startDate: startOfDay(addDays(new Date(), -1)), endDate: endOfDay(addDays(new Date(), -1)) }) },
    { label: 'Bu Hafta', range: () => ({ startDate: startOfWeek(new Date(), { locale: tr }), endDate: endOfWeek(new Date(), { locale: tr }) }) },
    { label: 'Bu Ay', range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
    { label: 'Bu Yıl', range: () => ({ startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) }) },
    { label: 'Önceki Ay', range: () => ({ startDate: startOfMonth(addDays(startOfMonth(new Date()), -1)), endDate: endOfMonth(addDays(startOfMonth(new Date()), -1)) }) }
];

function Raporlar() {
  const { 
      trendVerisi, yillikRaporVerisi, handleVeriIndir,
      tarihAraligi, setTarihAraligi, // Context'ten bunları çekiyoruz
      seciliYil // Yıllık özet için hala buna ihtiyacımız var
  } = useFinans();

  useEffect(() => {
    // Raporlar sayfası her açıldığında, tarih aralığını bu yıla ayarla
    const bugun = new Date();
    setTarihAraligi([{
        startDate: startOfYear(bugun),
        endDate: endOfYear(bugun),
        key: 'selection'
    }]);
  }, [setTarihAraligi]);

  if (!trendVerisi || !yillikRaporVerisi) {
      return <div>Yükleniyor...</div>;
  }

  const trendGrafikVerisi = {
    labels: trendVerisi.labels,
    datasets: [
      {
        label: 'Toplam Gelir',
        data: trendVerisi.gelirler,
        borderColor: 'rgba(39, 174, 96, 1)',
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Toplam Gider',
        data: trendVerisi.giderler,
        borderColor: 'rgba(192, 57, 43, 1)',
        backgroundColor: 'rgba(192, 57, 43, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const trendGrafikOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Son 6 Aylık Finansal Trend',
        font: { size: 18, family: 'Roboto', weight: '600' },
        color: 'var(--primary-text)',
        padding: { bottom: 20 }
      },
      tooltip: {
         callbacks: {
            label: function(context) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
         }
      }
    },
    scales: {
      y: { 
          beginAtZero: true,
          ticks: {
             callback: function(value) {
                if (value >= 1000) {
                    return `${value / 1000}k ₺`;
                }
                return formatCurrency(value);
             }
          }
      },
    }
  };

  return (
    <div className="raporlar-sayfasi">
        <div className="card">
            <DateRangePicker
                onChange={item => setTarihAraligi([item.selection])}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={tarihAraligi}
                direction="horizontal"
                locale={tr}
                className="sabit-takvim-ust"
                staticRanges={predefinedRanges.map(range => ({ ...range, isSelected() { return false; } }))}
                inputRanges={[]}
            />
        </div>

        <div className="card">
            <div className="card-header">
               <h2>Rapor Araçları</h2>
            </div>
            <p style={{margin: '0 0 1rem 0', color: 'var(--secondary-text)'}}>Tüm işlem verilerinizi CSV formatında bilgisayarınıza indirebilirsiniz.</p>
            <button onClick={handleVeriIndir} className="primary-btn">
              <FaDownload />
              Tüm Verileri İndir (CSV)
            </button>
        </div>

        <div className="card">
            <div style={{ height: '400px', position: 'relative' }}>
              <Line options={trendGrafikOptions} data={trendGrafikVerisi} />
            </div>
        </div>

      {yillikRaporVerisi.aylar.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <h2>{seciliYil} Yılı Özeti</h2>
          </div>
          <table className="yillik-rapor-tablosu">
            <thead>
              <tr>
                <th>Ay</th>
                <th style={{textAlign: 'right'}}>Toplam Gelir</th>
                <th style={{textAlign: 'right'}}>Toplam Gider</th>
                <th style={{textAlign: 'right'}}>Aylık Durum</th>
              </tr>
            </thead>
            <tbody>
              {yillikRaporVerisi.aylar.map(ayData => (
                <tr key={ayData.ay}>
                  <td>{ayData.ay}</td>
                  <td className="gelir-renk">{formatCurrency(ayData.gelir)}</td>
                  <td className="gider-renk">{formatCurrency(ayData.gider)}</td>
                  <td className={ayData.bakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    {formatCurrency(ayData.bakiye)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Yıllık Toplam</strong></td>
                <td><strong>{formatCurrency(yillikRaporVerisi.toplamGelir)}</strong></td>
                <td><strong>{formatCurrency(yillikRaporVerisi.toplamGider)}</strong></td>
                <td className={yillikRaporVerisi.toplamBakiye >= 0 ? 'gelir-renk' : 'gider-renk'}>
                    <strong>{formatCurrency(yillikRaporVerisi.toplamBakiye)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card" style={{textAlign: 'center', color: 'var(--secondary-text)'}}>
          <p>{seciliYil} yılında gösterilecek veri bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}

export default Raporlar;