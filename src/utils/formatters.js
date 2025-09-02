// src/utils/formatters.js

// Bu fonksiyon, aldığı sayıyı "₺1.234,56" formatına çevirir.
export const formatCurrency = (amount) => {
  // Eğer gelen değer bir sayı değilse, 0 olarak kabul et. Bu, NaN hatalarını önler.
  if (typeof amount !== 'number') {
    amount = 0;
  }
  
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY' 
  }).format(amount);
};