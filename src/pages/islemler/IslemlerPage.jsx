// src/pages/Islemler/IslemlerPage.jsx (NİHAİ VERSİYON)
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash, FaTag, FaWallet, FaCalendarAlt, FaExchangeAlt, FaFilter } from 'react-icons/fa';
import { useFinans } from '../../context/FinansContext';
import TarihSecici from '../../components/TarihSecici';
import { getCategoryIcon } from '../../utils/iconMap';
import { ISLEM_TURLERI, SIRALAMA_KRITERLERI } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const getBugununTarihi = () => new Date().toISOString().split('T')[0];

function IslemlerPage() {
    const {
        hesaplar, giderKategorileri, gelirKategorileri, addIslem, updateIslem, openDeleteModal,
        birlesikIslemler, toplamGelir, toplamGider, birlesikFiltreTip, setBirlesikFiltreTip,
        birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        birlesikFiltreHesap, setBirlesikFiltreHesap,
    } = useFinans();

    const [aktifIslemTipi, setAktifIslemTipi] = useState(ISLEM_TURLERI.GIDER);
    const [duzenlenecekIslem, setDuzenlenecekIslem] = useState(null);
    const [filtrePaneliAcik, setFiltrePaneliAcik] = useState(false);

    const [formVerisi, setFormVerisi] = useState({
        aciklama: '', tutar: '', kategori: giderKategorileri[0] || '', tarih: getBugununTarihi(),
        hesapId: hesaplar[0]?.id || '', gonderenHesapId: hesaplar[0]?.id || '',
        aliciHesapId: hesaplar[1]?.id || hesaplar[0]?.id || '',
    });

    const formRef = useRef(null);

    // DEĞİŞİKLİK: Bu useEffect'i sildik veya değiştirdik.
    // Artık sadece kategori listeleri değiştiğinde varsayılan kategoriyi ayarlıyoruz.
    useEffect(() => {
        if (!duzenlenecekIslem) {
            const varsayilanKategori = aktifIslemTipi === ISLEM_TURLERI.GIDER 
                ? giderKategorileri[0] 
                : gelirKategorileri[0];
            setFormVerisi(prev => ({ ...prev, kategori: varsayilanKategori }));
        }
    }, [giderKategorileri, gelirKategorileri, aktifIslemTipi, duzenlenecekIslem]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormVerisi(prev => ({ ...prev, [name]: value }));
    };

    const handleFormReset = () => {
        setDuzenlenecekIslem(null);
        setFormVerisi({
            aciklama: '', tutar: '',
            kategori: aktifIslemTipi === ISLEM_TURLERI.GIDER ? giderKategorileri[0] : gelirKategorileri[0],
            tarih: getBugununTarihi(), hesapId: hesaplar[0]?.id || '',
            gonderenHesapId: hesaplar[0]?.id || '', aliciHesapId: hesaplar[1]?.id || hesaplar[0]?.id || '',
        });
    };
    
    // YENİ FONKSİYON: Kullanıcı sekmelere manuel tıkladığında çalışır.
    const handleTabClick = (tip) => {
        setAktifIslemTipi(tip);
        handleFormReset(); // Formu sadece burada sıfırlıyoruz.
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { aciklama, tutar, kategori, tarih, hesapId, gonderenHesapId, aliciHesapId } = formVerisi;

        if (aktifIslemTipi === ISLEM_TURLERI.TRANSFER) {
            if (!tutar || !gonderenHesapId || !aliciHesapId || parseFloat(tutar) <= 0) return toast.error("Lütfen tüm transfer alanlarını doğru doldurun.");
            if (gonderenHesapId === aliciHesapId) return toast.error("Gönderen ve alıcı hesap aynı olamaz.");
            const transferVerisi = { tutar: parseFloat(tutar), gonderenHesapId: parseInt(gonderenHesapId), aliciHesapId: parseInt(aliciHesapId), tarih, aciklama: aciklama || "Hesaplar Arası Transfer", tip: ISLEM_TURLERI.TRANSFER };
            if (duzenlenecekIslem) {
                updateIslem(ISLEM_TURLERI.TRANSFER, duzenlenecekIslem.id, transferVerisi);
            } else {
                addIslem(ISLEM_TURLERI.TRANSFER, transferVerisi);
            }
        } else {
            if (!aciklama || !tutar || !kategori || !hesapId || parseFloat(tutar) <= 0) return toast.error("Lütfen tüm alanları doğru doldurun.");
            const islemVerisi = { aciklama, tutar: parseFloat(tutar), kategori, tarih, hesapId: parseInt(hesapId) };
            if (duzenlenecekIslem) {
                updateIslem(aktifIslemTipi, duzenlenecekIslem.id, islemVerisi);
            } else {
                addIslem(aktifIslemTipi, islemVerisi);
            }
        }
        handleFormReset();
    };

    const handleDuzenleBaslat = (islem) => {
        setAktifIslemTipi(islem.tip); // Sekmeyi değiştir
        setDuzenlenecekIslem(islem); // Düzenleme moduna al
        
        // Formu doldur
        if (islem.tip === ISLEM_TURLERI.TRANSFER) {
             setFormVerisi({
                aciklama: islem.aciklama || '', tutar: islem.tutar, tarih: islem.tarih,
                gonderenHesapId: islem.gonderenHesapId, aliciHesapId: islem.aliciHesapId,
                kategori: '', hesapId: '',
            });
        } else {
            setFormVerisi({
                aciklama: islem.aciklama, tutar: islem.tutar, kategori: islem.kategori,
                tarih: islem.tarih, hesapId: islem.hesapId,
                gonderenHesapId: '', aliciHesapId: '',
            });
        }
        
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!hesaplar || !birlesikIslemler) return <div className="sayfa-yukleniyor">Yükleniyor...</div>;

    const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];
    const handleFiltreTemizle = () => { setBirlesikFiltreTip(ISLEM_TURLERI.TUMU); setBirlesikFiltreKategori('Tümü'); setBirlesikFiltreHesap('Tümü'); };
    const listItemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }, };
    const isEditing = duzenlenecekIslem !== null;

    return (
        <>
            <TarihSecici />
            <div className="card" ref={formRef}>
                <div className="islem-tipi-secici">
                    {/* DEĞİŞİKLİK: onClick olaylarını yeni fonksiyona bağladık */}
                    <button onClick={() => handleTabClick(ISLEM_TURLERI.GIDER)} className={aktifIslemTipi === ISLEM_TURLERI.GIDER ? 'aktif' : ''}>Gider</button>
                    <button onClick={() => handleTabClick(ISLEM_TURLERI.GELIR)} className={aktifIslemTipi === ISLEM_TURLERI.GELIR ? 'aktif' : ''}>Gelir</button>
                    <button onClick={() => handleTabClick(ISLEM_TURLERI.TRANSFER)} className={aktifIslemTipi === ISLEM_TURLERI.TRANSFER ? 'aktif' : ''}>Transfer</button>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">
                    <AnimatePresence mode="wait">
                        <motion.div key={aktifIslemTipi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: "contents" }}>
                            {aktifIslemTipi === ISLEM_TURLERI.GIDER && (
                                <>
                                    <div className="form-item-full"><label>Açıklama:</label><input name="aciklama" type="text" placeholder="Örn: Akşam yemeği" value={formVerisi.aciklama} onChange={handleInputChange} /></div>
                                    <div className="form-item-half"><label>Kategori:</label><select name="kategori" value={formVerisi.kategori} onChange={handleInputChange}>{giderKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
                                    <div className="form-item-half"><label>Hesap:</label><select name="hesapId" value={formVerisi.hesapId} onChange={handleInputChange}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                                </>
                            )}
                            {aktifIslemTipi === ISLEM_TURLERI.GELIR && (
                                <>
                                    <div className="form-item-full"><label>Açıklama:</label><input name="aciklama" type="text" placeholder="Örn: Maaş" value={formVerisi.aciklama} onChange={handleInputChange} /></div>
                                    <div className="form-item-half"><label>Kategori:</label><select name="kategori" value={formVerisi.kategori} onChange={handleInputChange}>{gelirKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
                                    <div className="form-item-half"><label>Hesap:</label><select name="hesapId" value={formVerisi.hesapId} onChange={handleInputChange}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                                </>
                            )}
                            {aktifIslemTipi === ISLEM_TURLERI.TRANSFER && (
                                 <>
                                    <div className="form-item-full"><label>Açıklama (İsteğe Bağlı):</label><input name="aciklama" type="text" placeholder="Örn: Kredi Kartı Borcu" value={formVerisi.aciklama} onChange={handleInputChange} /></div>
                                    <div className="form-item-half"><label>Gönderen Hesap:</label><select name="gonderenHesapId" value={formVerisi.gonderenHesapId} onChange={handleInputChange}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                                    <div className="form-item-half"><label>Alıcı Hesap:</label><select name="aliciHesapId" value={formVerisi.aliciHesapId} onChange={handleInputChange}>{hesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                                </>
                            )}
                            <div className="form-item-half"><label>Tutar (₺):</label><input name="tutar" type="number" placeholder="0.00" value={formVerisi.tutar} onChange={handleInputChange} /></div>
                            <div className="form-item-half"><label>Tarih:</label><input name="tarih" type="date" value={formVerisi.tarih} onChange={handleInputChange} /></div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="form-item-full form-buton-grubu">
                        <button type="submit">{isEditing ? 'Güncelle' : (aktifIslemTipi === ISLEM_TURLERI.TRANSFER ? 'Transfer Et' : 'Ekle')}</button>
                        {isEditing && (<button type="button" onClick={handleFormReset} className="vazgec-btn">Vazgeç</button>)}
                    </div>
                </form>
            </div>
            
            {/* İşlem Listesi (Bu bölümde değişiklik yok) */}
            <div className="card">
                <div className="liste-baslik"><h2>İşlem Listesi</h2><button onClick={() => setFiltrePaneliAcik(!filtrePaneliAcik)} className="filtre-ac-btn"><FaFilter /> Filtrele & Sırala</button></div>
                <AnimatePresence>{filtrePaneliAcik && (<motion.div className="acilir-filtre-kutusu" initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: '1.5rem' }} exit={{ height: 0, opacity: 0, marginTop: 0 }}><div className="filtre-grid"><div className="kontrol-grubu"><label>Tipe Göre Filtrele:</label><select value={birlesikFiltreTip} onChange={(e) => setBirlesikFiltreTip(e.target.value)}><option value={ISLEM_TURLERI.TUMU}>Tümü</option><option value={ISLEM_TURLERI.GELIR}>Gelir</option><option value={ISLEM_TURLERI.GIDER}>Gider</option><option value={ISLEM_TURLERI.TRANSFER}>Transfer</option></select></div><div className="kontrol-grubu"><label>Kategoriye Göre Filtrele:</label><select value={birlesikFiltreKategori} onChange={(e) => setBirlesikFiltreKategori(e.target.value)}><option value="Tümü">Tümü</option>{tumKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}</select></div><div className="kontrol-grubu"><label>Hesaba Göre Filtrele:</label><select value={birlesikFiltreHesap} onChange={(e) => setBirlesikFiltreHesap(e.target.value === 'Tümü' ? 'Tümü' : parseInt(e.target.value))}><option value="Tümü">Tümü</option>{hesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}</select></div><div className="kontrol-grubu"><label>Sırala:</label><select value={birlesikSiralamaKriteri} onChange={(e) => setBirlesikSiralamaKriteri(e.target.value)}><option value={SIRALAMA_KRITERLERI.TARIH_YENI}>Tarihe Göre (En Yeni)</option><option value={SIRALAMA_KRITERLERI.TARIH_ESKI}>Tarihe Göre (En Eski)</option><option value={SIRALAMA_KRITERLERI.TUTAR_ARTAN}>Tutara Göre (Artan)</option><option value={SIRALAMA_KRITERLERI.TUTAR_AZALAN}>Tutara Göre (Azalan)</option></select></div></div><button onClick={handleFiltreTemizle} className="filtre-temizle-btn">Filtreleri Temizle</button></motion.div>)}</AnimatePresence>
                <div className="sayfa-ici-ozet"><div className="ozet-kalem"><span>Aylık Toplam Gelir:</span><span className="gelir-renk">{formatCurrency(toplamGelir)}</span></div><div className="ozet-kalem"><span>Aylık Toplam Gider:</span><span className="gider-renk">{formatCurrency(toplamGider)}</span></div></div>
                <ul className="islem-listesi-yeni">
                    <AnimatePresence>
                        {birlesikIslemler.map(islem => {
                            const isTransfer = islem.tip === ISLEM_TURLERI.TRANSFER;
                            const gonderenHesap = isTransfer ? hesaplar.find(h => h.id === islem.gonderenHesapId) : null;
                            const aliciHesap = isTransfer ? hesaplar.find(h => h.id === islem.aliciHesapId) : null;
                            const hesap = !isTransfer ? hesaplar.find(h => h.id === islem.hesapId) : null;
                            return (<motion.li key={islem.id} layout variants={listItemVariants} initial="initial" animate="animate" exit="exit" className={`islem-karti-${islem.tip}`}><div className="islem-ikon">{getCategoryIcon(isTransfer ? 'Transfer' : islem.kategori)}</div><div className="islem-orta"><span className="islem-aciklama">{isTransfer ? (islem.aciklama || "Hesaplar Arası Transfer") : islem.aciklama}</span><div className="islem-etiketler">{isTransfer ? (<span className="islem-etiket transfer-etiketi"><FaExchangeAlt /> {`${gonderenHesap?.ad || '?'} → ${aliciHesap?.ad || '?'}`}</span>) : (<> <span className="islem-etiket kategori-etiketi"><FaTag /> {islem.kategori}</span> {hesap && (<span className="islem-etiket hesap-etiketi"><FaWallet /> {hesap.ad}</span>)} </>)}<span className="islem-etiket tarih-etiketi"><FaCalendarAlt /> {new Date(islem.tarih).toLocaleDateString('tr-TR')}</span></div></div><div className="islem-sag"><span className={`islem-tutar ${islem.tip === 'gelir' ? 'gelir-renk' : islem.tip === 'gider' ? 'gider-renk' : 'notr-renk'}`}>{formatCurrency(islem.tutar)}</span><div className="buton-grubu"><button onClick={() => handleDuzenleBaslat(islem)} className="icon-btn duzenle-btn"><FaPen /></button><button onClick={() => openDeleteModal(islem.id, islem.tip)} className="icon-btn sil-btn"><FaTrash /></button></div></div></motion.li>);
                        })}
                    </AnimatePresence>
                </ul>
                {birlesikIslemler.length === 0 && (<p style={{ textAlign: "center", padding: "2rem", color: "var(--secondary-text)" }}>Bu ay için gösterilecek işlem bulunmuyor.</p>)}
            </div>
        </>
    );
}

export default IslemlerPage;