// src/utils/iconMap.jsx

import { 
    FaShoppingCart, FaFileInvoiceDollar, FaBus, FaGamepad, 
    FaHeartbeat, FaHome, FaCreditCard, FaRedo, FaQuestionCircle,
    FaMoneyBillWave, FaGift, FaBriefcase 
} from 'react-icons/fa';

export const getCategoryIcon = (category) => {
    const iconMap = {
        "Market": <FaShoppingCart />,
        "Fatura": <FaFileInvoiceDollar />,
        "Ulaşım": <FaBus />,
        "Eğlence": <FaGamepad />,
        "Sağlık": <FaHeartbeat />,
        "Kira": <FaHome />,
        "Kredi": <FaCreditCard />,
        "Abonelik": <FaRedo />,
        "Maaş": <FaMoneyBillWave />,
        "Ek Gelir": <FaBriefcase />,
        "Hediye": <FaGift />,
        "Diğer": <FaQuestionCircle />
    };

    return iconMap[category] || <FaQuestionCircle />;
};