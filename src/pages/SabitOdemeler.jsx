// src/pages/SabitOdemeler.jsx (DÜZELTİLMİŞ VE NİHAİ KOD)

import { useState, useEffect } from 'react';
import { FaTrash, FaPen, FaSave, FaExclamationCircle, FaPiggyBank, FaCalendarCheck, FaFileInvoiceDollar, FaPlus, FaTimes } from 'react-icons/fa';
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
        bekleyenOdemeler
    } = useFinans();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({ ...odeme });

    const handleSave = () => {
        if (!editState.aciklama || !editState.tutar || !editState.hesapId || !editState.odemeGunu) {
            return toast.error("Lütfen tüm alanları doldurun.");
        }
        handleSabitOdemeGuncelle(odeme.id, {
            ...odeme,
            aciklama: editState.aciklama,
            tutar: parseFloat(editState.tutar),
            kategori: editState.kategori,
            hesapId: parseInt(editState.hesapId),
            odemeGunu: parseInt(editState.odemeGunu),
            taksitSayisi: odeme.taksitSayisi ? parseInt(editState.taksitSayisi) : null
        });
        setIsEditing(false);
    };

    useEffect(() => {
        setEditState({ ...odeme });
    }, [isEditing, odeme]);

    const odemeHesabi = hesaplar.find(h => h.id === odeme.hesapId)?.ad || 'Belirtilmemiş';

    const handleTekilIsle = () => {
        const bekleyenOdeme = bekleyenOdemeler.find(b => b.id === odeme.id);
        if (bekleyenOdeme) {
            handleBekleyenOdemeleriIsle([bekleyenOdeme]);
        }
    };

    const handleAtla = () => {
        handleBekleyenOdemeyiAtla(odeme);
    };

    // --- DÜZENLEME MODU ---
    // Bu blok hem normal hem de bekleyen ödemeler için çalışacak
    if (isEditing) {
        return (
            <li className="ozellestir-liste-item ekleme-formu sabit-odeme-formu is-editing">
                <div className="sabit-odeme-form-icerik">
                    <div className="form-grup">
                        <label>Açıklama</label>
                        <input name="aciklama" value={editState.aciklama} onChange={(e) => setEditState(p => ({...p, aciklama: e.target.value}))} type="text" />
                    </div>
                     <div className="form-grup">
                        <label>Aylık Tutar</label>
                        <input name="tutar" value={editState.tutar} onChange={(e) => setEditState(p => ({...p, tutar: e.target.value}))} type="number" />
                    </div>
                    <div className="form-grup">
                        <label>Kategori</label>
                        <select name="kategori" value={editState.kategori} onChange={(e) => setEditState(p => ({...p, kategori: e.target.value}))}>
                            {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                        </select>
                    </div>
                    <div className="form-grup">
                        <label>Hesap</label>
                        <select name="hesapId" value={editState.hesapId} onChange={(e) => setEditState(p => ({...p, hesapId: parseInt(e.target.value)}))}>
                             {/* Düzeltme: Seçim için bir başlangıç değeri ekleyelim */}
                            <option value="" disabled>Hesap Seçiniz...</option>
                            {hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}
                        </select>
                    </div>
                    <div className="form-grup">
                        <label>Ödeme Günü</label>
                        <input name="odemeGunu" value={editState.odemeGunu} onChange={(e) => setEditState(p => ({...p, odemeGunu: e.target.value}))} type="number" />
                    </div>
                    {odeme.taksitSayisi != null && (
                        <div className="form-grup">
                            <label>Taksit Sayısı</label>
                            <input name="taksitSayisi" value={editState.taksitSayisi} onChange={(e) => setEditState(p => ({...p, taksitSayisi: e.target.value}))} type="number" />
                        </div>
                    )}
                </div>
                <div className="liste-item-aksiyonlar">
                    <button onClick={handleSave} className="icon-btn"><FaSave /></button>
                    <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                </div>
            </li>
        );
    }

    // --- GÖRÜNÜM MODU ---
    // Bu blok, ödemenin bekleyen olup olmamasına göre farklı buton setleri gösterecek
    return (
         <li className={`yonetim-listesi-item sabit-odeme-item ${isBekleyen ? 'bekleyen-odeme' : ''}`}>
            {isBekleyen && <FaExclamationCircle className="bekleyen-odeme-ikon" title="Bu ödemenin vadesi geçmiş ve gider olarak işlenmeyi bekliyor." />}
            <div className="sabit-odeme-orta">
                <span className="sabit-odeme-aciklama">{odeme.aciklama}</span>
                <div className="islem-etiketler">
                    <span className="islem-etiket">{odeme.kategori}</span>
                    <span className="islem-etiket">{odemeHesabi}</span>
                    <span className="islem-etiket tarih-etiketi">
                        {odeme.taksitSayisi ? `${odeme.taksitSayisi} Taksit (Ayın ${odeme.odemeGunu}. günü)` : `Abonelik (Ayın ${odeme.odemeGunu}. günü)`}
                    </span>
                </div>
            </div>
            <div className="sabit-odeme-sag">
                <span className="sabit-odeme-tutar">{formatCurrency(odeme.tutar)}</span>
                <div className="buton-grubu">
                    {isBekleyen ? (
                        <>
                            <button onClick={handleAtla} className="icon-btn ikincil-btn" title="Bu Ay Atla">Atla</button>
                            <button onClick={handleTekilIsle} className="icon-btn birincil-btn" title="Gider Olarak Ekle">Ekle</button>
                            {/* BEKLEYEN ÖDEMEYE DE DÜZENLEME VE SİLME BUTONLARI EKLENDİ */}
                            <button onClick={() => setIsEditing(true)} className="icon-btn duzenle-btn"><FaPen /></button>
                            <button onClick={() => handleSabitOdemeSil(odeme.id)} className="icon-btn sil-btn"><FaTrash /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="icon-btn duzenle-btn"><FaPen /></button>
                            <button onClick={() => handleSabitOdemeSil(odeme.id)} className="icon-btn sil-btn"><FaTrash /></button>
                        </>
                    )}
                </div>
            </div>
        </li>
    );
};


