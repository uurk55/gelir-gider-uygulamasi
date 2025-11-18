import { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import AyarKarti from "./AyarKarti";

const ProfilBilgileri = () => {
  const { currentUser, updateProfileName } = useAuth();
  const baslangicAd = currentUser?.displayName || "";
  const [orijinalAd, setOrijinalAd] = useState(baslangicAd);
  const [gorunenAd, setGorunenAd] = useState(baslangicAd);
  const [loading, setLoading] = useState(false);

  const degisiklikVar = orijinalAd !== gorunenAd;

  const initialLetter = useMemo(() => {
    const source = gorunenAd || currentUser?.email || "H";
    return source.charAt(0).toUpperCase();
  }, [gorunenAd, currentUser]);

  // Firebase auth kullanıyorsan metadata genelde burada olur;
  // yoksa zaten boş kalır, hata vermez.
  const createdAt = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("tr-TR")
    : null;

  const lastLogin = currentUser?.metadata?.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString("tr-TR")
    : null;

  const handleProfilGuncelle = async (e) => {
    e.preventDefault();
    if (!degisiklikVar || !gorunenAd.trim()) return;

    setLoading(true);
    try {
      await updateProfileName(gorunenAd.trim());
      setOrijinalAd(gorunenAd.trim());
      toast.success("Profil bilgilerin güncellendi.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AyarKarti
      title="Profil Bilgileri"
      description="Görünen adını güncelleyebilir, e-posta adresini ve hesabınla ilgili bazı temel bilgileri görebilirsin."
    >
      {/* KULLANICI ÖZETİ */}
      <div className="ayar-kullanici-ozet">
        <div className="ayar-kullanici-avatar">{initialLetter}</div>
        <div className="ayar-kullanici-bilgi">
          <div className="ayar-kullanici-ad">
            {gorunenAd || "Hesabım"}
          </div>
          {currentUser?.email && (
            <div className="ayar-kullanici-mail">{currentUser.email}</div>
          )}
          <div className="ayar-kullanici-detay">
            {createdAt && <span>Hesap açılış: {createdAt}</span>}
            {lastLogin && <span>Son giriş: {lastLogin}</span>}
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleProfilGuncelle} className="ayar-formu">
        <div className="form-grup">
          <label>E-posta Adresi</label>
          <input
            type="email"
            value={currentUser?.email || ""}
            disabled
          />
          <p className="form-aciklama">
            E-posta adresin giriş için kullanılır. Bu ekrandan değiştirilemez.
          </p>
        </div>

        <div className="form-grup">
          <label htmlFor="gorunenAd">Görünen Ad</label>
          <input
            id="gorunenAd"
            type="text"
            value={gorunenAd}
            onChange={(e) => setGorunenAd(e.target.value)}
            placeholder="Örn: Uur K."
          />
          <p className="form-aciklama">
            Uygulamanın içinde ve üst menüde gözükecek isim.
          </p>
        </div>

        <div className="ayar-form-aksiyon">
          <button
            type="submit"
            className="primary-btn"
            disabled={!degisiklikVar || loading || !gorunenAd.trim()}
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </AyarKarti>
  );
};

export default ProfilBilgileri;
