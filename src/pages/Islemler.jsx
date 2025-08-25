import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash } from 'react-icons/fa';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';

function Islemler() {
  const {
    aktifIslemTipi, setAktifIslemTipi, handleSubmit,
    hesaplar, seciliHesapId, setSeciliHesapId,
    gelirDuzenlemeModu, gelirKategori, setGelirKategori, gelirKategorileri, gelirAciklama, setGelirAciklama, gelirTarih, setGelirTarih, gelirTutar, setGelirTutar, handleGelirVazgec,
    giderDuzenlemeModu, kategori, setKategori, giderKategorileri, aciklama, setAciklama, tarih, setTarih, tutar, setTutar, handleGiderVazgec,
    birlesikIslemler, handleGelirDuzenleBaslat, handleGelirSil, handleGiderDuzenleBaslat, handleGiderSil,
    toplamGelir, toplamGider,
    birlesikFiltreTip, setBirlesikFiltreTip, birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
  } = useFinans();

  const [filtrePaneliAcik, setFiltrePaneliAcik] = useState(false);
  
  if (!hesaplar || !birlesikIslemler) {
      return <div>Yükleniyor...</div>;
  }

  const listItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];

  return (
    <div className="tek-sutun-layout">
      <TarihSecici />
      
      <div className="bolum">
        <div className="islem-tipi-secici">
          <button onClick={() => setAktifIslemTipi('gelir')} className={aktifIslemTipi === 'gelir' ? 'aktif' : ''}>Gelir</button>
          <button onClick={() => setAktifIslemTipi('gider')} className={aktifIslemTipi === 'gider' ? 'aktif' : ''}>Gider</button>
        </div>
        {aktifIslemTipi === 'gelir' ? (
          <form onSubmit={handleSubmit}>
            <h2>{gelirDuzenlemeModu ? 'Geliri Güncelle' : 'Yeni Gelir Ekle'}</h2>
            <div><label>Kategori:</label><select value={gelirKategori} onChange={(e) => setGelirKategori(e.target.value)}>{gelirKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
            <div>
                <label>Hesap:</label>
                <select value={seciliHesapId} onChange={(e) => setSeciliHesapId(parseInt(e.target.value))}>
                    {hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}
                </select>
            </div>
            <div><label>Açıklama:</label><input type="text" placeholder="Örn: Maaş" value={gelirAciklama} onChange={(e) => setGelirAciklama(e.target.value)} /></div>
            <div><label>Tarih:</label><input type="date" value={gelirTarih} onChange={(e) => setGelirTarih(e.target.value)} /></div>
            <div><label>Tutar (₺):</label><input type="number" placeholder="Örn: 20000" value={gelirTutar} onChange={(e) => setGelirTutar(e.target.value)} /></div>
            <div className="form-buton-grubu">
              <button type="submit">{gelirDuzenlemeModu ? 'Güncelle' : 'Ekle'}</button>
              {gelirDuzenlemeModu && (<button type="button" onClick={handleGelirVazgec} className="vazgec-btn">Vazgeç</button>)}
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>{giderDuzenlemeModu ? 'Gideri Güncelle' : 'Yeni Gider Ekle'}</h2>
            <div><label>Kategori:</label><select value={kategori} onChange={(e) => setKategori(e.target.value)}>{giderKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
            <div>
                <label>Hesap:</label>
                <select value={seciliHesapId} onChange={(e) => setSeciliHesapId(parseInt(e.target.value))}>
                    {hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}
                </select>
            </div>
            <div><label>Açıklama:</label><input type="text" placeholder="Örn: Kahve" value={aciklama} onChange={(e) => setAciklama(e.target.value)} /></div>
            <div><label>Tarih:</label><input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} /></div>
            <div><label>Tutar (₺):</label><input type="number" placeholder="Örn: 50" value={tutar} onChange={(e) => setTutar(e.target.value)} /></div>
            <div className="form-buton-grubu">
              <button type="submit">{giderDuzenlemeModu ? 'Güncelle' : 'Ekle'}</button>
              {giderDuzenlemeModu && (<button type="button" onClick={handleGiderVazgec} className="vazgec-btn">Vazgeç</button>)}
            </div>
          </form>
        )}
      </div>

      <div className="bolum">
        <hr />
        <div className="liste-baslik">
          <h2>İşlem Listesi</h2>
          <button onClick={() => setFiltrePaneliAcik(!filtrePaneliAcik)} className="filtre-buton">Filtrele & Sırala</button>
        </div>
        <AnimatePresence>
          {filtrePaneliAcik && (
            <motion.div className="filtre-siralama-kutusu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Filtreleme içeriği burada */}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="sayfa-ici-ozet">
          <div className="ozet-kalem"><span>Toplam Gelir:</span><span className="gelir-renk">{toplamGelir.toFixed(2)} ₺</span></div>
          <div className="ozet-kalem"><span>Toplam Gider:</span><span className="gider-renk">{toplamGider.toFixed(2)} ₺</span></div>
        </div>
        {birlesikIslemler.length === 0 ? (
          <p style={{textAlign: "center", fontStyle: "italic", color: "#7f8c8d"}}>Seçili ayda gösterilecek işlem bulunmuyor.</p> 
        ) : (
          <ul>
            <AnimatePresence>
              {birlesikIslemler.map(islem => {
                const hesap = hesaplar.find(h => h.id === islem.hesapId);
                return (
                <motion.li key={islem.id} layout variants={listItemVariants} initial="initial" animate="animate" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`islem-karti ${islem.tip === 'gelir' ? 'gelir-karti' : 'gider-karti'}`}>
                  <div className="aciklama-kategori">
                    <span>{islem.aciklama}</span>
                    <span className={`kategori-etiketi ${islem.tip === 'gelir' ? 'gelir-etiketi' : ''}`}>{islem.kategori}</span>
                    {hesap && <span className="hesap-etiketi">{hesap.ad}</span>}
                    <span className="tarih-etiketi">{new Date(islem.tarih).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <span className={`tutar-yazisi ${islem.tip === 'gelir' ? 'gelir-renk' : 'gider-renk'}`}>{islem.tip === 'gelir' ? '+' : '-'} {islem.tutar.toFixed(2)} ₺</span>
                  <div className="buton-grubu">
                    <button onClick={() => islem.tip === 'gelir' ? handleGelirDuzenleBaslat(islem) : handleGiderDuzenleBaslat(islem)} className="duzenle-btn icon-btn" aria-label="Düzenle"><FaPen /></button>
                    <button onClick={() => islem.tip === 'gelir' ? handleGelirSil(islem.id) : handleGiderSil(islem.id)} className="icon-btn" aria-label="Sil"><FaTrash /></button>
                  </div>
                </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Islemler;