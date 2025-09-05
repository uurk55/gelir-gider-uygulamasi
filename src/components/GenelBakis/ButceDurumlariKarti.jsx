// src/components/GenelBakis/ButceDurumlariKarti.jsx

import { useFinans } from '../../context/FinansContext';
import { formatCurrency } from '../../utils/formatters';

function ButceDurumlariKarti() {
    // Sadece bu bileşenin ihtiyacı olan veriyi çekiyoruz
    const { butceDurumlari } = useFinans();

    // Eğer gösterilecek bir bütçe yoksa, bu kartı hiç göstermeyelim.
    if (!butceDurumlari || butceDurumlari.length === 0) {
        return null;
    }

    return (
        <div className="card">
            <div className="card-header"><h2>Aylık Kategori Limitleri</h2></div>
            <div className="butce-listesi">
                {butceDurumlari.map(butce => (
                    <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                        <div className="butce-bilgi">
                            <span className="butce-kategori">{butce.kategori}</span>
                            <span className="butce-yuzde">(%{butce.yuzdeRaw ? butce.yuzdeRaw.toFixed(0) : butce.yuzde.toFixed(0)})</span>
                        </div>
                        <div className="progress-bar-konteyner">
                            <div className="progress-bar-dolgu" style={{ width: `${butce.yuzde}%` }}></div>
                        </div>
                        <div className="butce-detay-yeni">
                            <span className="butce-rakamlar">{formatCurrency(butce.harcanan)} / {formatCurrency(butce.limit)}</span>
                            <span>
                                {butce.kalan < 0 
                                    ? <span className="butce-durum gider-renk">{formatCurrency(-butce.kalan)} aşıldı!</span> 
                                    : <span className="butce-durum">{formatCurrency(butce.kalan)} kaldı</span>
                                }
                            </span>
                        </div>
                        {butce.degisimYuzdesi !== 0 && (
                            <div className={`degisim-yuzdesi ${butce.degisimYuzdesi > 0 ? 'gider-renk' : 'gelir-renk'}`}>
                                Geçen aya göre %{butce.degisimYuzdesi.toFixed(0)}
                                {butce.degisimYuzdesi > 0 ? ' artış' : ' azalış'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ButceDurumlariKarti;