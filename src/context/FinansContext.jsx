// src/context/FinansContext.jsx (TÜM HATALARI DÜZELTİLMİŞ NİHAİ VERSİYON)
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';

const FinansContext = createContext();

const GIDER_KATEGORILERI_VARSAYILAN = ["Market", "Fatura", "Ulaşım", "Eğlence", "Sağlık", "Kira", "Kredi", "Abonelik", "Diğer"];
const GELIR_KATEGORILERI_VARSAYILAN = ["Maaş", "Ek Gelir", "Hediye", "Diğer"];
const VARSAYILAN_HESAPLAR = [{ id: 1, ad: 'Nakit' }, { id: 2, ad: 'Banka Hesabı' }];

const stringToColor = (str) => {
    let hash = 0;
    if (str.length === 0) return '#CCCCCC';
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

export const FinansProvider = ({ children }) => {
    const getBugununTarihi = () => new Date().toISOString().split('T')[0];

    const [giderKategorileri, setGiderKategorileri] = useState(() => JSON.parse(localStorage.getItem('giderKategorileri')) || GIDER_KATEGORILERI_VARSAYILAN);
    const [gelirKategorileri, setGelirKategorileri] = useState(() => JSON.parse(localStorage.getItem('gelirKategorileri')) || GELIR_KATEGORILERI_VARSAYILAN);
    const [kategoriRenkleri, setKategoriRenkleri] = useState(() => JSON.parse(localStorage.getItem('kategoriRenkleri')) || {});
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
    const [seciliHesapId, setSeciliHesapId] = useState(hesaplar[0]?.id || 1);
    const [giderDuzenlemeModu, setGiderDuzenlemeModu] = useState(false);
    const [duzenlenecekGiderId, setDuzenlenecekGiderId] = useState(null);
    const [gelirDuzenlemeModu, setGelirDuzenlemeModu] = useState(false);
    const [duzenlenecekGelirId, setDuzenlenecekGelirId] = useState(null);
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isHizliEkleModalOpen, setIsHizliEkleModalOpen] = useState(false);
    const [onayBekleyenAbonelikler, setOnayBekleyenAbonelikler] = useState([]);
    const [aktifIslemTipi, setAktifIslemTipi] = useState('gider');
    
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState('Tümü');
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState('tarih-yeni');

    useEffect(() => { localStorage.setItem('giderler', JSON.stringify(giderler)); }, [giderler]);
    useEffect(() => { localStorage.setItem('gelirler', JSON.stringify(gelirler)); }, [gelirler]);
    useEffect(() => { localStorage.setItem('sabitOdemeler', JSON.stringify(sabitOdemeler)); }, [sabitOdemeler]);
    useEffect(() => { localStorage.setItem('butceler', JSON.stringify(butceler)); }, [butceler]);
    useEffect(() => { localStorage.setItem('giderKategorileri', JSON.stringify(giderKategorileri)); }, [giderKategorileri]);
    useEffect(() => { localStorage.setItem('gelirKategorileri', JSON.stringify(gelirKategorileri)); }, [gelirKategorileri]);
    useEffect(() => { localStorage.setItem('hesaplar', JSON.stringify(hesaplar)); }, [hesaplar]);

    useEffect(() => {
        const tumKategoriler = [...new Set([...giderKategorileri, ...gelirKategorileri])];
        let renklerGuncellendi = false;
        const yeniRenkler = { ...kategoriRenkleri };
        tumKategoriler.forEach(kategori => {
            if (!yeniRenkler[kategori]) {
                yeniRenkler[kategori] = stringToColor(kategori);
                renklerGuncellendi = true;
            }
        });
        if (renklerGuncellendi) {
            setKategoriRenkleri(yeniRenkler);
            localStorage.setItem('kategoriRenkleri', JSON.stringify(yeniRenkler));
        }
    }, [giderKategorileri, gelirKategorileri, kategoriRenkleri]);
    
    useEffect(() => {
        let guncellemeYapildi = false;
        const migrateItems = (items) => items.map(item => {
            if (item.hesapId === undefined || item.hesapId === null) {
                guncellemeYapildi = true;
                return { ...item, hesapId: hesaplar[0]?.id || 1 };
            }
            return item;
        });

        if (hesaplar.length > 0) {
            const guncelGiderler = migrateItems(giderler);
            const guncelGelirler = migrateItems(gelirler);
            if (guncellemeYapildi) {
                setGiderler(guncelGiderler);
                setGelirler(guncelGelirler);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGiderVazgec = () => { setGiderDuzenlemeModu(false); setDuzenlenecekGiderId(null); setAciklama(''); setTutar(''); setKategori(giderKategorileri[0]); setTarih(getBugununTarihi()); };
    const handleGelirVazgec = () => { setGelirDuzenlemeModu(false); setDuzenlenecekGelirId(null); setGelirAciklama(''); setGelirTutar(''); setGelirKategori(gelirKategorileri[0]); setGelirTarih(getBugununTarihi()); };
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
    const handleGiderSil = (id) => { setItemToDelete({ id: id, type: 'gider' }); setIsModalOpen(true); };
    const handleGelirSil = (id) => { setItemToDelete({ id: id, type: 'gelir' }); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setItemToDelete(null); };
    const handleConfirmDelete = () => { if (!itemToDelete) return; if (itemToDelete.type === 'gider') { setGiderler(giderler.filter(g => g.id !== itemToDelete.id)); toast.error('Gider silindi.'); } else if (itemToDelete.type === 'gelir') { setGelirler(gelirler.filter(g => g.id !== itemToDelete.id)); toast.error('Gelir silindi.'); } handleCloseModal(); };
    const handleHesapEkle = (yeniHesapAdi) => { if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) { toast.error("Bu hesap adı zaten mevcut veya geçersiz."); return; } const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() }; setHesaplar(prev => [...prev, yeniHesap]); toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`); };
    const handleHesapSil = (silinecekId) => { if (hesaplar.length <= 1) { toast.error("En az bir hesap kalmalıdır."); return; } const hesaptakiIslemler = [...giderler, ...gelirler].some(islem => islem.hesapId === silinecekId); if(hesaptakiIslemler) { toast.error("Bu hesapta işlem bulunduğu için silinemez."); return; } setHesaplar(hesaplar.filter(h => h.id !== silinecekId)); toast.error("Hesap silindi."); };
    const handleKategoriEkle = (tip, yeniKategori) => { if (tip === 'gider') { if (!giderKategorileri.includes(yeniKategori) && yeniKategori) { setGiderKategorileri(prev => [...prev, yeniKategori]); toast.success("Gider kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } else { if (!gelirKategorileri.includes(yeniKategori) && yeniKategori) { setGelirKategorileri(prev => [...prev, yeniKategori]); toast.success("Gelir kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } };
    const handleKategoriSil = (tip, kategori) => { if (tip === 'gider') { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGiderKategorileri(giderKategorileri.filter(k => k !== kategori)); toast.error("Gider kategorisi silindi."); } else { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGelirKategorileri(gelirKategorileri.filter(k => k !== kategori)); toast.error("Gelir kategorisi silindi."); } };
    const handleKategoriSirala = (tip, aktifId, hedefId) => {
        const setKategoriler = tip === 'gider' ? setGiderKategorileri : setGelirKategorileri;
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri;
        const eskiIndex = kategoriler.findIndex(k => k === aktifId);
        const yeniIndex = kategoriler.findIndex(k => k === hedefId);
        if (eskiIndex !== -1 && yeniIndex !== -1) {
            setKategoriler(prev => {
                const yeniListe = [...prev];
                const [tasinan] = yeniListe.splice(eskiIndex, 1);
                yeniListe.splice(yeniIndex, 0, tasinan);
                return yeniListe;
            });
        }
    };
    const openHizliEkleModal = () => setIsHizliEkleModalOpen(true);
    const closeHizliEkleModal = () => setIsHizliEkleModalOpen(false);

    const filtrelenmisGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
    const filtrelenmisGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
    const toplamGelir = filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0);
    const toplamGider = filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0);
    const hesapDurumlari = useMemo(() => {
        return hesaplar.map(hesap => {
            const bakiye = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) - giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0);
            return { ...hesap, bakiye };
        });
    }, [hesaplar, gelirler, giderler]);
    const toplamBakiye = hesapDurumlari.reduce((toplam, hesap) => toplam + hesap.bakiye, 0);
    const kategoriOzeti = filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) { acc[kategori] = 0; } acc[kategori] += tutar; return acc; }, {});
    const grafikVerisi = useMemo(() => {
        const labels = Object.keys(kategoriOzeti);
        const data = Object.values(kategoriOzeti);
        const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#CCCCCC');
        return {
            labels,
            datasets: [{ label: 'Harcama Miktarı', data, backgroundColor, borderColor: '#ffffff', borderWidth: 2 }],
        };
    }, [kategoriOzeti, kategoriRenkleri]);
    
    const gelirGrafikVerisi = useMemo(() => {
        const gelirKaynaklari = filtrelenmisGelirler.reduce((acc, gelir) => {
            const { kategori, tutar } = gelir;
            if (!acc[kategori]) { acc[kategori] = 0; }
            acc[kategori] += tutar;
            return acc;
        }, {});
        const labels = Object.keys(gelirKaynaklari);
        const data = Object.values(gelirKaynaklari);
        const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71');
        return {
            labels,
            datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }],
        };
    }, [filtrelenmisGelirler, kategoriRenkleri]);

    const butceDurumlari = useMemo(() => butceler.map(butce => {
        const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0);
        const kalan = butce.limit - harcanan;
        const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0;
        const yuzde = Math.min(yuzdeRaw, 100);
        let durum = 'normal';
        if (yuzdeRaw > 100) { durum = 'asildi'; } else if (yuzdeRaw >= 90) { durum = 'uyari'; }
        return { ...butce, harcanan, kalan, yuzde, yuzdeRaw, durum };
   }).sort((a, b) => b.yuzdeRaw - a.yuzdeRaw), [butceler, filtrelenmisGiderler]);

    const birlesikIslemler = useMemo(() => {
        const temelListe = [...filtrelenmisGelirler.map(g => ({ ...g, tip: 'gelir' })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: 'gider' }))];

        const filtrelenmisListe = temelListe.filter(islem => {
            const tipFiltresiGecti = birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip;
            const kategoriFiltresiGecti = birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori;
            return tipFiltresiGecti && kategoriFiltresiGecti;
        });

        return filtrelenmisListe.sort((a, b) => {
            switch (birlesikSiralamaKriteri) {
                case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih);
                case 'tutar-artan': return a.tutar - b.tutar;
                case 'tutar-azalan': return b.tutar - a.tutar;
                case 'tarih-yeni':
                default:
                    return new Date(b.tarih) - new Date(a.tarih);
            }
        });
    }, [filtrelenmisGelirler, filtrelenmisGiderler, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri]);
    
    const trendVerisi = useMemo(() => {
        const labels = [];
        const gelirlerData = [];
        const giderlerData = [];
        const bugun = new Date();
        for (let i = 5; i >= 0; i--) {
            const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1);
            const yil = tarih.getFullYear();
            const ay = tarih.getMonth() + 1;
            labels.push(tarih.toLocaleString('tr-TR', { month: 'long' }));
            const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0);
            const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0);
            gelirlerData.push(aylikGelir);
            giderlerData.push(aylikGider);
        }
        return { labels, gelirler: gelirlerData, giderler: giderlerData };
    }, [gelirler, giderler]);
    
    const yillikRaporVerisi = useMemo(() => {
        const aylar = [];
        let toplamGelir = 0;
        let toplamGider = 0;
        for (let i = 1; i <= 12; i++) {
            const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i);
            const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i);
            if (aylikGelirler.length > 0 || aylikGiderler.length > 0) {
                const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0);
                const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0);
                toplamGelir += ayGelir;
                toplamGider += ayGider;
                aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider });
            }
        }
        return { aylar, toplamGelir, toplamGider, toplamBakiye: toplamGelir - toplamGider };
    }, [gelirler, giderler, seciliYil]);

    const mevcutYillar = useMemo(() => {
        const yillar = new Set();
        [...gelirler, ...giderler].forEach(islem => {
            yillar.add(new Date(islem.tarih).getFullYear());
        });
        if (yillar.size === 0) {
            yillar.add(new Date().getFullYear());
        }
        return Array.from(yillar).sort((a, b) => b - a);
    }, [gelirler, giderler]);
    
    const handleVeriIndir = () => {
        const basliklar = "ID,Tip,Açıklama,Tutar,Kategori,Tarih,Hesap ID";
        const satirlar = birlesikIslemler.map(islem => 
            `${islem.id},${islem.tip},"${islem.aciklama.replace(/"/g, '""')}",${islem.tutar},${islem.kategori},${islem.tarih},${islem.hesapId}`
        );
        const csvIcerik = [basliklar, ...satirlar].join('\n');
        const blob = new Blob([`\uFEFF${csvIcerik}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `finans_raporu_${seciliYil}_${seciliAy}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        toast.success("Rapor indirildi!");
    };

    const contextValue = {
        giderKategorileri, setGiderKategorileri, gelirKategorileri, setGelirKategorileri, kategoriRenkleri,
        giderler, setGiderler, gelirler, setGelirler, sabitOdemeler, butceler, hesaplar, setHesaplar,
        aciklama, setAciklama, tutar, setTutar, kategori, setKategori, tarih, setTarih,
        gelirAciklama, setGelirAciklama, gelirTutar, setGelirTutar, gelirKategori, setGelirKategori, gelirTarih, setGelirTarih,
        seciliHesapId, setSeciliHesapId,
        giderDuzenlemeModu, setGiderDuzenlemeModu, duzenlenecekGiderId,
        gelirDuzenlemeModu, setGelirDuzenlemeModu, duzenlenecekGelirId,
        seciliAy, setSeciliAy, seciliYil, setSeciliYil,
        isModalOpen, setIsModalOpen, itemToDelete,
        isHizliEkleModalOpen, setIsHizliEkleModalOpen, openHizliEkleModal, closeHizliEkleModal,
        onayBekleyenAbonelikler, aktifIslemTipi, setAktifIslemTipi,
        birlesikFiltreKategori, setBirlesikFiltreKategori,
        birlesikFiltreTip, setBirlesikFiltreTip, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        handleSubmit, handleGiderDuzenleBaslat, handleGelirDuzenleBaslat,
        handleGiderSil, handleGelirSil, handleGiderVazgec, handleGelirVazgec,
        handleCloseModal, handleConfirmDelete, 
        handleHesapEkle, handleHesapSil,
        handleKategoriEkle, handleKategoriSil, handleKategoriSirala,
        handleButceEkle: (yeniButce) => { const mevcutButce = butceler.find(b => b.kategori === yeniButce.kategori); if (mevcutButce) { setButceler(butceler.map(b => b.kategori === yeniButce.kategori ? yeniButce : b)); toast.success(`'${yeniButce.kategori}' bütçesi güncellendi!`); } else { setButceler(prev => [...prev, yeniButce]); toast.success(`'${yeniButce.kategori}' için yeni bütçe oluşturuldu!`); } },
        handleButceSil: (kategori) => { setButceler(butceler.filter(b => b.kategori !== kategori)); toast.error(`'${kategori}' bütçesi silindi.`); },
        handleSabitOdemeEkle: (yeniOdeme) => { setSabitOdemeler(prev => [...prev, { id: Date.now(), ...yeniOdeme }]); toast.success('Sabit ödeme başarıyla eklendi!'); },
        handleSabitOdemeSil: (id) => { setSabitOdemeler(sabitOdemeler.filter(odeme => odeme.id !== id)); toast.error('Sabit ödeme silindi.'); },
        handleAbonelikOnayla: (abonelik) => { const odemeTarihiStr = `${seciliYil}-${String(seciliAy).padStart(2, '0')}-${String(abonelik.odemeGunu).padStart(2, '0')}`; const yeniGider = { id: Date.now() + Math.random(), aciklama: abonelik.aciklama, tutar: abonelik.tutar, kategori: abonelik.kategori, tarih: odemeTarihiStr, otomatikMi: true, kaynakId: abonelik.id, hesapId: hesaplar[0]?.id || 1 }; setGiderler(prevGiderler => [...prevGiderler, yeniGider]); toast.success(`'${abonelik.aciklama}' ödemesi giderlere eklendi!`); },
        handleVeriIndir,
        filtrelenmisGelirler, filtrelenmisGiderler, toplamGelir, toplamGider,
        hesapDurumlari, toplamBakiye,
        kategoriOzeti, grafikVerisi, 
        gelirGrafikVerisi,
        butceDurumlari, birlesikIslemler,
        trendVerisi, yillikRaporVerisi,
        mevcutYillar
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};

export const useFinans = () => useContext(FinansContext);