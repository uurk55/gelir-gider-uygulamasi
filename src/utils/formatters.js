// src/utils/formatters.js

// Kullanıcının kayıtlı tercihlerini okuyan yardımcı fonksiyon
const getTercihler = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('finans_tercihler_v1');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Tercihler okunamadı:', e);
    return {};
  }
};

export const formatCurrency = (amount) => {
  let sayi = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(sayi)) sayi = 0;

  const tercihler = getTercihler();
  const paraBirimi = tercihler.paraBirimi || 'TRY';           // TRY / USD / EUR
  const gosterim = tercihler.paraGosterim || 'symbol-first';  // symbol-first / symbol-last / code-first

  // Para birimine göre locale seç
  const locale =
    paraBirimi === 'USD' || paraBirimi === 'EUR' ? 'en-US' : 'tr-TR';

  // Standart currency formatını üret
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: paraBirimi,
  });

  // Parçalarına ayır (currency sembolünü ayrı alacağız)
  const parts = formatter.formatToParts(sayi);
  const numberPart = parts
    .filter((p) => p.type !== 'currency')
    .map((p) => p.value)
    .join('');
  const currencySymbolPart = parts.find((p) => p.type === 'currency');

  // Sembol / kod
  const symbolFromIntl = currencySymbolPart?.value || paraBirimi;
  const manualSymbol =
    paraBirimi === 'TRY'
      ? '₺'
      : paraBirimi === 'USD'
      ? '$'
      : paraBirimi === 'EUR'
      ? '€'
      : symbolFromIntl;

  if (gosterim === 'symbol-last') {
    return `${numberPart} ${manualSymbol}`;
  }

  if (gosterim === 'code-first') {
    return `${paraBirimi} ${numberPart}`;
  }

  // Varsayılan: symbol-first
  return `${manualSymbol} ${numberPart}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';

  const tercihler = getTercihler();
  const format = tercihler.tarihFormati || 'DD.MM.YYYY';

  let d;

  // Hem 'YYYY-MM-DD' hem ISO '2025-11-19T00:00:00Z' tarzı girişleri tolere et
  try {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      d = new Date(dateString);
    } else if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      d = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      d = new Date(dateString);
    }
  } catch (e) {
    console.error('Tarih parse edilemedi:', e);
    return dateString;
  }

  if (isNaN(d.getTime())) {
    return dateString;
  }

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  if (format === 'YYYY-MM-DD') {
    return `${yyyy}-${mm}-${dd}`;
  }

  if (format === 'DD/MM/YYYY') {
    return `${dd}/${mm}/${yyyy}`;
  }

  // Varsayılan: DD.MM.YYYY
  return `${dd}.${mm}.${yyyy}`;
};
