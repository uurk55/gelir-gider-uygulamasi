import { useFinans } from '../../context/FinansContext';
import AyarKarti from './AyarKarti';
import SwitchInput from './SwitchInput'; // SwitchInput'ı import ediyoruz

const BildirimAyarlari = () => {
    const { ayarlar, updateBildirimAyarlari } = useFinans();
    const handleBildirimDegisikligi = (ayarAdi, yeniDeger) => {
        const yeniAyarlar = { ...ayarlar.bildirimler, [ayarAdi]: yeniDeger };
        updateBildirimAyarlari(yeniAyarlar);
    };

    return (
        <AyarKarti
            title="Bildirim Ayarları"
            description="Hangi durumlarda e-posta ile bildirim almak istediğinizi seçin."
        >
            <div className="ayar-formu">
                <SwitchInput 
                    label="Yaklaşan ödemeler için hatırlatıcı gönder"
                    checked={ayarlar.bildirimler.yaklasanOdemeler}
                    onChange={(e) => handleBildirimDegisikligi('yaklasanOdemeler', e.target.checked)}
                />
                <SwitchInput 
                    label="Bütçe limitine yaklaşıldığında uyar (%90)"
                    checked={ayarlar.bildirimler.butceAsimi}
                    onChange={(e) => handleBildirimDegisikligi('butceAsimi', e.target.checked)}
                />
                <SwitchInput 
                    label="Haftalık harcama özetini e-posta ile gönder"
                    checked={ayarlar.bildirimler.haftalikOzet}
                    onChange={(e) => handleBildirimDegisikligi('haftalikOzet', e.target.checked)}
                />
            </div>
        </AyarKarti>
    );
};

export default BildirimAyarlari;