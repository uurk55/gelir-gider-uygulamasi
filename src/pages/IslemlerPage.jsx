// src/pages/IslemlerPage.jsx (Arama Çubuğu Eklendi)

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// YENİ: Arama ikonu eklendi
import { FaPen, FaTrash, FaTag, FaWallet, FaCalendarAlt, FaExchangeAlt, FaFilter, FaCheckSquare, FaSquare, FaCopy, FaSearch } from 'react-icons/fa';
import { useFinans } from '../context/FinansContext';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { tr } from 'date-fns/locale';
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, startOfYear, endOfYear, format } from 'date-fns';
import { getCategoryIcon } from '../utils/iconMap';
import { ISLEM_TURLERI, SIRALAMA_KRITERLERI } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const getBugununTarihi = () => new Date().toISOString().split('T')[0];

const predefinedRanges = [
    { label: 'Bugün', range: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
    { label: 'Dün', range: () => ({ startDate: startOfDay(addDays(new Date(), -1)), endDate: endOfDay(addDays(new Date(), -1)) }) },
    { label: 'Bu Hafta', range: () => ({ startDate: startOfWeek(new Date(), { locale: tr }), endDate: endOfWeek(new Date(), { locale: tr }) }) },
    { label: 'Bu Ay', range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
    { label: 'Bu Yıl', range: () => ({ startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) }) },
    { label: 'Önceki Ay', range: () => ({ startDate: startOfMonth(addDays(startOfMonth(new Date()), -1)), endDate: endOfMonth(addDays(startOfMonth(new Date()), -1)) }) }
];

function IslemlerPage() {
    // DEĞİŞİKLİK: Context'ten arama state'leri çekildi
    const {
        hesaplar, tumHesaplar, giderKategorileri, gelirKategorileri, addIslem, updateIslem, openDeleteModal, handleTopluSil,
        birlesikIslemler, birlesikFiltreTip, setBirlesikFiltreTip,
        birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        birlesikFiltreHesap, setBirlesikFiltreHesap,
        tarihAraligi, setTarihAraligi,
        aramaMetni, setAramaMetni // YENİ
    } = useFinans();

    const [aktifIslemTipi, setAktifIslemTipi] = useState(ISLEM_TURLERI.GIDER);
    const [duzenlenecekIslem, setDuzenlenecekIslem] = useState(null);
    const [filtrePaneliAcik, setFiltrePaneliAcik] = useState(false);
    const [secimModu, setSecimModu] = useState(false);
    const [secilenIslemler, setSecilenIslemler] = useState([]);
    const [isTakvimOpen, setIsTakvimOpen] = useState(false);
    const [geciciTarihAraligi, setGeciciTarihAraligi] = useState(tarihAraligi);

    const [formVerisi, setFormVerisi] = useState({
        aciklama: '', tutar: '', kategori: giderKategorileri[0] || '', tarih: getBugununTarihi(),
        hesapId: tumHesaplar[0]?.id || '',
        gonderenHesapId: hesaplar[0]?.id || '',
        aliciHesapId: hesaplar[1]?.id || hesaplar[0]?.id || '',
    });

    const formRef = useRef(null);

    useEffect(() => {
        const bugun = new Date();
        const baslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
        const bitis = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0);

        setTarihAraligi([{
            startDate: baslangic,
            endDate: bitis,
            key: 'selection'
        }]);
    }, [setTarihAraligi]);

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

    const handleTabClick = (tip) => {
        setAktifIslemTipi(tip);
        handleFormReset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { aciklama, tutar, kategori, tarih, hesapId, gonderenHesapId, aliciHesapId } = formVerisi;
        if (aktifIslemTipi === ISLEM_TURLERI.TRANSFER) {
            if (!tutar || !gonderenHesapId || !aliciHesapId || parseFloat(tutar) <= 0) return toast.error("Lütfen tüm transfer alanlarını doğru doldurun.");
            if (gonderenHesapId === aliciHesapId) return toast.error("Gönderen ve alıcı hesap aynı olamaz.");
            const transferVerisi = { tutar: parseFloat(tutar), gonderenHesapId: gonderenHesapId, aliciHesapId: aliciHesapId, tarih, aciklama: aciklama || "Hesaplar Arası Transfer", tip: ISLEM_TURLERI.TRANSFER };
            if (duzenlenecekIslem) {
                updateIslem(ISLEM_TURLERI.TRANSFER, duzenlenecekIslem.id, transferVerisi);
            } else {
                addIslem(ISLEM_TURLERI.TRANSFER, transferVerisi);
            }
        } else {
            if (!aciklama || !tutar || !kategori || !hesapId || parseFloat(tutar) <= 0) return toast.error("Lütfen tüm alanları doğru doldurun.");
            const islemVerisi = { aciklama, tutar: parseFloat(tutar), kategori, tarih, hesapId: hesapId };

            if (duzenlenecekIslem) {
                updateIslem(aktifIslemTipi, duzenlenecekIslem.id, islemVerisi);
            } else {
                addIslem(aktifIslemTipi, islemVerisi);
            }
        }
        handleFormReset();
    };

    const handleDuzenleBaslat = (islem) => {
        setAktifIslemTipi(islem.tip);
        setDuzenlenecekIslem(islem);
        if (islem.tip === ISLEM_TURLERI.TRANSFER) {
            setFormVerisi({ aciklama: islem.aciklama || '', tutar: islem.tutar, tarih: islem.tarih, gonderenHesapId: islem.gonderenHesapId, aliciHesapId: islem.aliciHesapId, kategori: '', hesapId: '' });
        } else {
            setFormVerisi({ aciklama: islem.aciklama, tutar: islem.tutar, kategori: islem.kategori, tarih: islem.tarih, hesapId: islem.hesapId, gonderenHesapId: '', aliciHesapId: '' });
        }
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleIslemKopyala = (islem) => {
        setAktifIslemTipi(islem.tip);
        setDuzenlenecekIslem(null);
        if (islem.tip === ISLEM_TURLERI.TRANSFER) {
             setFormVerisi({ aciklama: islem.aciklama || '', tutar: islem.tutar, tarih: getBugununTarihi(), gonderenHesapId: islem.gonderenHesapId, aliciHesapId: islem.aliciHesapId, kategori: '', hesapId: '' });
        } else {
            setFormVerisi({ aciklama: islem.aciklama, tutar: islem.tutar, kategori: islem.kategori, tarih: getBugununTarihi(), hesapId: islem.hesapId, gonderenHesapId: '', aliciHesapId: '' });
        }
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
        toast.success(`'${islem.aciklama}' kopyalandı. Tarihi kontrol edip ekleyebilirsiniz.`);
    };

    const handleSecimModuToggle = () => {
        setSecimModu(!secimModu);
        setSecilenIslemler([]);
    };

    const handleIslemSec = (islem) => {
        setSecilenIslemler(prev =>
            prev.some(item => item.id === islem.id)
                ? prev.filter(item => item.id !== islem.id)
                : [...prev, { id: islem.id, tip: islem.tip }]
        );
    };

    const handleTumunuSec = () => {
        if (secilenIslemler.length === birlesikIslemler.length) {
            setSecilenIslemler([]);
        } else {
            setSecilenIslemler(birlesikIslemler.map(islem => ({ id: islem.id, tip: islem.tip })));
        }
    };

    const handleSecilenleriSil = () => {
        if (secilenIslemler.length === 0) return;
        const eminMisin = window.confirm(`${secilenIslemler.length} adet işlemi silmek istediğinizden emin misiniz?`);
        if (eminMisin) {
            handleTopluSil(secilenIslemler);
            setSecimModu(false);
            setSecilenIslemler([]);
        }
    };

    const handleFiltreTemizle = () => {
        setBirlesikFiltreTip(ISLEM_TURLERI.TUMU);
        setBirlesikFiltreKategori('Tümü');
        setBirlesikFiltreHesap('Tümü');
        setAramaMetni(''); // YENİ: Filtreleri temizlerken aramayı da temizle
    };

    const formatTarihAraligi = () => {
        const { startDate, endDate } = tarihAraligi[0];
        if (!startDate || !endDate) return "Tarih Aralığı Seç";
        return `${format(startDate, 'd MMM yyyy', { locale: tr })} - ${format(endDate, 'd MMM yyyy', { locale: tr })}`;
    };
    
    const handleTakvimAc = () => {
        setGeciciTarihAraligi(tarihAraligi);
        setIsTakvimOpen(true);
    };

    const handleTakvimKaydet = () => {
        setTarihAraligi(geciciTarihAraligi);
        setIsTakvimOpen(false);
    };

    const handleTakvimIptal = () => {
        setIsTakvimOpen(false);
    };

    if (!hesaplar || !birlesikIslemler) return <div className="sayfa-yukleniyor">Yükleniyor...</div>;

    const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];
    const listItemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }, };
    const isEditing = duzenlenecekIslem !== null;
    const birseySeciliMi = secilenIslemler.length > 0;
    const isFormDolu = isEditing || formVerisi.aciklama || formVerisi.tutar;

    const filtrelenmisToplamGelir = birlesikIslemler.filter(i => i.tip === 'gelir').reduce((acc, i) => acc + i.tutar, 0);
    const filtrelenmisToplamGider = birlesikIslemler.filter(i => i.tip === 'gider').reduce((acc, i) => acc + i.tutar, 0);
    const netDurum = filtrelenmisToplamGelir - filtrelenmisToplamGider;
    // 🔹 Aktif filtre / arama özetlerini hazırlayan küçük yardımcı yapı
    const aktifFiltreler = [];

    if (birlesikFiltreTip !== ISLEM_TURLERI.TUMU) {
        let tipEtiketi = 'Tümü';
        if (birlesikFiltreTip === ISLEM_TURLERI.GELIR) tipEtiketi = 'Gelir';
        if (birlesikFiltreTip === ISLEM_TURLERI.GIDER) tipEtiketi = 'Gider';
        if (birlesikFiltreTip === ISLEM_TURLERI.TRANSFER) tipEtiketi = 'Transfer';
        aktifFiltreler.push({ label: 'Tip', value: tipEtiketi });
    }

    if (birlesikFiltreKategori !== 'Tümü') {
        aktifFiltreler.push({ label: 'Kategori', value: birlesikFiltreKategori });
    }

    if (birlesikFiltreHesap !== 'Tümü') {
        const hesap = tumHesaplar.find(h => h.id === birlesikFiltreHesap);
        aktifFiltreler.push({ label: 'Hesap', value: hesap?.ad || 'Seçili hesap' });
    }

    if (aramaMetni && aramaMetni.trim() !== '') {
        aktifFiltreler.push({ label: 'Arama', value: `"${aramaMetni.trim()}"` });
    }

    const toplamIslemSayisi = birlesikIslemler.length;

    return (
        <>
            <AnimatePresence>
                {isTakvimOpen && (
                    <motion.div className="modal-overlay" onClick={handleTakvimIptal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content date-range-modal" onClick={(e) => e.stopPropagation()} initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}>
                            <DateRangePicker
                                onChange={item => setGeciciTarihAraligi([item.selection])}
                                showSelectionPreview={true}
                                moveRangeOnFirstSelection={false}
                                months={2}
                                ranges={geciciTarihAraligi}
                                direction="horizontal"
                                locale={tr}
                                staticRanges={predefinedRanges.map(range => ({ ...range, isSelected() { return false; } }))}
                                inputRanges={[]}
                            />
                            <div className="modal-actions">
                                <button onClick={handleTakvimIptal} className="cancel-btn">İptal</button>
                                <button onClick={handleTakvimKaydet} className="primary-btn">Tamam</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card" ref={formRef}>
                <div className="islem-tipi-secici">
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
                                    <div className="form-item-half"><label>Hesap:</label><select name="hesapId" value={formVerisi.hesapId} onChange={handleInputChange}>{tumHesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
                                </>
                            )}
                            {aktifIslemTipi === ISLEM_TURLERI.GELIR && (
                                <>
                                    <div className="form-item-full"><label>Açıklama:</label><input name="aciklama" type="text" placeholder="Örn: Maaş" value={formVerisi.aciklama} onChange={handleInputChange} /></div>
                                    <div className="form-item-half"><label>Kategori:</label><select name="kategori" value={formVerisi.kategori} onChange={handleInputChange}>{gelirKategorileri.map(k => (<option key={k} value={k}>{k}</option>))}</select></div>
                                    <div className="form-item-half"><label>Hesap:</label><select name="hesapId" value={formVerisi.hesapId} onChange={handleInputChange}>{tumHesaplar.map(h => (<option key={h.id} value={h.id}>{h.ad}</option>))}</select></div>
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
                        {isFormDolu && (<button type="button" onClick={handleFormReset} className="vazgec-btn">Vazgeç</button>)}
                    </div>
                </form>
            </div>
            
            <div className="card">
                <div className="liste-baslik">
                    <h2>İşlem Listesi</h2>
                    {/* DEĞİŞİKLİK: Arama çubuğu eklendi */}
                    <div className="liste-eylemler">
                        <div className="arama-kutusu">
                            <FaSearch className="arama-ikonu" />
                            <input
                                type="search"
                                placeholder="Açıklamalarda ara..."
                                value={aramaMetni}
                                onChange={(e) => setAramaMetni(e.target.value)}
                            />
                        </div>
                        <button onClick={handleTakvimAc} className="filtre-ac-btn">
                            <FaCalendarAlt />
                            <span>{formatTarihAraligi()}</span>
                        </button>
                        <button onClick={() => setFiltrePaneliAcik(!filtrePaneliAcik)} className="filtre-ac-btn"><FaFilter /> Diğer Filtreler</button>
                        <button onClick={handleSecimModuToggle} className="filtre-ac-btn">{secimModu ? 'İptal' : 'Seç'}</button>
                    </div>
                </div>
                
                <AnimatePresence>
                    {filtrePaneliAcik && (
                        <motion.div className="acilir-filtre-kutusu" initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: '1.5rem' }} exit={{ height: 0, opacity: 0, marginTop: 0 }}>
                            <div className="filtre-grid">
                                <div className="kontrol-grubu"><label>Tipe Göre Filtrele:</label><select value={birlesikFiltreTip} onChange={(e) => setBirlesikFiltreTip(e.target.value)}><option value={ISLEM_TURLERI.TUMU}>Tümü</option><option value={ISLEM_TURLERI.GELIR}>Gelir</option><option value={ISLEM_TURLERI.GIDER}>Gider</option><option value={ISLEM_TURLERI.TRANSFER}>Transfer</option></select></div>
                                <div className="kontrol-grubu"><label>Kategoriye Göre Filtrele:</label><select value={birlesikFiltreKategori} onChange={(e) => setBirlesikFiltreKategori(e.target.value)}><option value="Tümü">Tümü</option>{tumKategoriler.map(kat => (<option key={kat} value={kat}>{kat}</option>))}</select></div>
                                <div className="kontrol-grubu"><label>Hesaba Göre Filtrele:</label><select value={birlesikFiltreHesap} onChange={(e) => setBirlesikFiltreHesap(e.target.value)}><option value="Tümü">Tümü</option>{tumHesaplar.map(hesap => (<option key={hesap.id} value={hesap.id}>{hesap.ad}</option>))}</select></div>
                                <div className="kontrol-grubu"><label>Sırala:</label><select value={birlesikSiralamaKriteri} onChange={(e) => setBirlesikSiralamaKriteri(e.target.value)}><option value={SIRALAMA_KRITERLERI.TARIH_YENI}>Tarihe Göre (En Yeni)</option><option value={SIRALAMA_KRITERLERI.TARIH_ESKI}>Tarihe Göre (En Eski)</option><option value={SIRALAMA_KRITERLERI.TUTAR_ARTAN}>Tutara Göre (Artan)</option><option value={SIRALAMA_KRITERLERI.TUTAR_AZALAN}>Tutara Göre (Azalan)</option></select></div>
                            </div>
                            <button onClick={handleFiltreTemizle} className="filtre-temizle-btn">Tüm Filtreleri Temizle</button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {secimModu && (
                        <motion.div className="secim-eylem-cubugu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            <button onClick={handleTumunuSec} className="secim-eylem-btn">
                                {secilenIslemler.length === birlesikIslemler.length ? <FaCheckSquare /> : <FaSquare />}
                                {secilenIslemler.length === birlesikIslemler.length ? ' Seçimi Kaldır' : ' Tümünü Seç'}
                            </button>
                            <span>{secilenIslemler.length} adet seçildi</span>
                            <button onClick={handleSecilenleriSil} className="danger-btn" disabled={!birseySeciliMi}>
                                <FaTrash /> Seçilenleri Sil
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="sayfa-ici-ozet">
                    <div className="ozet-kalem"><span>Toplam Gelir:</span><span className="gelir-renk">{formatCurrency(filtrelenmisToplamGelir)}</span></div>
                    <div className="ozet-kalem"><span>Toplam Gider:</span><span className="gider-renk">{formatCurrency(filtrelenmisToplamGider)}</span></div>
                    <div className="ozet-kalem"><span>Net Durum:</span><span className={netDurum >= 0 ? 'gelir-renk' : 'gider-renk'}>{formatCurrency(netDurum)}</span></div>
                </div>

                {/* 🔹 Yeni: Liste özeti + aktif filtre chipleri */}
                <div className="liste-ozet-cubugu">
                    <span className="liste-ozet-sayi">
                        {toplamIslemSayisi} işlem listeleniyor
                    </span>

                    {aktifFiltreler.length > 0 && (
                        <div className="aktif-filtre-chips">
                            {aktifFiltreler.map((f, i) => (
                                <span key={i} className="filtre-chip">
                                    <span className="filtre-chip-label">{f.label}:</span>
                                    <span className="filtre-chip-value">{f.value}</span>
                                </span>
                            ))}

                            <button
                                type="button"
                                onClick={handleFiltreTemizle}
                                className="filtre-chip-temizle"
                            >
                                Filtreleri temizle
                            </button>
                        </div>
                    )}
                </div>
                
                <ul className={`islem-listesi-yeni ${secimModu && birseySeciliMi ? 'secim-modu-aktif' : ''}`}>
                    <AnimatePresence>
                        {birlesikIslemler.map(islem => {
                            const isTransfer = islem.tip === ISLEM_TURLERI.TRANSFER;
                            const gonderenHesap = isTransfer ? hesaplar.find(h => h.id === islem.gonderenHesapId) : null;
                            const aliciHesap = isTransfer ? hesaplar.find(h => h.id === islem.aliciHesapId) : null;
                            const hesap = !isTransfer ? tumHesaplar.find(h => h.id === islem.hesapId) : null;
                            const isSelected = secilenIslemler.some(item => item.id === islem.id);

                            return (
                                <motion.li 
                                    key={islem.id} 
                                    layout 
                                    variants={listItemVariants} 
                                    initial="initial" 
                                    animate="animate" 
                                    exit="exit" 
                                    onClick={() => secimModu && handleIslemSec(islem)}
                                    className={`islem-karti-${islem.tip} ${secimModu ? 'secilebilir' : ''} ${isSelected ? 'secili' : ''}`}
                                >
                                    {secimModu && (
                                        <div className="secim-kutusu">
                                            {isSelected ? <FaCheckSquare /> : <FaSquare />}
                                        </div>
                                    )}
                                    <div className="islem-ikon">{getCategoryIcon(isTransfer ? 'Transfer' : islem.kategori)}</div>
                                    <div className="islem-orta">
                                        <span className="islem-aciklama">{isTransfer ? (islem.aciklama || "Hesaplar Arası Transfer") : islem.aciklama}</span>
                                        <div className="islem-etiketler">
                                            {isTransfer ? (<span className="islem-etiket transfer-etiketi"><FaExchangeAlt /> {`${gonderenHesap?.ad || '?'} → ${aliciHesap?.ad || '?'}`}</span>) : (<> <span className="islem-etiket kategori-etiketi"><FaTag /> {islem.kategori}</span> {hesap && (<span className="islem-etiket hesap-etiketi"><FaWallet /> {hesap.ad}</span>)} </>)}
                                            <span className="islem-etiket tarih-etiketi"><FaCalendarAlt /> {new Date(islem.tarih).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                    <div className="islem-sag">
                                        <span className={`islem-tutar ${islem.tip === 'gelir' ? 'gelir-renk' : islem.tip === 'gider' ? 'gider-renk' : 'notr-renk'}`}>{formatCurrency(islem.tutar)}</span>
                                        {!secimModu && (
                                            <div className="buton-grubu">
                                                <button onClick={() => handleIslemKopyala(islem)} className="icon-btn" title="Bu işlemi kopyala"><FaCopy /></button>
                                                <button onClick={() => handleDuzenleBaslat(islem)} className="icon-btn duzenle-btn"><FaPen /></button>
                                                <button onClick={() => openDeleteModal(islem.id, islem.tip)} className="icon-btn sil-btn"><FaTrash /></button>
                                            </div>
                                        )}
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
                {birlesikIslemler.length === 0 && (<p style={{ textAlign: "center", padding: "2rem", color: "var(--secondary-text)" }}>Seçilen kriterlere uygun işlem bulunmuyor.</p>)}
            </div>
        </>
    );
}

export default IslemlerPage;