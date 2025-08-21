import { motion, AnimatePresence } from 'framer-motion';

function Islemler(props) {
  const {
    aktifIslemTipi, setAktifIslemTipi, handleSubmit,
    gelirDuzenlemeModu, gelirKategori, setGelirKategori, gelirKategorileri, gelirAciklama, setGelirAciklama, gelirTarih, setGelirTarih, gelirTutar, setGelirTutar, handleGelirVazgec,
    giderDuzenlemeModu, kategori, setKategori, giderKategorileri, aciklama, setAciklama, tarih, setTarih, tutar, setTutar, handleGiderVazgec,
    birlesikIslemler, handleGelirDuzenleBaslat, handleGelirSil, handleGiderDuzenleBaslat, handleGiderSil
  } = props;

  const listItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="tek-sutun-layout">
      <div className="bolum">
        <div className="islem-tipi-secici">
          <button onClick={() => setAktifIslemTipi('gelir')} className={aktifIslemTipi === 'gelir' ? 'aktif' : ''}>
            Gelir
          </button>
          <button onClick={() => setAktifIslemTipi('gider')} className={aktifIslemTipi === 'gider' ? 'aktif' : ''}>
            Gider
          </button>
        </div>

        {aktifIslemTipi === 'gelir' ? (
          <form onSubmit={handleSubmit}>
            <h2>{gelirDuzenlemeModu ? 'Geliri Güncelle' : 'Yeni Gelir Ekle'}</h2>
            <div><label>Kategori:</label><select value={gelirKategori} onChange={(e) => setGelirKategori(e.target.value)}>{gelirKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
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
        <h2>İşlem Listesi</h2>
        {birlesikIslemler.length === 0 ? (
          <p style={{textAlign: "center", fontStyle: "italic", color: "#7f8c8d"}}>
            Seçili ayda gösterilecek işlem bulunmuyor.
          </p> 
        ) : (
          <ul>
            <AnimatePresence>
              {birlesikIslemler.map(islem => (
                <motion.li 
                  key={islem.id} 
                  layout 
                  variants={listItemVariants} 
                  initial="initial" 
                  animate="animate" 
                  exit="exit" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`islem-karti ${islem.tip === 'gelir' ? 'gelir-karti' : 'gider-karti'}`}
                >
                  <div className="aciklama-kategori">
                    <span>{islem.aciklama}</span>
                    <span className={`kategori-etiketi ${islem.tip === 'gelir' ? 'gelir-etiketi' : ''}`}>{islem.kategori}</span>
                    <span className="tarih-etiketi">{new Date(islem.tarih).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <span className={`tutar-yazisi ${islem.tip === 'gelir' ? 'gelir-renk' : 'gider-renk'}`}>
                    {islem.tip === 'gelir' ? '+' : '-'} {islem.tutar.toFixed(2)} ₺
                  </span>
                  <div className="buton-grubu">
                    <button 
                      onClick={() => islem.tip === 'gelir' ? handleGelirDuzenleBaslat(islem) : handleGiderDuzenleBaslat(islem)} 
                      className="duzenle-btn"
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => islem.tip === 'gelir' ? handleGelirSil(islem.id) : handleGiderSil(islem.id)}
                    >
                      Sil
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Islemler;