import { FaLightbulb, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const AnalizKutusu = ({ analiz }) => {
    // Eğer analiz verisi yoksa veya mesaj boşsa, hiçbir şey gösterme.
    if (!analiz || !analiz.mesaj) return null;

    const ikonlar = {
        pozitif: <FaCheckCircle />,
        negatif: <FaExclamationTriangle />,
        notr: <FaLightbulb />
    };
    
    // CSS sınıfı için analiz durumunu al, yoksa 'notr' kullan.
    const durumSinifi = analiz.durum || 'notr';

    return (
        <div className={`analiz-kutusu ${durumSinifi}`}>
            <div className="analiz-ikon">{ikonlar[durumSinifi]}</div>
            <p className="analiz-mesaj">{analiz.mesaj}</p>
        </div>
    );
};

export default AnalizKutusu;