// src/components/Raporlar/EnBuyukHarcamalarRaporu.jsx

import { useFinans } from '../../context/FinansContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

function EnBuyukHarcamalarRaporu() {
    const { enBuyukHarcamalar, hesaplar } = useFinans();

    const getHesapAdi = (hesapId) => {
        const hesap = hesaplar.find(h => h.id === hesapId);
        return hesap ? hesap.ad : 'Bilinmiyor';
    };

    // Eğer veri yoksa, bir mesaj göster
    if (enBuyukHarcamalar.length === 0) {
        return (
             <div className="card">
                <p style={{padding: '2rem', textAlign: 'center'}}>Seçili tarih aralığında gösterilecek harcama bulunmuyor.</p>
            </div>
        );
    }

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
                            <th style={{textAlign: 'right'}}>Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enBuyukHarcamalar.map(harcama => (
                            <tr key={harcama.id}>
                                <td>{harcama.aciklama}</td>
                                <td>{harcama.kategori}</td>
                                <td>{getHesapAdi(harcama.hesapId)}</td>
                                <td>{formatDate(harcama.tarih)}</td>
                                <td className="gider-renk" style={{textAlign: 'right', fontWeight: '600'}}>
                                    {formatCurrency(harcama.tutar)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EnBuyukHarcamalarRaporu;