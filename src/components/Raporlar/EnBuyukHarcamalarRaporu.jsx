// src/components/Raporlar/EnBuyukHarcamalarRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

function EnBuyukHarcamalarRaporu() {
  const { enBuyukHarcamalar, hesaplar } = useFinans();

  const getHesapAdi = (hesapId) => {
    const hesap = hesaplar.find((h) => h.id === hesapId);
    return hesap ? hesap.ad : 'Bilinmiyor';
  };

  // Hiç veri yoksa: boş durum kartı
  if (!enBuyukHarcamalar || enBuyukHarcamalar.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>Seçili Tarih Aralığındaki En Büyük Harcamalar</h2>
        </div>
        <div className="empty-state-container" style={{ padding: '2rem' }}>
          <p>Seçili tarih aralığında gösterilecek harcama bulunmuyor.</p>
          <Link to="/islemler" className="primary-btn-small" style={{ marginTop: '0.75rem' }}>
            İşlem Ekle
          </Link>
        </div>
      </div>
    );
  }

  // Özet hesaplamalar
  const toplamTutar = enBuyukHarcamalar.reduce((acc, h) => acc + (h.tutar || 0), 0);
  const ortalamaTutar = toplamTutar / enBuyukHarcamalar.length;

  const enYuksek = enBuyukHarcamalar.reduce(
    (max, h) => (h.tutar > (max?.tutar ?? -Infinity) ? h : max),
    null
  );

  // Kategori istatistiği (en sık görünen)
  const kategoriSayac = enBuyukHarcamalar.reduce((acc, h) => {
    const key = h.kategori || 'Diğer';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  let enSikKategori = '-';
  let enSikKategoriAdet = 0;
  Object.entries(kategoriSayac).forEach(([kat, adet]) => {
    if (adet > enSikKategoriAdet) {
      enSikKategoriAdet = adet;
      enSikKategori = kat;
    }
  });

  return (
    <div className="card">
      <div className="card-header">
        <h2>Seçili Tarih Aralığındaki En Büyük 10 Harcama</h2>
      </div>

      <div className="tablo-container">
        <table>
          <thead>
            <tr>
              <th>Açıklama</th>
              <th>Kategori</th>
              <th>Hesap</th>
              <th>Tarih</th>
              <th style={{ textAlign: 'right' }}>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {enBuyukHarcamalar.map((harcama) => (
              <tr key={harcama.id}>
                <td>{harcama.aciklama}</td>
                <td>{harcama.kategori}</td>
                <td>{getHesapAdi(harcama.hesapId)}</td>
                <td>{formatDate(harcama.tarih)}</td>
                <td
                  className="gider-renk"
                  style={{ textAlign: 'right', fontWeight: 600 }}
                >
                  {formatCurrency(harcama.tutar)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mini özet barı */}
      <div className="trend-mini-ozet-grid">
        <div className="trend-mini-ozet-item">
          <span className="ozet-etiket">Liste Toplamı</span>
          <span className="ozet-deger gider-renk">
            {formatCurrency(toplamTutar)}
          </span>
          <span className="ozet-alt">
            İlk {enBuyukHarcamalar.length} harcamanın toplam tutarı
          </span>
        </div>

        <div className="trend-mini-ozet-item">
          <span className="ozet-etiket">Ortalama Harcama</span>
          <span className="ozet-deger">
            {formatCurrency(ortalamaTutar)}
          </span>
          <span className="ozet-alt">
            Listedeki işlemler başına ortalama tutar
          </span>
        </div>

        <div className="trend-mini-ozet-item">
          <span className="ozet-etiket">En Büyük Harcama</span>
          <span className="ozet-deger">
            {enYuksek ? formatCurrency(enYuksek.tutar) : '-'}
          </span>
          <span className="ozet-alt">
            {enYuksek
              ? `${formatDate(enYuksek.tarih)} • ${enYuksek.kategori}`
              : '—'}
          </span>
        </div>

        <div className="trend-mini-ozet-item">
          <span className="ozet-etiket">En Sık Kategori</span>
          <span className="ozet-deger">{enSikKategori}</span>
          <span className="ozet-alt">
            {enSikKategoriAdet} kez listede yer aldı
          </span>
        </div>
      </div>
    </div>
  );
}

export default EnBuyukHarcamalarRaporu;
