// src/pages/islemler/IslemlerPage.jsx (TAMAMEN DOLDURULMUŞ NİHAİ VERSİYON)
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash, FaTag, FaWallet, FaCalendarAlt, FaExchangeAlt, FaFilter } from 'react-icons/fa';
import { useFinans } from '../../context/FinansContext';
import TarihSecici from '../../components/TarihSecici';
import { getCategoryIcon } from '../../utils/iconMap';

function IslemlerPage() {
    const {
        aktifIslemTipi, setAktifIslemTipi, handleSubmit, handleTransferSubmit,
        hesaplar, seciliHesapId, setSeciliHesapId,
        gelirDuzenlemeModu, setGelirDuzenlemeModu, setDuzenlenecekGelirId, gelirKategori, setGelirKategori, gelirKategorileri, gelirAciklama, setGelirAciklama, gelirTarih, setGelirTarih, gelirTutar, setGelirTutar, handleGelirVazgec,
        giderDuzenlemeModu, setGiderDuzenlemeModu, setDuzenlenecekGiderId, kategori, setKategori, giderKategorileri, aciklama, setAciklama, tarih, setTarih, tutar, setTutar, handleGiderVazgec,
        birlesikIslemler, handleGelirSil, handleGiderSil,
        toplamGelir, toplamGider,
        birlesikFiltreTip, setBirlesikFiltreTip, birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        transferDuzenlemeModu, setTransferDuzenlemeModu, setDuzenlenecekTransferId, handleTransferSil,
        filtreHesapId, setFiltreHesapId
    } = useFinans();

    const formRef = useRef(null);
    const [filtrePaneliAcik, setFiltrePaneliAcik] = useState(false);
    const [transferTutar, setTransferTutar] = useState('');
    const [gonderenHesapId, setGonderenHesapId] = useState(hesaplar[0]?.id || '');
    const [aliciHesapId, setAliciHesapId] = useState(hesaplar[1]?.id || '');
    const [transferTarih, setTransferTarih] = useState(() => new Date().toISOString().split('T')[0]);
    const [transferAciklama, setTransferAciklama] = useState('');

    if (!hesaplar || !birlesikIslemler) {
        return <div>Yükleniyor...</div>;
    }

    const listItemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }, };
    const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];

    const handleGiderDuzenleBaslat = (gider) => {
        setAktifIslemTipi('gider');
        setGiderDuzenlemeModu(true);
        setDuzenlenecekGiderId(gider.id);
        setAciklama(gider.aciklama);
        setTutar(gider.tutar);
        setKategori(gider.kategori);
        setTarih(gider.tarih);
        setSeciliHesapId(gider.hesapId);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleGelirDuzenleBaslat = (gelir) => {
        setAktifIslemTipi('gelir');
        setGelirDuzenlemeModu(true);
        setDuzenlenecekGelirId(gelir.id);
        setGelirAciklama(gelir.aciklama);
        setGelirTutar(gelir.tutar);
        setGelirKategori(gelir.kategori);
        setGelirTarih(gelir.tarih);
        setSeciliHesapId(gelir.hesapId);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTransferDuzenleBaslat = (transfer) => {
        setAktifIslemTipi('transfer');
        setTransferDuzenlemeModu(true);
        setDuzenlenecekTransferId(transfer.id);
        setTransferTutar(transfer.tutar);
        setGonderenHesapId(transfer.gonderenHesapId);
        setAliciHesapId(transfer.aliciHesapId);
        setTransferTarih(transfer.tarih);
        setTransferAciklama(transfer.aciklama);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTransferVazgec = () => {
        setTransferDuzenlemeModu(false);
        setDuzenlenecekTransferId(null);
        setTransferTutar('');
        setGonderenHesapId(hesaplar[0]?.id || '');
        setAliciHesapId(hesaplar[1]?.id || '');
        setTransferTarih(new Date().toISOString().split('T')[0]);
        setTransferAciklama('');
    };
    
    const handleLocalTransferSubmit = (e) => {
         e.preventDefault();
         handleTransferSubmit({ tutar: transferTutar, gonderenHesapId, aliciHesapId, tarih: transferTarih, aciklama: transferAciklama });
         if (transferDuzenlemeModu) {
             handleTransferVazgec();
         } else {
             setTransferTutar('');
             setTransferAciklama('');
         }
    };

    const handleFiltreTemizle = () => {
        setBirlesikFiltreTip('Tümü');
        setBirlesikFiltreKategori('Tümü');
        setFiltreHesapId('Tümü');
    };

    const FormContent = ({ isGelir }) => (
        <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-item-full"><label>Açıklama:</label><input type="text" placeholder={isGelir ? "Örn: Maaş" : "Örn: Akşam yemeği"} value={isGelir ? gelirAciklama : aciklama} onChange={(e) => isGelir ? setGelirAciklama(e.target.value) : setAciklama(e.target.value)} /></div>
            <div className="form-item-half"><label>Kategori:</label><select value={isGelir ? gelirKategori : kategori} onChange={(e) => isGelir ? setGelirKategori(e.target.value) : setKategori(e.target.value)}>{(isGelir ? gelirKategorileri : giderKategorileri).map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
            <div className="form-item-half"><label>Hesap:</label><select value={seciliHesapId} onChange={(e) => setSeciliHesapId(parseInt(e.target.value))}>{hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}</select></div>
            <div className="form-item-half"><label>Tutar (₺):</label><input type="number" placeholder="0.00" value={isGelir ? gelirTutar : tutar} onChange={(e) => isGelir ? setGelirTutar(e.target.value) : setTutar(e.target.value)} /></div>
            <div className="form-item-half"><label>Tarih:</label><input type="date" value={isGelir ? gelirTarih : tarih} onChange={(e) => isGelir ? setGelirTarih(e.target.value) : setTarih(e.target.value)} /></div>
            <div className="form-item-full form-buton-grubu"><button type="submit">{(isGelir ? gelirDuzenlemeModu : giderDuzenlemeModu) ? 'Güncelle' : 'Ekle'}</button>{(isGelir ? gelirDuzenlemeModu : giderDuzenlemeModu) && (<button type="button" onClick={isGelir ? handleGelirVazgec : handleGiderVazgec} className="vazgec-btn">Vazgeç</button>)}</div>
        </form>
    );

    return (
        <>
            <TarihSecici />
            <div className="card" ref={formRef}>
                <div className="islem-tipi-secici">
                    <button onClick={() => setAktifIslemTipi('gider')} className={aktifIslemTipi === 'gider' ? 'aktif' : ''}>Gider Ekle</button>
                    <button onClick={() => setAktifIslemTipi('gelir')} className={aktifIslemTipi === 'gelir' ? 'aktif' : ''}>Gelir Ekle</button>
                    <button onClick={() => setAktifIslemTipi('transfer')} className={aktifIslemTipi === 'transfer' ? 'aktif' : ''}>Transfer Ekle</button>
                </div>
                {aktifIslemTipi === 'gider' && <FormContent isGelir={false} />}
                {aktifIslemTipi === 'gelir' && <FormContent isGelir={true} />}
                {aktifIslemTipi === 'transfer' && (
                    <form onSubmit={handleLocalTransferSubmit} className="form-grid">
                        <div className="form-item-full"><label htmlFor="transfer-aciklama">Açıklama (Opsiyonel)</label><input id="transfer-aciklama" type="text" value={transferAciklama} onChange={(e) => setTransferAciklama(e.target.value)} placeholder="Örn: Kredi Kartı Borç Ödemesi"/></div>
                        <div className="form-item-half"><label htmlFor="gonderen-hesap">Gönderen Hesap</label><select id="gonderen-hesap" value={gonderenHesapId} onChange={(e) => setGonderenHesapId(parseInt(e.target.value))}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                        <div className="form-item-half"><label htmlFor="alici-hesap">Alıcı Hesap</label><select id="alici-hesap" value={aliciHesapId} onChange={(e) => setAliciHesapId(parseInt(e.target.value))}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                        <div className="form-item-half"><label htmlFor="transfer-tutar">Tutar (₺):</label><input id="transfer-tutar" type="number" value={transferTutar} onChange={(e) => setTransferTutar(e.target.value)} placeholder="0.00" /></div>
                        <div className="form-item-half"><label htmlFor="transfer-tarih">Tarih</label><input id="transfer-tarih" type="date" value={transferTarih} onChange={(e) => setTransferTarih(e.target.value)} /></div>
                        {aliciHesapId && hesaplar.find(h => h.id === aliciHesapId)?.ad.toLowerCase().includes('kredi') && (<div className="form-item-full form-ipucu">💡 **İpucu:** Kredi kartı borç ödemeleri bir gider değil, transfer işlemidir. Bu işlem, bir hesabınızdaki parayı kredi kartı borcunuzu kapatmak için kullanır.</div>)}
                        <div className="form-item-full form-buton-grubu">
                            <button type="submit">{transferDuzenlemeModu ? 'Güncelle' : 'Transferi Gerçekleştir'}</button>
                            {transferDuzenlemeModu && (<button type="button" onClick={handleTransferVazgec} className="vazgec-btn">Vazgeç</button>)}
                        </div>
                    </form>
                )}
            </div>
            <div className="card">
                <div className="liste-baslik">
                    <h2>İşlem Listesi</h2>
                    <button onClick={() => setFiltrePaneliAcik(!filtrePaneliAcik)} className="filtre-ac-btn">
                        <FaFilter /> Filtrele & Sırala
                    </button>
                </div>
                <AnimatePresence>
                    {filtrePaneliAcik && (
                        <motion.div
                            className="acilir-filtre-kutusu"
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: '1.5rem' }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="filtre-grid">
                                <div className="kontrol-grubu"><label>Tipe Göre Filtrele:</label><select value={birlesikFiltreTip} onChange={(e) => setBirlesikFiltreTip(e.target.value)}><option value="Tümü">Tümü</option><option value="gelir">Gelir</option><option value="gider">Gider</option><option value="transfer">Transfer</option></select></div>
                                <div className="kontrol-grubu"><label>Kategoriye Göre Filtrele:</label><select value={birlesikFiltreKategori} onChange={(e) => setBirlesikFiltreKategori(e.target.value)}><option value="Tümü">Tümü</option>{tumKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}</select></div>
                                <div className="kontrol-grubu"><label>Hesaba Göre Filtrele:</label><select value={filtreHesapId} onChange={(e) => setFiltreHesapId(e.target.value)}><option value="Tümü">Tümü</option>{hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}</select></div>
                                <div className="kontrol-grubu"><label>Sırala:</label><select value={birlesikSiralamaKriteri} onChange={(e) => setBirlesikSiralamaKriteri(e.target.value)}><option value="tarih-yeni">Tarihe Göre (En Yeni)</option><option value="tarih-eski">Tarihe Göre (En Eski)</option><option value="tutar-artan">Tutara Göre (Artan)</option><option value="tutar-azalan">Tutara Göre (Azalan)</option></select></div>
                            </div>
                            <button onClick={handleFiltreTemizle} className="filtre-temizle-btn">Filtreleri Temizle</button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="sayfa-ici-ozet">
                    <div className="ozet-kalem"><span>Aylık Toplam Gelir:</span><span className="gelir-renk">{toplamGelir.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span>Aylık Toplam Gider:</span><span className="gider-renk">{toplamGider.toFixed(2)} ₺</span></div>
                </div>
                <ul className="islem-listesi-yeni">
                    <AnimatePresence>
                        {birlesikIslemler.map(islem => {
                            const isGelir = islem.tip === 'gelir';
                            const isGider = islem.tip === 'gider';
                            const isTransfer = islem.tip === 'transfer';
                            const gonderenHesap = isTransfer ? hesaplar.find(h => h.id === islem.gonderenHesapId) : null;
                            const aliciHesap = isTransfer ? hesaplar.find(h => h.id === islem.aliciHesapId) : null;
                            const hesap = !isTransfer ? hesaplar.find(h => h.id === islem.hesapId) : null;

                            return (
                                <motion.li key={islem.id} layout variants={listItemVariants} initial="initial" animate="animate" exit="exit" className={isGelir ? 'islem-karti-gelir' : isGider ? 'islem-karti-gider' : 'islem-karti-transfer'}>
                                    <div className="islem-ikon">{getCategoryIcon(isTransfer ? 'Transfer' : islem.kategori)}</div>
                                    <div className="islem-orta">
                                        <span className="islem-aciklama">{isTransfer ? (islem.aciklama || "Hesaplar Arası Transfer") : islem.aciklama}</span>
                                        <div className="islem-etiketler">
                                            {isTransfer ? (<span className="islem-etiket transfer-etiketi"><FaExchangeAlt /> {`${gonderenHesap?.ad || '?'} → ${aliciHesap?.ad || '?'}`}</span>) : (<> <span className="islem-etiket kategori-etiketi"><FaTag /> {islem.kategori}</span> {hesap && (<span className="islem-etiket hesap-etiketi"><FaWallet /> {hesap.ad}</span>)} </>)}
                                            <span className="islem-etiket tarih-etiketi"><FaCalendarAlt /> {new Date(islem.tarih).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div className="islem-sag">
                                        <span className={`islem-tutar ${isGelir ? 'gelir-renk' : isGider ? 'gider-renk' : 'notr-renk'}`}>{isGelir && '+ '}{isGider && '- '}{islem.tutar.toFixed(2)} ₺</span>
                                        <div className="buton-grubu">
                                            {isTransfer ? (
                                                <>
                                                    <button onClick={() => handleTransferDuzenleBaslat(islem)} className="icon-btn duzenle-btn"><FaPen /></button>
                                                    <button onClick={() => handleTransferSil(islem.id)} className="icon-btn sil-btn"><FaTrash /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => isGelir ? handleGelirDuzenleBaslat(islem) : handleGiderDuzenleBaslat(islem)} className="icon-btn duzenle-btn"><FaPen /></button>
                                                    <button onClick={() => isGelir ? handleGelirSil(islem.id) : handleGiderSil(islem.id)} className="icon-btn sil-btn"><FaTrash /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
                {birlesikIslemler.length === 0 && ( <p style={{textAlign: "center", padding: "2rem", color: "var(--secondary-text)"}}>Bu ay için gösterilecek işlem bulunmuyor.</p> )}
            </div>
        </>
    );
}

export default IslemlerPage;