// Ana Sayfa Bileşeni (Değişiklik yok)
function SabitOdemeler() {
  const { sabitOdemeler, handleSabitOdemeEkle, giderKategorileri, bekleyenOdemeler, hesaplar, sabitOdemelerOzeti } = useFinans();
  const [isAdding, setIsAdding] = useState(false);
  const [odemeTipi, setOdemeTipi] = useState('abonelik');
  const [yeniOdeme, setYeniOdeme] = useState({
      aciklama: '',
      tutar: '',
      kategori: giderKategorileri[0] || '',
      hesapId: hesaplar[0]?.id || '',
      odemeGunu: '',
      baslangicTarihi: new Date().toISOString().split('T')[0],
      taksitSayisi: ''
  });

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setYeniOdeme(prev => ({ ...prev, [name]: value }));
  };
  const onEkle = () => {
    if (!yeniOdeme.aciklama || !yeniOdeme.tutar || !yeniOdeme.hesapId || !yeniOdeme.odemeGunu) {
        return toast.error("Lütfen Açıklama, Tutar, Hesap ve Ödeme Günü alanlarını doldurun.");
    }
    if (odemeTipi === 'taksit' && (!yeniOdeme.taksitSayisi || yeniOdeme.taksitSayisi <= 0)) {
        return toast.error("Taksitli ödeme için geçerli bir taksit sayısı girin.");
    }
    handleSabitOdemeEkle({
      ...yeniOdeme, tutar: parseFloat(yeniOdeme.tutar),
      hesapId: parseInt(yeniOdeme.hesapId), odemeGunu: parseInt(yeniOdeme.odemeGunu),
      taksitSayisi: odemeTipi === 'taksit' ? parseInt(yeniOdeme.taksitSayisi) : null,
    });
    setYeniOdeme({
        aciklama: '', tutar: '', kategori: giderKategorileri[0] || '',
        hesapId: hesaplar[0]?.id || '', odemeGunu: '',
        baslangicTarihi: new Date().toISOString().split('T')[0], taksitSayisi: ''
    });
    setOdemeTipi('abonelik');
    setIsAdding(false);
  };

  if (!sabitOdemeler || !giderKategorileri || !bekleyenOdemeler || !hesaplar || !sabitOdemelerOzeti) {
      return <div>Yükleniyor...</div>
  }
  
  const bekleyenOdemeIdleri = new Set(bekleyenOdemeler.map(odeme => odeme.id));
  const { enYakinOdeme } = sabitOdemelerOzeti;

  return (
    <>
        <div className="ozet-panosu-container">
            <div className="ozet-panosu-grid-sabit-odeme">
                <OzetKarti ikon={<FaFileInvoiceDollar />} deger={formatCurrency(sabitOdemelerOzeti.toplamAylikTaahhut)} baslik="Aylık Toplam Taahhüt"/>
                <OzetKarti ikon={<FaCalendarCheck />} deger={enYakinOdeme ? `${enYakinOdeme.aciklama} (${enYakinOdeme.kalanGun} gün)` : "-"} baslik="En Yakın Ödeme"/>
                <OzetKarti ikon={<FaPiggyBank />} deger={`${sabitOdemelerOzeti.aktifOdemeSayisi} adet`} baslik="Aktif Ödeme"/>
            </div>
        </div>
        
        <div className="card">
            <div className="card-header">
                <h2>Kayıtlı Sabit Ödemeler</h2>
            </div>
            <div className="ozellestir-icerik" style={{paddingTop: 0}}>
                <div className="ozellestir-liste">
                    {sabitOdemeler.length === 0 && !isAdding && (
                        <p className="liste-bos-mesaji">Henüz bir sabit ödeme eklemediniz.</p>
                    )}
                    {sabitOdemeler.map(odeme => (
                        <SabitOdemeListItem key={odeme.id} odeme={odeme} isBekleyen={bekleyenOdemeIdleri.has(odeme.id)} />
                    ))}
                    
                    {isAdding && (
                        <li className="ozellestir-liste-item ekleme-formu sabit-odeme-formu">
                            <div className="sabit-odeme-form-icerik">
                                <div className="form-grup odeme-tipi-grup">
                                    <label>Ödeme Tipi</label>
                                    <div className="odeme-tipi-secici">
                                        <button type="button" onClick={() => setOdemeTipi('abonelik')} className={odemeTipi === 'abonelik' ? 'aktif' : ''}>Abonelik</button>
                                        <button type="button" onClick={() => setOdemeTipi('taksit')} className={odemeTipi === 'taksit' ? 'aktif' : ''}>Taksit</button>
                                    </div>
                                </div>
                                <div className="form-grup">
                                    <label>Açıklama</label>
                                    <input name="aciklama" value={yeniOdeme.aciklama} onChange={handleInputChange} type="text" placeholder="Örn: Netflix"/>
                                </div>
                                <div className="form-grup">
                                    <label>Aylık Tutar</label>
                                    <input name="tutar" value={yeniOdeme.tutar} onChange={handleInputChange} type="number" placeholder="₺0,00"/>
                                </div>
                                <div className="form-grup">
                                    <label>Kategori</label>
                                    <select name="kategori" value={yeniOdeme.kategori} onChange={handleInputChange}>
                                        {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                                    </select>
                                </div>
                                <div className="form-grup">
                                    <label>Hesap</label>
                                    <select name="hesapId" value={yeniOdeme.hesapId} onChange={handleInputChange}>
                                        {hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}
                                    </select>
                                </div>
                                <div className="form-grup">
                                    <label>Ödeme Günü</label>
                                    <input name="odemeGunu" value={yeniOdeme.odemeGunu} onChange={handleInputChange} type="number" placeholder="1-31"/>
                                </div>
                                <AnimatePresence>
                                {odemeTipi === 'taksit' && (
                                    <motion.div className="form-grup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <label>Taksit Sayısı</label>
                                        <input name="taksitSayisi" value={yeniOdeme.taksitSayisi} onChange={handleInputChange} type="number" placeholder="Örn: 12"/>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                             <div className="liste-item-aksiyonlar">
                                <button onClick={onEkle} className="icon-btn"><FaSave /></button>
                                <button onClick={() => setIsAdding(false)} className="icon-btn"><FaTimes /></button>
                            </div>
                        </li>
                    )}
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="ekle-btn">
                        <FaPlus /> Yeni Sabit Ödeme Ekle
                    </button>
                )}
            </div>
        </div>
    </>
  );
}

export default SabitOdemeler;