// src/utils/formatters.js

export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = 0;
    }
    return amount.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    });
};

export const formatDate = (dateString) => {
    if (!dateString) {
        return '';
    }
    try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(Date.UTC(year, month - 1, day));
        
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);

    } catch (error) {
        console.error("Tarih formatlama hatası:", error);
        return dateString;
    }
};