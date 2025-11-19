// src/components/Ayarlar/BildirimAyarlari.jsx

import { useFinans } from '../../context/FinansContext';
import { useAuth } from '../../context/AuthContext';
import AyarKarti from './AyarKarti';
import SwitchInput from './SwitchInput';

const BildirimAyarlari = () => {
  const { ayarlar, updateBildirimAyarlari } = useFinans();
  const { currentUser } = useAuth();

  const handleBildirimDegisikligi = (ayarAdi, yeniDeger) => {
    const yeniAyarlar = { ...ayarlar.bildirimler, [ayarAdi]: yeniDeger };
    updateBildirimAyarlari(yeniAyarlar);
  };

  return (
    <AyarKarti
      title="Bildirim Ayarları"
      description="Hangi durumlarda e-posta ile hatırlatma almak istediğini buradan belirleyebilirsin."
    >
      <div className="ayar-formu">
        {/* Üst bilgilendirme kutusu */}
        <div className="ayar-info-banner">
          <span>
            Bildirimler şu adrese gönderilecek:{' '}
            <strong>{currentUser?.email || 'E-posta adresiniz'}</strong>
          </span>
          <span className="ayar-info-note">
            Bu adresi değiştirmek için “Profil Bilgileri” sekmesini kullanabilirsin.
          </span>
        </div>

        {/* Yaklaşan ödemeler */}
        <div className="ayar-switch-grup">
          <SwitchInput
            label="Yaklaşan ödemeler için hatırlatıcı gönder"
            checked={ayarlar.bildirimler.yaklasanOdemeler}
            onChange={(e) =>
              handleBildirimDegisikligi('yaklasanOdemeler', e.target.checked)
            }
          />
          <p className="ayar-switch-aciklama">
            Ödeme tarihinden önce, yaklaşan faturaların ve taksitlerinin özetini e-posta
            olarak alırsın.
          </p>
        </div>

        {/* Bütçe aşımı */}
        <div className="ayar-switch-grup">
          <SwitchInput
            label="Bütçe limitine yaklaşıldığında uyar (%90)"
            checked={ayarlar.bildirimler.butceAsimi}
            onChange={(e) =>
              handleBildirimDegisikligi('butceAsimi', e.target.checked)
            }
          />
          <p className="ayar-switch-aciklama">
            Tanımladığın aylık bütçede bir kategoride harcamaların %90&apos;a ulaştığında
            uyarı e-postası gönderilir.
          </p>
        </div>

        {/* Haftalık özet */}
        <div className="ayar-switch-grup">
          <SwitchInput
            label="Haftalık harcama özetini e-posta ile gönder"
            checked={ayarlar.bildirimler.haftalikOzet}
            onChange={(e) =>
              handleBildirimDegisikligi('haftalikOzet', e.target.checked)
            }
          />
          <p className="ayar-switch-aciklama">
            Her hafta, toplam gelir-gider dengen ve önemli hareketlerin kısa bir özeti
            e-posta olarak paylaşılır.
          </p>
        </div>
      </div>
    </AyarKarti>
  );
};

export default BildirimAyarlari;
