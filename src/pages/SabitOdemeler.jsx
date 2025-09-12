// src/pages/SabitOdemeler.jsx (NİHAİ VE TAM VERSİYON)

import { useState, useEffect } from 'react';
import { FaTrash, FaPen, FaSave, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useFinans } from '../context/FinansContext';
import { useAuth } from '../context/AuthContext'; // YENİ: AuthContext'i import ediyoruz
import { formatCurrency } from '../utils/formatters';

// Her bir liste elemanını yönetecek alt bileşen
const SabitOdemeListItem = ({ odeme, isBekleyen }) => {
    // handleBekleyenOdemeyiAtla fonksiyonunu da context'ten çekiyoruz
    const { 
        handleSabitOdemeSil, 
        handleSabitOdemeGuncelle, 
        giderKategorileri, 
        hesaplar, 
        handleBekleyenOdemeleriIsle,
        handleBekleyenOdemeyiAtla,
        bekleyenOdemeler // YENİ: Tam listeyi çekiyoruz
    } = useFinans();
    const { currentUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState({ ...odeme });

    const handleSave = () => { /* ... (içerik aynı) ... */ };
    useEffect(() => { /* ... (içerik aynı) ... */ }, [isEditing, odeme]);
    
    const odemeHesabi = hesaplar.find(h => h.id === odeme.hesapId)?.ad || 'Belirtilmemiş';

    const handleTekilIsle = () => {
        // HATA DÜZELTMESİ: Ham 'odeme' objesi yerine, 'bekleyenOdemeler' listesinden
        // 'islenecekTarih' içeren doğru objeyi bulup gönderiyoruz.
        const bekleyenOdeme = bekleyenOdemeler.find(b => b.id === odeme.id);
        if (bekleyenOdeme) {
            handleBekleyenOdemeleriIsle([bekleyenOdeme]);
        }
    };
    
    const handleAtla = () => {
        handleBekleyenOdemeyiAtla(odeme);
    };

    if (isBekleyen) {
        // ... (return bloğu aynı, sadece handleBuAyAtla'yı handleAtla olarak değiştir)
        return (
             <li className="yonetim-listesi-item sabit-odeme-item bekleyen-odeme">
                <FaExclamationCircle className="bekleyen-odeme-ikon" title="Bu ödemenin vadesi geçmiş ve gider olarak işlenmeyi bekliyor." />
                <div className="sabit-odeme-orta">
                    <span className="sabit-odeme-aciklama">{odeme.aciklama}</span>
                    <div className="islem-etiketler">
                        <span className="islem-etiket">{odeme.kategori}</span>
                        <span className="islem-etiket">{odemeHesabi}</span>
                    </div>
                </div>
                <div className="sabit-odeme-sag">
                    <span className="sabit-odeme-tutar">{formatCurrency(odeme.tutar)}</span>
                    <div className="buton-grubu">
                        <button onClick={handleAtla} className="icon-btn ikincil-btn" title="Bu Ay Atla">Atla</button>
                        <button onClick={handleTekilIsle} className="icon-btn birincil-btn" title="Gider Olarak Ekle">Ekle</button>
                    </div>
                </div>
            </li>
        )
    }

    if (isEditing) {
        return (
            <li className="yonetim-listesi-item sabit-odeme-item is-editing">
                 <div className="sabit-odeme-orta">
                     <input type="text" value={editState.aciklama} onChange={e => setEditState({...editState, aciklama: e.target.value})} placeholder="Açıklama" />
                     <div className="islem-etiketler">
                        <select value={editState.kategori} onChange={e => setEditState({...editState, kategori: e.target.value})}>
                             {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
                        </select>
                        <select value={editState.hesapId} onChange={e => setEditState({...editState, hesapId: e.target.value})}>
                             {hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}
                        </select>
                        <input type="number" value={editState.odemeGunu} onChange={e => setEditState({...editState, odemeGunu: e.target.value})} placeholder="Gün" style={{width: '70px'}}/>
                     </div>
                 </div>
                 <div className="sabit-odeme-sag">
                    <input type="number" value={editState.tutar} onChange={e => setEditState({...editState, tutar: e.target.value})} placeholder="Tutar" style={{width: '100px'}} />
                    <button onClick={handleSave} className="icon-btn duzenle-btn"><FaSave /></button>
                 </div>
            </li>
        );
    }

    return (
        <li className="yonetim-listesi-item sabit-odeme-item">
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
                    <button onClick={() => setIsEditing(true)} className="icon-btn duzenle-btn"><FaPen /></button>
                    <button onClick={() => handleSabitOdemeSil(odeme.id)} className="icon-btn sil-btn"><FaTrash /></button>
                </div>
            </div>
        </li>
    );
};

function SabitOdemeler() {
  const { sabitOdemeler, handleSabitOdemeEkle, giderKategorileri, bekleyenOdemeler, hesaplar } = useFinans();
  const getBugununTarihi = () => new Date().toISOString().split('T')[0];
  
  const [aciklama, setAciklama] = useState('');
  const [tutar, setTutar] = useState('');
  const [kategori, setKategori] = useState(giderKategorileri[0]);
  const [hesapId, setHesapId] = useState(hesaplar[0]?.id || '');
  const [odemeGunu, setOdemeGunu] = useState(1);
  const [baslangicTarihi, setBaslangicTarihi] = useState(getBugununTarihi());
  const [taksitSayisi, setTaksitSayisi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!aciklama || !tutar || !hesapId) {
        return toast.error("Lütfen Açıklama, Tutar ve Hesap alanlarını doldurun.");
    }
    handleSabitOdemeEkle({
      aciklama,
      tutar: parseFloat(tutar),
      kategori,
      hesapId: parseInt(hesapId),
      odemeGunu: parseInt(odemeGunu),
      baslangicTarihi,
      taksitSayisi: taksitSayisi > 0 ? parseInt(taksitSayisi) : null,
    });
    setAciklama(''); setTutar(''); setKategori(giderKategorileri[0]);
    setHesapId(hesaplar[0]?.id || ''); setOdemeGunu(1); 
    setBaslangicTarihi(getBugununTarihi()); setTaksitSayisi('');
  };

  if (!sabitOdemeler || !giderKategorileri || !bekleyenOdemeler || !hesaplar) {
      return <div>Yükleniyor...</div>
  }
  
  const bekleyenOdemeIdleri = new Set(bekleyenOdemeler.map(odeme => odeme.id));

  return (
    <div className="card">
      <div className="card-header">
        <h2>Sabit Ödemeleri Yönet</h2>
      </div>
      <div className="yonetim-sayfasi-layout">
        <div className="bolum">
          <h3>Yeni Sabit Ödeme Ekle</h3>
          <form onSubmit={handleSubmit} className="form-modern form-grid">
            <div className="form-item-full">
              <label htmlFor="odeme-aciklama">Açıklama</label>
              <input id="odeme-aciklama" type="text" placeholder="Örn: Ev Kredisi, Netflix" value={aciklama} onChange={(e) => setAciklama(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label htmlFor="odeme-kategori">Kategori</label>
              <select id="odeme-kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                {giderKategorileri.map(kat => (<option key={kat} value={kat}>{kat}</option>))}
              </select>
            </div>
             <div className="form-item-half">
              <label htmlFor="odeme-hesap">Hangi Hesaptan Ödenecek?</label>
              <select id="odeme-hesap" value={hesapId} onChange={(e) => setHesapId(e.target.value)}>
                {hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}
              </select>
            </div>
            <div className="form-item-half">
              <label htmlFor="odeme-tutar">Aylık Tutar (₺)</label>
              <input id="odeme-tutar" type="number" placeholder="Örn: 150" value={tutar} onChange={(e) => setTutar(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label htmlFor="odeme-baslangic">İlk Ödeme Tarihi</label>
              <input id="odeme-baslangic" type="date" value={baslangicTarihi} onChange={(e) => setBaslangicTarihi(e.target.value)} />
            </div>
            <div className="form-item-half">
              <label htmlFor="odeme-gunu">Ödeme Günü (1-31)</label>
              <input id="odeme-gunu" type="number" min="1" max="31" value={odemeGunu} onChange={(e) => setOdemeGunu(e.target.value)} />
            </div>
            <div className="form-item-full">
              <label htmlFor="odeme-taksit">Toplam Taksit Sayısı (Abonelik için boş)</label>
              <input id="odeme-taksit" type="number" min="1" placeholder="Örn: 12, 24, 36" value={taksitSayisi} onChange={(e) => setTaksitSayisi(e.target.value)} />
            </div>
            <div className="form-item-full">
              <button type="submit" className="primary-btn" style={{width: '100%'}}>Ekle</button>
            </div>
          </form>
        </div>
        <div className="bolum">
          <h3>Kayıtlı Sabit Ödemeler</h3>
          {sabitOdemeler.length === 0 ? <p style={{marginTop: '1rem', color: 'var(--secondary-text)'}}>Kayıtlı sabit ödeme bulunmuyor.</p> : (
            <ul className="yonetim-listesi">
              {sabitOdemeler.map(odeme => (
                <SabitOdemeListItem key={odeme.id} odeme={odeme} isBekleyen={bekleyenOdemeIdleri.has(odeme.id)} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SabitOdemeler;