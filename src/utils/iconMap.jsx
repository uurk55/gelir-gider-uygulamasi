import { 
    FaShoppingCart, FaFileInvoiceDollar, FaBus, FaGamepad, 
    FaHeartbeat, FaHome, FaCreditCard, FaRedo, FaQuestionCircle,
    FaMoneyBillWave, FaGift, FaBriefcase, 
    FaWallet, FaLandmark
} from 'react-icons/fa';

// KATEGORİ İKONLARI İÇİN FONKSİYON
export const getCategoryIcon = (category) => {
    const iconMap = {
        "Market": <FaShoppingCart />,
        "Fatura": <FaFileInvoiceDollar />,
        "Ulaşım": <FaBus />,
        "Eğlence": <FaGamepad />,
        "Sağlık": <FaHeartbeat />,
        "Kira": <FaHome />,
        "Kredi": <FaCreditCard />, // Orijinal ismiyle kullanılıyor
        "Abonelik": <FaRedo />,
        "Maaş": <FaMoneyBillWave />,
        "Ek Gelir": <FaBriefcase />,
        "Hediye": <FaGift />,
        "Diğer": <FaQuestionCircle />
    };

    return iconMap[category] || <FaQuestionCircle />;
};

// HESAP İKONLARI İÇİN FONKSİYON
export const getAccountIcon = (accountName) => {
    const lowerCaseName = accountName.toLowerCase();

    if (lowerCaseName.includes('nakit')) {
        return <FaWallet />;
    }
    if (lowerCaseName.includes('banka')) {
        return <FaLandmark />;
    }
    if (lowerCaseName.includes('kredi kartı')) {
        // DÜZELTME: Takma isim yerine, import ettiğimiz orijinal ikonu kullanıyoruz
        return <FaCreditCard />;
    }
    
    return <FaWallet />; // Varsayılan ikon
};