// src/components/GenelBakis/HesapGiderleriKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { formatCurrency } from '../../utils/formatters';
import { getAccountIcon } from '../../utils/iconMap';

function HesapGiderleriKarti() {
    // Sadece bu bileşenin ihtiyacı olan veriyi çekiyoruz
    const { aylikHesapGiderleri } = useFinans();

    // Eğer gösterilecek bir hesap gideri yoksa, bu kartı hiç göstermeyelim.
    if (!aylikHesapGiderleri || aylikHesapGiderleri.length === 0) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-header"><h2>Aylık Gider Dağılımı (Hesaba Göre)</h2></div>
            <div className="hesap-gider-listesi">
                {aylikHesapGiderleri.map(hesap => (
                    <div key={hesap.id} className="hesap-gider-satiri">
                        <div className="hesap-gider-ust">
                            <div className="hesap-adi-ikon">
                                <span className="hesap-ikon">{getAccountIcon(hesap.ad)}</span>
                                <span className="hesap-adi">{hesap.ad}</span>
                            </div>
                            <span className="hesap-aylik-gider gider-renk">-{formatCurrency(hesap.aylikGider)}</span>
                        </div>
                        <div className="hesap-gider-alt">
                            <span className="hesap-gider-yuzdesi">Toplam giderin %{hesap.giderYuzdesi.toFixed(1)}'i</span>
                            <div className="progress-bar-konteyner">
                                <div className="hesap-progress-bar-dolgu" style={{ width: `${hesap.giderYuzdesi}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HesapGiderleriKarti;