import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import AyarKarti from './AyarKarti';

const Tercihler = () => {
    const { ayarlar, updateTercihler } = useFinans();
    const [seciliParaBirimi, setSeciliParaBirimi] = useState(ayarlar.tercihler.paraBirimi || 'TRY');

    const handleParaBirimiDegistir = (e) => {
        const yeniBirim = e.target.value;
        setSeciliParaBirimi(yeniBirim);
        const guncelTercihler = { ...ayarlar.tercihler, paraBirimi: yeniBirim };
        updateTercihler(guncelTercihler);
    };

    return (
        <AyarKarti
            title="Tercihler"
            description="Uygulamanın genel davranışını ve görünümünü kişiselleştirin."
        >
            <div className="ayar-formu">
                <div className="form-grup">
                    <label htmlFor="paraBirimi">Varsayılan Para Birimi</label>
                    <select id="paraBirimi" value={seciliParaBirimi} onChange={handleParaBirimiDegistir}>
                        <option value="TRY">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                        <option value="EUR">Euro (€)</option>
                    </select>
                </div>
            </div>
        </AyarKarti>
    );
};

export default Tercihler;