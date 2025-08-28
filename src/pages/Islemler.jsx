// src/pages/Islemler.jsx (TÜM HATALARI DÜZELTİLMİŞ)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash } from 'react-icons/fa';
import { useFinans } from '../context/FinansContext';
import TarihSecici from '../components/TarihSecici';
import { getCategoryIcon } from '../utils/iconMap';

function Islemler() {
    // useFinans'tan gelen tüm değerler
    const {
        aktifIslemTipi, setAktifIslemTipi, handleSubmit, handleTransferSubmit,
        hesaplar, seciliHesapId, setSeciliHesapId,
        gelirDuzenlemeModu, gelirKategori, setGelirKategori, gelirKategorileri, gelirAciklama, setGelirAciklama, gelirTarih, setGelirTarih, gelirTutar, setGelirTutar, handleGelirVazgec,
        giderDuzenlemeModu, kategori, setKategori, giderKategorileri, aciklama, setAciklama, tarih, setTarih, tutar, setTutar, handleGiderVazgec,
        birlesikIslemler, handleGelirDuzenleBaslat, handleGelirSil, handleGiderDuzenleBaslat, handleGiderSil,
        toplamGelir, toplamGider,
        birlesikFiltreTip, setBirlesikFiltreTip, birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri
    } = useFinans();

    // Transfer formu için state'ler
    const [transferTutar, setTransferTutar] = useState('');
    const [gonderenHesapId, setGonderenHesapId] = useState(hesaplar[0]?.id || '');
    const [aliciHesapId, setAliciHesapId] = useState(hesaplar[1]?.id || '');
    const [transferTarih, setTransferTarih] = useState(() => new Date().toISOString().split('T')[0]);
    const [transferAciklama, setTransferAciklama] = useState('');

    if (!hesaplar || !birlesikIslemler) {
        return <div>Yükleniyor...</div>;
    }

    const listItemVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
    };

    const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];

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

    const handleLocalTransferSubmit = (e) => {
        e.preventDefault();
        handleTransferSubmit({ tutar: transferTutar, gonderenHesapId, aliciHesapId, tarih: transferTarih, aciklama: transferAciklama });
        setTransferTutar('');
        setTransferAciklama('');
    };

    return (
        <>
            <TarihSecici />
            <div className="card">
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
                        <div className="form-item-half"><label htmlFor="transfer-tutar">Tutar (₺)</label><input id="transfer-tutar" type="number" value={transferTutar} onChange={(e) => setTransferTutar(e.target.value)} placeholder="0.00" /></div>
                        <div className="form-item-half"><label htmlFor="transfer-tarih">Tarih</label><input id="transfer-tarih" type="date" value={transferTarih} onChange={(e) => setTransferTarih(e.target.value)} /></div>
                        {aliciHesapId && hesaplar.find(h => h.id === aliciHesapId)?.ad.toLowerCase().includes('kredi') && (<div className="form-item-full form-ipucu">💡 **İpucu:** Kredi kartı borç ödemeleri bir gider değil, transfer işlemidir. Bu işlem, bir hesabınızdaki parayı kredi kartı borcunuzu kapatmak için kullanır.</div>)}
                        <div className="form-item-full form-buton-grubu"><button type="submit">Transferi Gerçekleştir</button></div>
                    </form>
                )}
            </div>

            <div className="card">
               <div className="liste-baslik"><h2>İşlem Listesi</h2></div>
                <div className="filtre-siralama-kutusu">
                    <div className="kontrol-grubu"><label>Tipe Göre Filtrele:</label><select value={birlesikFiltreTip} onChange={(e) => setBirlesikFiltreTip(e.target.value)}><option value="Tümü">Tümü</option><option value="gelir">Gelir</option><option value="gider">Gider</option></select></div>
                    <div className="kontrol-grubu"><label>Kategoriye Göre Filtrele:</label><select value={birlesikFiltreKategori} onChange={(e) => setBirlesikFiltreKategori(e.target.value)}><option value="Tümü">Tümü</option>{tumKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}</select></div>
                    <div className="kontrol-grubu"><label>Sırala:</label><select value={birlesikSiralamaKriteri} onChange={(e) => setBirlesikSiralamaKriteri(e.target.value)}><option value="tarih-yeni">Tarihe Göre (En Yeni)</option><option value="tarih-eski">Tarihe Göre (En Eski)</option><option value="tutar-artan">Tutara Göre (Artan)</option><option value="tutar-azalan">Tutara Göre (Azalan)</option></select></div>
                </div>
                <div className="sayfa-ici-ozet">
                    <div className="ozet-kalem"><span>Aylık Toplam Gelir:</span><span className="gelir-renk">{toplamGelir.toFixed(2)} ₺</span></div>
                    <div className="ozet-kalem"><span>Aylık Toplam Gider:</span><span className="gider-renk">{toplamGider.toFixed(2)} ₺</span></div>
                </div>
                <ul className="islem-listesi-yeni">
                    <AnimatePresence>
                        {birlesikIslemler.map(islem => {
                            const hesap = hesaplar.find(h => h.id === islem.hesapId);
                            const isGelir = islem.tip === 'gelir';
                            return (
                                <motion.li key={islem.id} layout variants={listItemVariants} initial="initial" animate="animate" exit="exit" className={isGelir ? 'islem-karti-gelir' : 'islem-karti-gider'}>
                                    <div className="islem-ikon">{getCategoryIcon(islem.kategori)}</div>
                                    <div className="islem-orta">
                                        <span className="islem-aciklama">{islem.aciklama}</span>
                                        <div className="islem-etiketler">
                                            <span className="islem-etiket">{islem.kategori}</span>
                                            {hesap && <span className="islem-etiket">{hesap.ad}</span>}
                                            <span className="islem-etiket tarih-etiketi">{new Date(islem.tarih).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div className="islem-sag">
                                        <span className={`islem-tutar ${isGelir ? 'gelir-renk' : 'gider-renk'}`}>{isGelir ? '+' : '-'} {islem.tutar.toFixed(2)} ₺</span>
                                        <div className="buton-grubu">
                                            <button onClick={() => isGelir ? handleGelirDuzenleBaslat(islem) : handleGiderDuzenleBaslat(islem)} className="icon-btn duzenle-btn"><FaPen /></button>
                                            <button onClick={() => isGelir ? handleGelirSil(islem.id) : handleGiderSil(islem.id)} className="icon-btn sil-btn"><FaTrash /></button>
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

export default Islemler;