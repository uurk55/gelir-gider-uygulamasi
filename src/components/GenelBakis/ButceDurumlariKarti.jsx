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
                {butceDurumlari.map(butce => {
                    // Güvenlik kontrolleri: Değerler undefined ise 0 kabul et
                    const yuzde = butce.yuzde || 0;
                    const yuzdeRaw = butce.yuzdeRaw || 0;
                    const harcanan = butce.harcanan || 0;
                    const limit = butce.limit || 0;
                    const kalan = butce.kalan !== undefined ? butce.kalan : limit;
                    const degisimYuzdesi = butce.degisimYuzdesi || 0;

                    return (
                        <div key={butce.kategori} className={`butce-kalemi ${butce.durum}`}>
                            <div className="butce-bilgi">
                                <span className="butce-kategori">{butce.kategori}</span>
                                <span className="butce-yuzde">(%{(yuzdeRaw || yuzde).toFixed(0)})</span> {/* <-- DEĞİŞİKLİK: Tek ve daha güvenli toFixed */}
                            </div>
                            <div className="progress-bar-konteyner">
                                <div className="progress-bar-dolgu" style={{ width: `${yuzde}%` }}></div>
                            </div>
                            <div className="butce-detay-yeni">
                                <span className="butce-rakamlar">{formatCurrency(harcanan)} / {formatCurrency(limit)}</span>
                                <span>
                                    {kalan < 0
                                        ? <span className="butce-durum gider-renk">{formatCurrency(-kalan)} aşıldı!</span>
                                        : <span className="butce-durum">{formatCurrency(kalan)} kaldı</span>
                                    }
                                </span>
                            </div>
                            {/* <-- DEĞİŞİKLİK: degisimYuzdesi'nin varlığını da kontrol et */}
                            {butce.degisimYuzdesi !== undefined && degisimYuzdesi !== 0 && (
                                <div className={`degisim-yuzdesi ${degisimYuzdesi > 0 ? 'gider-renk' : 'gelir-renk'}`}>
                                    Geçen aya göre %{degisimYuzdesi.toFixed(0)}
                                    {degisimYuzdesi > 0 ? ' artış' : ' azalış'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ButceDurumlariKarti;