import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';

const FinansContext = createContext();

const GIDER_KATEGORILERI_VARSAYILAN = ["Market", "Fatura", "Ulaşım", "Eğlence", "Sağlık", "Kira", "Kredi", "Abonelik", "Diğer"];
const GELIR_KATEGORILERI_VARSAYILAN = ["Maaş", "Ek Gelir", "Hediye", "Diğer"];
const VARSAYILAN_HESAPLAR = [
    { id: 1, ad: 'Nakit' },
    { id: 2, ad: 'Banka Hesabı' },
];

export const FinansProvider = ({ children }) => {
    const getBugununTarihi = () => new Date().toISOString().split('T')[0];

    const [giderKategorileri, setGiderKategorileri] = useState(() => JSON.parse(localStorage.getItem('giderKategorileri')) || GIDER_KATEGORILERI_VARSAYILAN);
    const [gelirKategorileri, setGelirKategorileri] = useState(() => JSON.parse(localStorage.getItem('gelirKategorileri')) || GELIR_KATEGORILERI_VARSAYILAN);
    const [giderler, setGiderler] = useState(() => JSON.parse(localStorage.getItem('giderler')) || []);
    const [gelirler, setGelirler] = useState(() => JSON.parse(localStorage.getItem('gelirler')) || []);
    const [sabitOdemeler, setSabitOdemeler] = useState(() => JSON.parse(localStorage.getItem('sabitOdemeler')) || []);
    const [butceler, setButceler] = useState(() => JSON.parse(localStorage.getItem('butceler')) || []);
    const [hesaplar, setHesaplar] = useState(() => JSON.parse(localStorage.getItem('hesaplar')) || VARSAYILAN_HESAPLAR);
    const [aciklama, setAciklama] = useState('');
    const [tutar, setTutar] = useState('');
    const [kategori, setKategori] = useState(giderKategorileri[0]);
    const [tarih, setTarih] = useState(getBugununTarihi());
    const [gelirAciklama, setGelirAciklama] = useState('');
    const [gelirTutar, setGelirTutar] = useState('');
    const [gelirKategori, setGelirKategori] = useState(gelirKategorileri[0]);
    const [gelirTarih, setGelirTarih] = useState(getBugununTarihi());
    const [giderDuzenlemeModu, setGiderDuzenlemeModu] = useState(false);
    const [duzenlenecekGiderId, setDuzenlenecekGiderId] = useState(null);
    const [gelirDuzenlemeModu, setGelirDuzenlemeModu] = useState(false);
    const [duzenlenecekGelirId, setDuzenlenecekGelirId] = useState(null);
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [onayBekleyenAbonelikler, setOnayBekleyenAbonelikler] = useState([]);
    const [aktifIslemTipi, setAktifIslemTipi] = useState('gider');
    const [giderFiltreKategori, setGiderFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState('Tümü');
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState('tarih-yeni');
    // YENİ EKLENEN STATE
    const [seciliHesapId, setSeciliHesapId] = useState(hesaplar[0]?.id || 1);

    useEffect(() => { localStorage.setItem('giderler', JSON.stringify(giderler)); }, [giderler]);
    useEffect(() => { localStorage.setItem('gelirler', JSON.stringify(gelirler)); }, [gelirler]);
    useEffect(() => { localStorage.setItem('sabitOdemeler', JSON.stringify(sabitOdemeler)); }, [sabitOdemeler]);
    useEffect(() => { localStorage.setItem('butceler', JSON.stringify(butceler)); }, [butceler]);
    useEffect(() => { localStorage.setItem('giderKategorileri', JSON.stringify(giderKategorileri)); }, [giderKategorileri]);
    useEffect(() => { localStorage.setItem('gelirKategorileri', JSON.stringify(gelirKategorileri)); }, [gelirKategorileri]);
    useEffect(() => { localStorage.setItem('hesaplar', JSON.stringify(hesaplar)); }, [hesaplar]);

    // YENİ EKLENEN EFFECT (Veri Güncelleme)
    useEffect(() => {
        const migrateData = (items, setItems) => {
            let updated = false;
            const migratedItems = items.map(item => {
                if (item.hesapId === undefined || item.hesapId === null) {
                    updated = true;
                    return { ...item, hesapId: hesaplar[0]?.id || 1 }; 
                }
                return item;
            });
            if (updated) {
                setItems(migratedItems);
            }
        };
        if (hesaplar.length > 0) {
            migrateData(giderler, setGiderler);
            migrateData(gelirler, setGelirler);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hesaplar]);

    useEffect(() => {
        const kontrolTarihi = new Date(seciliYil, seciliAy - 1, 1);
        const eklenecekOtomatikGiderler = [];
        sabitOdemeler.forEach(odeme => { if (!odeme.taksitSayisi) return; const baslangicTarihi = new Date(odeme.baslangicTarihi); const bitisTarihi = new Date(baslangicTarihi); bitisTarihi.setMonth(bitisTarihi.getMonth() + odeme.taksitSayisi); if (kontrolTarihi >= baslangicTarihi && kontrolTarihi < bitisTarihi) { const odemeTarihiStr = `${seciliYil}-${String(seciliAy).padStart(2, '0')}-${String(odeme.odemeGunu).padStart(2, '0')}`; const aylarFarki = (seciliYil - baslangicTarihi.getFullYear()) * 12 + (seciliAy - (baslangicTarihi.getMonth() + 1)); const kacinciTaksit = aylarFarki + 1; const aciklamaText = `${odeme.aciklama} (${kacinciTaksit}/${odeme.taksitSayisi})`; const zatenEklenmisMi = giderler.some(gider => gider.kaynakId === odeme.id && gider.tarih === odemeTarihiStr); if (!zatenEklenmisMi) { eklenecekOtomatikGiderler.push({ id: Date.now() + Math.random(), aciklama: aciklamaText, tutar: odeme.tutar, kategori: odeme.kategori, tarih: odemeTarihiStr, otomatikMi: true, kaynakId: odeme.id, hesapId: hesaplar[0]?.id || 1 }); } } });
        if (eklenecekOtomatikGiderler.length > 0) { setGiderler(prevGiderler => [...prevGiderler, ...eklenecekOtomatikGiderler]); toast.success(`${eklenecekOtomatikGiderler.length} adet taksitli ödeme giderlere eklendi!`, { icon: '🤖' }); }
    }, [seciliAy, seciliYil, sabitOdemeler, giderler, hesaplar]);

    useEffect(() => {
        const kontrolTarihi = new Date(seciliYil, seciliAy - 1, 1);
        const yaklasanAbonelikler = [];
        sabitOdemeler.forEach(odeme => { if (odeme.taksitSayisi) return; const baslangicTarihi = new Date(odeme.baslangicTarihi); if (kontrolTarihi >= baslangicTarihi) { const zatenEklenmisMi = giderler.some(gider => gider.kaynakId === odeme.id && gider.tarih.startsWith(`${seciliYil}-${String(seciliAy).padStart(2, '0')}`)); if (!zatenEklenmisMi) { yaklasanAbonelikler.push(odeme); } } });
        setOnayBekleyenAbonelikler(yaklasanAbonelikler);
    }, [seciliAy, seciliYil, sabitOdemeler, giderler]);

    // GÜNCELLENEN FONKSİYONLAR
    const handleSubmit = (e) => {
        e.preventDefault();
        if (aktifIslemTipi === 'gider') {
            if (!aciklama || !tutar || !kategori || !seciliHesapId) { toast.error("Lütfen tüm alanları doldurun."); return; }
            if (giderDuzenlemeModu) { 
                setGiderler(giderler.map(g => g.id === duzenlenecekGiderId ? { ...g, aciklama, tutar: parseFloat(tutar), kategori, tarih, hesapId: seciliHesapId } : g)); 
                toast.success('Gider başarıyla güncellendi!'); 
            } else {
                const yeniGider = { id: Date.now(), aciklama, tutar: parseFloat(tutar), kategori, tarih, hesapId: seciliHesapId };
                setGiderler(prevGiderler => [...prevGiderler, yeniGider]);
                toast.success('Gider başarıyla eklendi!');
            }
            handleGiderVazgec();
        } else {
            if (!gelirAciklama || !gelirTutar || !gelirKategori || !seciliHesapId) { toast.error("Lütfen tüm alanları doldurun."); return; }
            if (gelirDuzenlemeModu) { 
                setGelirler(gelirler.map(g => g.id === duzenlenecekGelirId ? { ...g, aciklama: gelirAciklama, tutar: parseFloat(gelirTutar), kategori: gelirKategori, tarih: gelirTarih, hesapId: seciliHesapId } : g)); 
                toast.success('Gelir başarıyla güncellendi!'); 
            } else { 
                const yeniGelir = { id: Date.now(), aciklama: gelirAciklama, tutar: parseFloat(gelirTutar), kategori: gelirKategori, tarih: gelirTarih, hesapId: seciliHesapId };
                setGelirler([...gelirler, yeniGelir]); 
                toast.success('Gelir başarıyla eklendi!'); 
            }
            handleGelirVazgec();
        }
    };
    const handleGiderDuzenleBaslat = (gider) => { setAktifIslemTipi('gider'); setGiderDuzenlemeModu(true); setDuzenlenecekGiderId(gider.id); setAciklama(gider.aciklama); setTutar(gider.tutar); setKategori(gider.kategori); setTarih(gider.tarih); setSeciliHesapId(gider.hesapId); };
    const handleGelirDuzenleBaslat = (gelir) => { setAktifIslemTipi('gelir'); setGelirDuzenlemeModu(true); setDuzenlenecekGelirId(gelir.id); setGelirAciklama(gelir.aciklama); setGelirTutar(gelir.tutar); setGelirKategori(gelir.kategori); setGelirTarih(gelir.tarih); setSeciliHesapId(gelir.hesapId); };
    const handleAbonelikOnayla = (abonelik) => { const odemeTarihiStr = `${seciliYil}-${String(seciliAy).padStart(2, '0')}-${String(abonelik.odemeGunu).padStart(2, '0')}`; const yeniGider = { id: Date.now() + Math.random(), aciklama: abonelik.aciklama, tutar: abonelik.tutar, kategori: abonelik.kategori, tarih: odemeTarihiStr, otomatikMi: true, kaynakId: abonelik.id, hesapId: hesaplar[0]?.id || 1 }; setGiderler(prevGiderler => [...prevGiderler, yeniGider]); toast.success(`'${abonelik.aciklama}' ödemesi giderlere eklendi!`); };
    // YENİ EKLENEN FONKSİYONLAR
    const handleHesapEkle = (yeniHesapAdi) => { if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) { toast.error("Bu hesap adı zaten mevcut veya geçersiz."); return; } const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() }; setHesaplar(prev => [...prev, yeniHesap]); toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`); };
    const handleHesapSil = (silinecekId) => { if (hesaplar.length <= 1) { toast.error("En az bir hesap kalmalıdır."); return; } const hesaptakiIslemler = [...giderler, ...gelirler].some(islem => islem.hesapId === silinecekId); if(hesaptakiIslemler) { toast.error("Bu hesapta işlem bulunduğu için silinemez."); return; } setHesaplar(hesaplar.filter(h => h.id !== silinecekId)); toast.error("Hesap silindi."); };

    // ORİJİNAL FONKSİYONLAR (DEĞİŞİKLİK YOK)
    const handleGiderSil = (id) => { setItemToDelete({ id: id, type: 'gider' }); setIsModalOpen(true); };
    const handleGiderVazgec = () => { setGiderDuzenlemeModu(false); setDuzenlenecekGiderId(null); setAciklama(''); setTutar(''); setKategori(giderKategorileri[0]); setTarih(getBugununTarihi()); };
    const handleGelirSil = (id) => { setItemToDelete({ id: id, type: 'gelir' }); setIsModalOpen(true); };
    const handleGelirVazgec = () => { setGelirDuzenlemeModu(false); setDuzenlenecekGelirId(null); setGelirAciklama(''); setGelirTutar(''); setGelirKategori(gelirKategorileri[0]); setGelirTarih(getBugununTarihi()); };
    const handleCloseModal = () => { setIsModalOpen(false); setItemToDelete(null); };
    const handleConfirmDelete = () => { if (!itemToDelete) return; if (itemToDelete.type === 'gider') { setGiderler(giderler.filter(g => g.id !== itemToDelete.id)); toast.error('Gider silindi.'); } else if (itemToDelete.type === 'gelir') { setGelirler(gelirler.filter(g => g.id !== itemToDelete.id)); toast.error('Gelir silindi.'); } handleCloseModal(); };
    const handleSabitOdemeEkle = (yeniOdeme) => { setSabitOdemeler(prev => [...prev, { id: Date.now(), ...yeniOdeme }]); toast.success('Sabit ödeme başarıyla eklendi!'); };
    const handleSabitOdemeSil = (id) => { setSabitOdemeler(sabitOdemeler.filter(odeme => odeme.id !== id)); toast.error('Sabit ödeme silindi.'); };
    const handleKategoriEkle = (tip, yeniKategori) => { if (tip === 'gider') { if (!giderKategorileri.includes(yeniKategori) && yeniKategori) { setGiderKategorileri(prev => [...prev, yeniKategori]); toast.success("Gider kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } else { if (!gelirKategorileri.includes(yeniKategori) && yeniKategori) { setGelirKategorileri(prev => [...prev, yeniKategori]); toast.success("Gelir kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } };
    const handleKategoriSil = (tip, kategori) => { if (tip === 'gider') { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGiderKategorileri(giderKategorileri.filter(k => k !== kategori)); toast.error("Gider kategorisi silindi."); } else { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGelirKategorileri(gelirKategorileri.filter(k => k !== kategori)); toast.error("Gelir kategorisi silindi."); } };
    const handleButceEkle = (yeniButce) => { const mevcutButce = butceler.find(b => b.kategori === yeniButce.kategori); if (mevcutButce) { setButceler(butceler.map(b => b.kategori === yeniButce.kategori ? yeniButce : b)); toast.success(`'${yeniButce.kategori}' bütçesi güncellendi!`); } else { setButceler(prev => [...prev, yeniButce]); toast.success(`'${yeniButce.kategori}' için yeni bütçe oluşturuldu!`); } };
    const handleButceSil = (kategori) => { setButceler(butceler.filter(b => b.kategori !== kategori)); toast.error(`'${kategori}' bütçesi silindi.`); };
    const handleVeriIndir = () => { const indirilecekVeri = [...filtrelenmisGelirler.map(gelir => ({ ...gelir, tip: 'Gelir' })), ...filtrelenmisGiderler.map(gider => ({ ...gider, tip: 'Gider' }))].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)); if (indirilecekVeri.length === 0) { toast.error('İndirilecek veri bulunmuyor.'); return; } const basliklar = ['Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar']; const csvRows = [basliklar.join(';')]; indirilecekVeri.forEach(islem => { const row = [new Date(islem.tarih).toLocaleDateString('tr-TR'), islem.tip, islem.kategori, `"${islem.aciklama.replace(/"/g, '""')}"`, islem.tutar.toFixed(2).replace('.', ',')]; csvRows.push(row.join(';')); }); const csvString = csvRows.join('\r\n'); const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', `bütçe_raporu_${seciliAy}_${seciliYil}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); toast.success('Rapor başarıyla indirildi!'); };

    // HESAPLANAN DEĞERLER (DOĞRU SIRALANMIŞ HALİ)
    const filtrelenmisGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
    const filtrelenmisGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
    const toplamGelir = filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0);
    const toplamGider = filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0);
    const bakiye = toplamGelir - toplamGider; 
    const hesapDurumlari = useMemo(() => {
        return hesaplar.map(hesap => {
            const hesabaAitGelirler = gelirler.filter(g => g.hesapId === hesap.id);
            const hesabaAitGiderler = giderler.filter(g => g.hesapId === hesap.id);
            const toplamGelir = hesabaAitGelirler.reduce((toplam, g) => toplam + g.tutar, 0);
            const toplamGider = hesabaAitGiderler.reduce((toplam, g) => toplam + g.tutar, 0);
            return { ...hesap, bakiye: toplamGelir - toplamGider };
        });
    }, [hesaplar, gelirler, giderler]);
    const toplamBakiye = hesapDurumlari.reduce((toplam, hesap) => toplam + hesap.bakiye, 0);
    const butceDurumlari = butceler.map(butce => { const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori === butce.kategori).reduce((toplam, gider) => toplam + gider.tutar, 0); const kalan = butce.limit - harcanan; const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0; const yuzde = Math.min(yuzdeRaw, 100); let durum = 'normal'; if (yuzdeRaw > 100) { durum = 'asildi'; } else if (yuzdeRaw >= 90) { durum = 'uyari'; } return { ...butce, harcanan, kalan, yuzde, durum }; }).sort((a,b) => b.yuzde - a.yuzde);
    const tumIslemler = [...gelirler, ...giderler];
    const mevcutYillar = [...new Set(tumIslemler.map(islem => new Date(islem.tarih).getFullYear()))].sort((a,b) => b-a);
    const birlesikIslemler = [...filtrelenmisGelirler.map(g => ({ ...g, tip: 'gelir' })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: 'gider' }))]
        .filter(islem => (birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip) && (giderFiltreKategori === 'Tümü' || islem.kategori === giderFiltreKategori))
        .sort((a, b) => {
            switch (birlesikSiralamaKriteri) {
                case 'tutar-artan': return a.tutar - b.tutar;
                case 'tutar-azalan': return b.tutar - a.tutar;
                case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih);
                default: return new Date(b.tarih) - new Date(a.tarih);
            }
        });
    const kategoriOzeti = filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) { acc[kategori] = 0; } acc[kategori] += tutar; return acc; }, {});
    const grafikVerisi = { labels: Object.keys(kategoriOzeti), datasets: [{ label: 'Harcama Miktarı', data: Object.values(kategoriOzeti), backgroundColor: ['rgba(255, 99, 132, 0.7)','rgba(54, 162, 235, 0.7)','rgba(255, 206, 86, 0.7)','rgba(75, 192, 192, 0.7)','rgba(153, 102, 255, 0.7)','rgba(255, 159, 64, 0.7)', '#8e44ad', '#34495e'], borderColor: ['#fff'], borderWidth: 1,},],};
    const gelirKategoriOzeti = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) { acc[kategori] = 0; } acc[kategori] += tutar; return acc; }, {});
    const gelirGrafikVerisi = { labels: Object.keys(gelirKategoriOzeti), datasets: [{ label: 'Gelir Miktarı', data: Object.values(gelirKategoriOzeti), backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(110, 214, 123, 0.7)', 'rgba(46, 204, 113, 0.7)', 'rgba(39, 174, 96, 0.7)'], borderColor: ['rgba(75, 192, 192, 1)', 'rgba(110, 214, 123, 1)', 'rgba(46, 204, 113, 1)', 'rgba(39, 174, 96, 1)'], borderWidth: 1, },], };
    const trendVerisi = { labels: [], gelirler: [], giderler: [], };
    const yillikRaporVerisi = { aylar: [], toplamGelir: 0, toplamGider: 0, toplamBakiye: 0 };
    for (let i = 1; i <= 12; i++) { const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i).reduce((toplam, g) => toplam + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i).reduce((toplam, g) => toplam + g.tutar, 0); if (aylikGelir > 0 || aylikGider > 0) { yillikRaporVerisi.aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: aylikGelir, gider: aylikGider, bakiye: aylikGelir - aylikGider }); } yillikRaporVerisi.toplamGelir += aylikGelir; yillikRaporVerisi.toplamGider += aylikGider; }
    yillikRaporVerisi.toplamBakiye = yillikRaporVerisi.toplamGelir - yillikRaporVerisi.toplamGider;
    for (let i = 5; i >= 0; i--) { const tarih = new Date(seciliYil, seciliAy - 1, 1); tarih.setMonth(tarih.getMonth() - i); const ay = tarih.getMonth() + 1; const yil = tarih.getFullYear(); const oAykiGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((toplam, g) => toplam + g.tutar, 0); const oAykiGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((toplam, g) => toplam + g.tutar, 0); trendVerisi.labels.push(`${tarih.toLocaleString('tr-TR', { month: 'long' })}`); trendVerisi.gelirler.push(oAykiGelir); trendVerisi.giderler.push(oAykiGider); }

    const contextValue = {
        giderKategorileri, setGiderKategorileri, gelirKategorileri, setGelirKategorileri,
        giderler, setGiderler, gelirler, setGelirler,
        sabitOdemeler, setSabitOdemeler, butceler, setButceler,
        aciklama, setAciklama, tutar, setTutar, kategori, setKategori, tarih, setTarih,
        gelirAciklama, setGelirAciklama, gelirTutar, setGelirTutar, gelirKategori, setGelirKategori, gelirTarih, setGelirTarih,
        giderDuzenlemeModu, setGiderDuzenlemeModu, duzenlenecekGiderId, setDuzenlenecekGiderId,
        gelirDuzenlemeModu, setGelirDuzenlemeModu, duzenlenecekGelirId, setDuzenlenecekGelirId,
        seciliAy, setSeciliAy, seciliYil, setSeciliYil,
        isModalOpen, setIsModalOpen, itemToDelete, setItemToDelete,
        onayBekleyenAbonelikler, setOnayBekleyenAbonelikler, aktifIslemTipi, setAktifIslemTipi,
        giderFiltreKategori, setGiderFiltreKategori, birlesikFiltreTip, setBirlesikFiltreTip, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        handleSubmit, handleGiderDuzenleBaslat, handleGiderSil, handleGiderVazgec,
        handleGelirDuzenleBaslat, handleGelirSil, handleGelirVazgec,
        handleCloseModal, handleConfirmDelete, handleSabitOdemeEkle, handleSabitOdemeSil,
        handleAbonelikOnayla, handleKategoriEkle, handleKategoriSil,
        handleButceEkle, handleButceSil, handleVeriIndir,
        filtrelenmisGelirler, filtrelenmisGiderler,
        butceDurumlari, tumIslemler, mevcutYillar,
        toplamGelir, toplamGider, bakiye,
        birlesikIslemler, kategoriOzeti, grafikVerisi,
        gelirKategoriOzeti, gelirGrafikVerisi,
        trendVerisi, yillikRaporVerisi,
        // YENİ EKLENEN DEĞERLER
        hesaplar, setHesaplar,
        seciliHesapId, setSeciliHesapId,
        handleHesapEkle, handleHesapSil,
        hesapDurumlari, toplamBakiye,
    };

    return (
        <FinansContext.Provider value={contextValue}>
            {children}
        </FinansContext.Provider>
    );
};

export const useFinans = () => {
    return useContext(FinansContext);
};