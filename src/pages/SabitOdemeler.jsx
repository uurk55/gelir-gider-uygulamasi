// src/pages/SabitOdemeler.jsx

import { useState, useEffect } from 'react';
import {
  FaTrash,
  FaPen,
  FaSave,
  FaExclamationCircle,
  FaPiggyBank,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaPlus,
  FaTimes,
  FaInfoCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useFinans } from '../context/FinansContext';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

// Özet Kartı Alt Bileşeni
const OzetKarti = ({ ikon, baslik, deger }) => (
  <div className="ozet-karti-sabit-odeme">
    <div className="ozet-karti-ikon">{ikon}</div>
    <div className="ozet-karti-icerik">
      <span className="ozet-karti-deger">{deger}</span>
      <span className="ozet-karti-baslik">{baslik}</span>
    </div>
  </div>
);

// Liste Elemanı Alt Bileşeni
const SabitOdemeListItem = ({ odeme, isBekleyen }) => {
  const {
    handleSabitOdemeSil,
    handleSabitOdemeGuncelle,
    giderKategorileri,
    hesaplar,
    handleBekleyenOdemeleriIsle,
    handleBekleyenOdemeyiAtla,
    bekleyenOdemeler,
  } = useFinans();
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState({ ...odeme });

  // BUGÜN BİLGİSİ
  const bugun = new Date();
  const bugunGun = bugun.getDate();

  // BU AY DURUMU: Ödendi mi / Bekliyor mu / Daha vadesi gelmedi mi?
  const buAyBekliyor = bekleyenOdemeler.some((b) => b.id === odeme.id);

  let buAyDurum = '';
  let buAyDurumTip = '';

  if (bugunGun < odeme.odemeGunu) {
    buAyDurum = 'Bu ay: Vadesi gelmedi';
    buAyDurumTip = 'gelecek';
  } else if (buAyBekliyor) {
    buAyDurum = 'Bu ay: Bekliyor';
    buAyDurumTip = 'bekleyen';
  } else {
    buAyDurum = 'Bu ay: Ödendi';
    buAyDurumTip = 'odendi';
  }

  // TAKSİT İLERLEMESİ (örn. 4/12) + kalan ay / kalan tutar
  let taksitEtiketi = '';
  let kalanAy = null;
  let kalanTutar = null;
  let baslangic = null;

  if (odeme.taksitSayisi && odeme.baslangicTarihi) {
    baslangic = new Date(odeme.baslangicTarihi);
    const ayFarki =
      (bugun.getFullYear() - baslangic.getFullYear()) * 12 +
      (bugun.getMonth() - baslangic.getMonth());

    const aktifTaksitNo = Math.min(
      Math.max(ayFarki + 1, 1),
      odeme.taksitSayisi
    );

    taksitEtiketi = `Taksit ${aktifTaksitNo}/${odeme.taksitSayisi}`;
    kalanAy = Math.max(odeme.taksitSayisi - aktifTaksitNo, 0);
    kalanTutar = kalanAy * (odeme.tutar || 0);
  }

  // Hover tooltip metni (6. madde)
  let detayTooltipMetni = '';
  if (odeme.taksitSayisi && baslangic) {
    const bitisTarihi = new Date(
      baslangic.getFullYear(),
      baslangic.getMonth() + odeme.taksitSayisi,
      baslangic.getDate()
    );

    detayTooltipMetni = `Başlangıç: ${baslangic.toLocaleDateString(
      'tr-TR'
    )} · Tahmini bitiş: ${bitisTarihi.toLocaleDateString(
      'tr-TR'
    )} · ${taksitEtiketi || `Toplam ${odeme.taksitSayisi} taksit`}`;
  } else {
    detayTooltipMetni = `Her ay ${formatCurrency(
      odeme.tutar
    )} · Ayın ${odeme.odemeGunu}. günü · ${buAyDurum}`;
  }

  const handleSave = () => {
    if (
      !editState.aciklama ||
      !editState.tutar ||
      !editState.hesapId ||
      !editState.odemeGunu
    ) {
      return toast.error('Lütfen tüm alanları doldurun.');
    }
    handleSabitOdemeGuncelle(odeme.id, {
      ...odeme,
      aciklama: editState.aciklama,
      tutar: parseFloat(editState.tutar),
      kategori: editState.kategori,
      hesapId: parseInt(editState.hesapId),
      odemeGunu: parseInt(editState.odemeGunu),
      taksitSayisi: odeme.taksitSayisi ? parseInt(editState.taksitSayisi) : null,
    });
    setIsEditing(false);
  };

  useEffect(() => {
    setEditState({ ...odeme });
  }, [isEditing, odeme]);

  const odemeHesabi =
    hesaplar.find((h) => h.id === odeme.hesapId)?.ad || 'Belirtilmemiş';

  const handleTekilIsle = () => {
    const bekleyenOdeme = bekleyenOdemeler.find((b) => b.id === odeme.id);
    if (bekleyenOdeme) {
      handleBekleyenOdemeleriIsle([bekleyenOdeme]);
    }
  };

  const handleAtla = () => {
    handleBekleyenOdemeyiAtla(odeme);
  };

  // --- DÜZENLEME MODU ---
  if (isEditing) {
    return (
      <li className="ozellestir-liste-item ekleme-formu sabit-odeme-formu is-editing">
        <div className="sabit-odeme-form-icerik">
          <div className="form-grup">
            <label>Açıklama</label>
            <input
              name="aciklama"
              value={editState.aciklama}
              onChange={(e) =>
                setEditState((p) => ({ ...p, aciklama: e.target.value }))
              }
              type="text"
            />
          </div>
          <div className="form-grup">
            <label>Aylık Tutar</label>
            <input
              name="tutar"
              value={editState.tutar}
              onChange={(e) =>
                setEditState((p) => ({ ...p, tutar: e.target.value }))
              }
              type="number"
            />
          </div>
          <div className="form-grup">
            <label>Kategori</label>
            <select
              name="kategori"
              value={editState.kategori}
              onChange={(e) =>
                setEditState((p) => ({ ...p, kategori: e.target.value }))
              }
            >
              {giderKategorileri.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grup">
            <label>Hesap</label>
            <select
              name="hesapId"
              value={editState.hesapId}
              onChange={(e) =>
                setEditState((p) => ({
                  ...p,
                  hesapId: parseInt(e.target.value),
                }))
              }
            >
              <option value="" disabled>
                Hesap Seçiniz...
              </option>
              {hesaplar.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.ad}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grup">
            <label>Ödeme Günü</label>
            <input
              name="odemeGunu"
              value={editState.odemeGunu}
              onChange={(e) =>
                setEditState((p) => ({
                  ...p,
                  odemeGunu: e.target.value,
                }))
              }
              type="number"
            />
          </div>
          {odeme.taksitSayisi != null && (
            <div className="form-grup">
              <label>Taksit Sayısı</label>
              <input
                name="taksitSayisi"
                value={editState.taksitSayisi}
                onChange={(e) =>
                  setEditState((p) => ({
                    ...p,
                    taksitSayisi: e.target.value,
                  }))
                }
                type="number"
              />
            </div>
          )}
        </div>
        <div className="liste-item-aksiyonlar">
          <button onClick={handleSave} className="icon-btn">
            <FaSave />
          </button>
          <button onClick={() => setIsEditing(false)} className="icon-btn">
            <FaTimes />
          </button>
        </div>
      </li>
    );
  }

  // --- GÖRÜNÜM MODU ---
  return (
    <li
      className={`yonetim-listesi-item sabit-odeme-item ${
        isBekleyen ? 'bekleyen-odeme' : ''
      }`}
    >
      {isBekleyen && (
        <FaExclamationCircle
          className="bekleyen-odeme-ikon"
          title="Bu ödemenin vadesi geçmiş ve gider olarak işlenmeyi bekliyor."
        />
      )}

      <div className="sabit-odeme-orta">
        <span className="sabit-odeme-aciklama">{odeme.aciklama}</span>
        <div className="islem-etiketler">
          <span className="islem-etiket tip-etiketi">
            {odeme.taksitSayisi ? taksitEtiketi || 'Taksitli Ödeme' : 'Abonelik'}
          </span>

          {odeme.taksitSayisi && kalanAy !== null && kalanAy > 0 && (
            <span className="islem-etiket kalan-etiket">
              Kalan: {kalanAy} ay · {formatCurrency(kalanTutar)}
            </span>
          )}

          <span className="islem-etiket">{odeme.kategori}</span>
          <span className="islem-etiket">{odemeHesabi}</span>
          <span className="islem-etiket tarih-etiketi">
            Ayın {odeme.odemeGunu}. günü
          </span>

          <span className="sabit-odeme-detay-ipucu" title={detayTooltipMetni}>
            <FaInfoCircle />
          </span>
        </div>
      </div>

      <div className="sabit-odeme-sag">
        <span className="sabit-odeme-tutar">{formatCurrency(odeme.tutar)}</span>

        <span
          className={`sabit-odeme-buay-etiketi durum-${buAyDurumTip}`}
          title={buAyDurum}
        >
          {buAyDurum}
        </span>

        <div className="buton-grubu">
          {isBekleyen ? (
            <>
              <button
                onClick={handleAtla}
                className="icon-btn ikincil-btn"
                title="Bu Ay Atla"
              >
                Atla
              </button>
              <button
                onClick={handleTekilIsle}
                className="icon-btn birincil-btn"
                title="Gider Olarak Ekle"
              >
                Ekle
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="icon-btn duzenle-btn"
              >
                <FaPen />
              </button>
              <button
                onClick={() => handleSabitOdemeSil(odeme.id)}
                className="icon-btn sil-btn"
              >
                <FaTrash />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="icon-btn duzenle-btn"
              >
                <FaPen />
              </button>
              <button
                onClick={() => handleSabitOdemeSil(odeme.id)}
                className="icon-btn sil-btn"
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

// Ana Sayfa Bileşeni
function SabitOdemeler() {
  const {
    sabitOdemeler,
    handleSabitOdemeEkle,
    giderKategorileri,
    bekleyenOdemeler,
    hesaplar,
    sabitOdemelerOzeti,
  } = useFinans();
  const [isAdding, setIsAdding] = useState(false);
  const [odemeTipi, setOdemeTipi] = useState('abonelik');
  const [gorunumFiltre, setGorunumFiltre] = useState('hepsi'); // hepsi | bekleyen | abonelik | taksit
  const [siralaKriter, setSiralaKriter] = useState('tarih-yakin'); // 5. madde

  const [yeniOdeme, setYeniOdeme] = useState({
    aciklama: '',
    tutar: '',
    kategori: giderKategorileri[0] || '',
    hesapId: hesaplar[0]?.id || '',
    odemeGunu: '',
    baslangicTarihi: new Date().toISOString().split('T')[0],
    taksitSayisi: '',
  });

  const aylikTutarNum = parseFloat(yeniOdeme.tutar) || 0;
  const taksitSayisiNum =
    odemeTipi === 'taksit' ? parseInt(yeniOdeme.taksitSayisi) || 0 : 0;

  const tahminiToplamTutar =
    odemeTipi === 'taksit' && aylikTutarNum && taksitSayisiNum
      ? aylikTutarNum * taksitSayisiNum
      : null;

  const baslangicDate = new Date(yeniOdeme.baslangicTarihi);
  let tahminiBitis = null;
  if (odemeTipi === 'taksit' && taksitSayisiNum) {
    tahminiBitis = new Date(
      baslangicDate.getFullYear(),
      baslangicDate.getMonth() + taksitSayisiNum,
      baslangicDate.getDate()
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setYeniOdeme((prev) => ({ ...prev, [name]: value }));
  };

  const onEkle = () => {
    if (
      !yeniOdeme.aciklama ||
      !yeniOdeme.tutar ||
      !yeniOdeme.hesapId ||
      !yeniOdeme.odemeGunu
    ) {
      return toast.error(
        'Lütfen Açıklama, Tutar, Hesap ve Ödeme Günü alanlarını doldurun.'
      );
    }
    if (
      odemeTipi === 'taksit' &&
      (!yeniOdeme.taksitSayisi || yeniOdeme.taksitSayisi <= 0)
    ) {
      return toast.error(
        'Taksitli ödeme için geçerli bir taksit sayısı girin.'
      );
    }
    handleSabitOdemeEkle({
      ...yeniOdeme,
      tutar: parseFloat(yeniOdeme.tutar),
      hesapId: parseInt(yeniOdeme.hesapId),
      odemeGunu: parseInt(yeniOdeme.odemeGunu),
      taksitSayisi:
        odemeTipi === 'taksit'
          ? parseInt(yeniOdeme.taksitSayisi)
          : null,
    });
    setYeniOdeme({
      aciklama: '',
      tutar: '',
      kategori: giderKategorileri[0] || '',
      hesapId: hesaplar[0]?.id || '',
      odemeGunu: '',
      baslangicTarihi: new Date().toISOString().split('T')[0],
      taksitSayisi: '',
    });
    setOdemeTipi('abonelik');
    setIsAdding(false);
  };

  if (
    !sabitOdemeler ||
    !giderKategorileri ||
    !bekleyenOdemeler ||
    !hesaplar ||
    !sabitOdemelerOzeti
  ) {
    return <div>Yükleniyor...</div>;
  }

  const bekleyenOdemeIdleri = new Set(
    bekleyenOdemeler.map((odeme) => odeme.id)
  );

  const { enYakinOdeme } = sabitOdemelerOzeti;

  const toplamBekleyenTutar = bekleyenOdemeler.reduce(
    (acc, o) => acc + (o.tutar || 0),
    0
  );

  // Filtre (tip)
  const filtrelenmisOdemeler = sabitOdemeler.filter((o) => {
    if (gorunumFiltre === 'hepsi') return true;
    if (gorunumFiltre === 'bekleyen') return bekleyenOdemeIdleri.has(o.id);
    if (gorunumFiltre === 'abonelik') return !o.taksitSayisi;
    if (gorunumFiltre === 'taksit') return !!o.taksitSayisi;
    return true;
  });

  // Sıralama (5. madde)
  const siraliOdemeler = [...filtrelenmisOdemeler].sort((a, b) => {
    switch (siralaKriter) {
      case 'tutar-cok':
        return (b.tutar || 0) - (a.tutar || 0);
      case 'tutar-az':
        return (a.tutar || 0) - (b.tutar || 0);
      case 'ad-az':
        return (a.aciklama || '').localeCompare(b.aciklama || '', 'tr');
      case 'tarih-yakin':
      default:
        // Ayın gününe göre (1'e en yakın yukarıda)
        return (a.odemeGunu || 0) - (b.odemeGunu || 0);
    }
  });

  return (
    <>
      <div className="ozet-panosu-container">
        <div className="ozet-panosu-grid-sabit-odeme">
          <OzetKarti
            ikon={<FaFileInvoiceDollar />}
            deger={formatCurrency(sabitOdemelerOzeti.toplamAylikTaahhut)}
            baslik="Aylık Toplam Taahhüt"
          />
          <OzetKarti
            ikon={<FaCalendarCheck />}
            deger={
              enYakinOdeme
                ? `${enYakinOdeme.aciklama} (${enYakinOdeme.kalanGun} gün)`
                : '-'
            }
            baslik="En Yakın Ödeme"
          />
          <OzetKarti
            ikon={<FaPiggyBank />}
            deger={`${sabitOdemelerOzeti.aktifOdemeSayisi} adet`}
            baslik="Aktif Ödeme"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Kayıtlı Sabit Ödemeler</h2>
        </div>
        <div className="ozellestir-icerik" style={{ paddingTop: 0 }}>
          <div className="sabit-odeme-liste-ust">
            <div className="sabit-odeme-liste-ozet">
              <span>
                Bu ay bekleyen:{' '}
                <strong>
                  {bekleyenOdemeler.length > 0
                    ? formatCurrency(toplamBekleyenTutar)
                    : 'Yok'}
                </strong>
              </span>
              <span className="ayrac">•</span>
              <span>
                Aktif kayıt: <strong>{sabitOdemeler.length} ödeme</strong>
              </span>
            </div>

            <div className="sabit-odeme-liste-filtreler">
              <button
                type="button"
                className={gorunumFiltre === 'hepsi' ? 'aktif' : ''}
                onClick={() => setGorunumFiltre('hepsi')}
              >
                Hepsi
              </button>
              <button
                type="button"
                className={gorunumFiltre === 'bekleyen' ? 'aktif' : ''}
                onClick={() => setGorunumFiltre('bekleyen')}
              >
                Sadece Bekleyen
              </button>
              <button
                type="button"
                className={gorunumFiltre === 'abonelik' ? 'aktif' : ''}
                onClick={() => setGorunumFiltre('abonelik')}
              >
                Abonelikler
              </button>
              <button
                type="button"
                className={gorunumFiltre === 'taksit' ? 'aktif' : ''}
                onClick={() => setGorunumFiltre('taksit')}
              >
                Taksitler
              </button>

              {/* SIRALAMA DROPDOWNU */}
              <div className="sabit-odeme-liste-siralama">
                <span>Sırala:</span>
                <select
                  value={siralaKriter}
                  onChange={(e) => setSiralaKriter(e.target.value)}
                >
                  <option value="tarih-yakin">
                    Tarihe göre (yakından uzağa)
                  </option>
                  <option value="tutar-cok">Tutar (yüksek → düşük)</option>
                  <option value="tutar-az">Tutar (düşük → yüksek)</option>
                  <option value="ad-az">Ada göre (A → Z)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ozellestir-liste">
            {sabitOdemeler.length === 0 && !isAdding && (
              <p className="liste-bos-mesaji">
                Henüz bir sabit ödeme eklemediniz.
              </p>
            )}

            {siraliOdemeler.map((odeme) => (
              <SabitOdemeListItem
                key={odeme.id}
                odeme={odeme}
                isBekleyen={bekleyenOdemeIdleri.has(odeme.id)}
              />
            ))}

            {isAdding && (
              <li className="ozellestir-liste-item ekleme-formu sabit-odeme-formu">
                {/* ÜST BAŞLIK + ÖDEME TİPİ */}
                <div className="sabit-odeme-form-baslik">
                  <div>
                    <h3>
                      Yeni{' '}
                      {odemeTipi === 'abonelik'
                        ? 'Abonelik'
                        : 'Taksitli Ödeme'}
                    </h3>
                    <p>
                      {odemeTipi === 'abonelik'
                        ? 'Aynı tutarda, her ay otomatik tekrarlayan ödemeler için kullanın.'
                        : 'Belirli sayıda ay boyunca sürecek kredi / taksit ödemeleriniz için kullanın.'}
                    </p>
                  </div>
                  <div className="odeme-tipi-secici">
                    <button
                      type="button"
                      onClick={() => setOdemeTipi('abonelik')}
                      className={odemeTipi === 'abonelik' ? 'aktif' : ''}
                    >
                      Abonelik
                    </button>
                    <button
                      type="button"
                      onClick={() => setOdemeTipi('taksit')}
                      className={odemeTipi === 'taksit' ? 'aktif' : ''}
                    >
                      Taksit
                    </button>
                  </div>
                </div>

                {/* İKİ SÜTUNLU FORM */}
                <div className="sabit-odeme-form-grid">
                  {/* SOL SÜTUN – TEMEL BİLGİLER */}
                  <div className="form-sutun">
                    <div className="form-grup">
                      <label>Açıklama</label>
                      <input
                        name="aciklama"
                        value={yeniOdeme.aciklama}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Örn: Netflix, Telefon faturası..."
                      />
                    </div>
                    <div className="form-grup">
                      <label>
                        Aylık Tutar
                        <span className="form-etiket-aciklama">
                          {' '}
                          (her ay ödenecek tutar)
                        </span>
                      </label>
                      <input
                        name="tutar"
                        value={yeniOdeme.tutar}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="₺0,00"
                      />
                    </div>
                    <div className="form-grup">
                      <label>Kategori</label>
                      <select
                        name="kategori"
                        value={yeniOdeme.kategori}
                        onChange={handleInputChange}
                      >
                        {giderKategorileri.map((kat) => (
                          <option key={kat} value={kat}>
                            {kat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SAĞ SÜTUN – HESAP / TAKVİM / TAKSİT */}
                  <div className="form-sutun">
                    <div className="form-grup">
                      <label>Hesap</label>
                      <select
                        name="hesapId"
                        value={yeniOdeme.hesapId}
                        onChange={handleInputChange}
                      >
                        {hesaplar.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.ad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-grup">
                      <label>
                        Ödeme Günü
                        <span className="form-etiket-aciklama">
                          {' '}
                          (ayın kaçıncı günü)
                        </span>
                      </label>
                      <input
                        name="odemeGunu"
                        value={yeniOdeme.odemeGunu}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="1-31"
                      />
                    </div>

                    <AnimatePresence>
                      {odemeTipi === 'taksit' && (
                        <motion.div
                          className="form-grup"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          <label>
                            Taksit Sayısı
                            <span className="form-etiket-aciklama">
                              {' '}
                              (toplam ay)
                            </span>
                          </label>
                          <input
                            name="taksitSayisi"
                            value={yeniOdeme.taksitSayisi}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="Örn: 12"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ÖZET ÇUBUĞU + BUTONLAR */}
                <div className="sabit-odeme-form-ozet-cubugu">
                  {odemeTipi === 'abonelik' ? (
                    <span>
                      Bu ödeme, seçilen hesaptan her ay{' '}
                      <strong>
                        {yeniOdeme.tutar
                          ? formatCurrency(aylikTutarNum)
                          : 'girilen tutar'}
                      </strong>{' '}
                      olarak otomatik işlenecek.
                    </span>
                  ) : (
                    <span>
                      {tahminiToplamTutar && tahminiBitis ? (
                        <>
                          Toplam taahhüt yaklaşık{' '}
                          <strong>
                            {formatCurrency(tahminiToplamTutar)}
                          </strong>
                          . Tahmini bitiş:{' '}
                          <strong>
                            {tahminiBitis.toLocaleDateString('tr-TR')}
                          </strong>
                          .
                        </>
                      ) : (
                        <>
                          Taksit sayısı ve aylık tutarı girince toplam
                          taahhüt ve tahmini bitiş tarihini burada
                          göreceksin.
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="sabit-odeme-form-aksiyonlar">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="secondary-btn"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={onEkle}
                    className="primary-btn"
                  >
                    <FaSave style={{ marginRight: 6 }} />
                    Sabit Ödeme Oluştur
                  </button>
                </div>
              </li>
            )}
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="ekle-btn"
            >
              <FaPlus /> Yeni Sabit Ödeme Ekle
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default SabitOdemeler;
