// src/utils/formatters.js

// --- Yardımcılar ----------------------------------------------------

function getStoredTercihler() {
  try {
    const data = localStorage.getItem("finansTercihler");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function getStoredKurlar() {
  try {
    const data = localStorage.getItem("finansKurBilgileri");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// TRY -> hedef para birimine çevir
function convertFromTRY(amountTRY, targetCurrency) {
  if (!targetCurrency || targetCurrency === "TRY") return amountTRY;

  const kur = getStoredKurlar();
  if (!kur || !kur.rates || kur.base !== "TRY") {
    // Kur yoksa, çeviri yapma; doğrudan TRY gibi davran
    return amountTRY;
  }

  const rate = kur.rates[targetCurrency];
  if (!rate || Number.isNaN(rate) || rate <= 0) {
    return amountTRY;
  }

  return amountTRY * rate;
}

// --- PARA FORMATLAMA ------------------------------------------------

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) amount = 0;
  if (typeof amount !== "number") amount = Number(amount) || 0;

  const tercihler = getStoredTercihler();

  const currency = tercihler.paraBirimi || "TRY"; // TRY, USD, EUR
  const display = tercihler.paraGosterim || "symbol"; // symbol | code | symbol-code

  // Uygulamanın tüm base para birimi TRY kabul ediliyor
  const amountToFormat = convertFromTRY(amount, currency);

  let locale = "tr-TR";
  if (currency === "USD") locale = "en-US";
  if (currency === "EUR") locale = "de-DE";

  let formatted;
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: display === "code" ? "code" : "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    formatted = formatter.format(amountToFormat);
  } catch {
    formatted = amountToFormat.toFixed(2) + " " + currency;
  }

  // Sembol + kod birlikte isteniyorsa
  if (display === "symbol-code") {
    return `${formatted} ${currency}`;
  }

  return formatted;
};

// --- TARİH FORMATLAMA -----------------------------------------------

export const formatDate = (dateString) => {
  if (!dateString) return "";

  const tercihler = getStoredTercihler();
  const format = tercihler.tarihFormati || "DD.MM.YYYY";

  try {
    const [year, month, day] = dateString.split("-");
    const date = new Date(Date.UTC(year, month - 1, day));

    const dd = String(date.getUTCDate()).padStart(2, "0");
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = date.getUTCFullYear();

    switch (format) {
      case "YYYY-MM-DD":
        return `${yyyy}-${mm}-${dd}`;
      case "DD/MM/YYYY":
        return `${dd}/${mm}/${yyyy}`;
      case "DD.MM.YYYY":
      default:
        return `${dd}.${mm}.${yyyy}`;
    }
  } catch (error) {
    console.error("Tarih formatlama hatası:", error);
    return dateString;
  }
};
