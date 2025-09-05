// src/context/FinansContext.jsx
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import { ISLEM_TURLERI, SIRALAMA_KRITERLERI } from '../utils/constants';

const FinansContext = createContext();

// Varsayılan değerler ve yardımcı fonksiyonlar (değişiklik yok)
const GIDER_KATEGORILERI_VARSAYILAN = ["Market", "Fatura", "Ulaşım", "Eğlence", "Sağlık", "Kredi", "Kira", "Abonelik", "Diğer"];
const GELIR_KATEGORILERI_VARSAYILAN = ["Maaş", "Ek Gelir", "Hediye", "Diğer"];
const VARSAYILAN_HESAPLAR = [{ id: 1, ad: 'Nakit' }, { id: 2, ad: 'Banka Hesabı' }];

const generateStablePastelColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    const saturation = 70;
    const lightness = 85;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const FinansProvider = ({ children }) => {
    // === 1. GLOBAL STATE'LER ===
    // Bu state'ler uygulamanın genelinde paylaşılan ana verilerdir.
    const [giderKategorileri, setGiderKategorileri] = useState(() => JSON.parse(localStorage.getItem('giderKategorileri')) || GIDER_KATEGORILERI_VARSAYILAN);
    const [gelirKategorileri, setGelirKategorileri] = useState(() => JSON.parse(localStorage.getItem('gelirKategorileri')) || GELIR_KATEGORILERI_VARSAYILAN);
    const [kategoriRenkleri, setKategoriRenkleri] = useState(() => JSON.parse(localStorage.getItem('kategoriRenkleri')) || {});
    const [giderler, setGiderler] = useState(() => JSON.parse(localStorage.getItem('giderler')) || []);
    const [gelirler, setGelirler] = useState(() => JSON.parse(localStorage.getItem('gelirler')) || []);
    const [transferler, setTransferler] = useState(() => JSON.parse(localStorage.getItem('transferler')) || []);
    const [sabitOdemeler, setSabitOdemeler] = useState(() => JSON.parse(localStorage.getItem('sabitOdemeler')) || []);
    const [butceler, setButceler] = useState(() => JSON.parse(localStorage.getItem('butceler')) || []);
    const [hesaplar, setHesaplar] = useState(() => JSON.parse(localStorage.getItem('hesaplar')) || VARSAYILAN_HESAPLAR);
    
    // Filtreleme ve sıralama için state'ler
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState(ISLEM_TURLERI.TUMU);
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState(SIRALAMA_KRITERLERI.TARIH_YENI);
    const [birlesikFiltreHesap, setBirlesikFiltreHesap] = useState('Tümü');
    
    // Silme işlemi için modal state'leri
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // === 2. VERİYİ LOCALSTORAGE'A KAYDETME (useEffect'ler) - (Değişiklik yok) ===
    useEffect(() => { localStorage.setItem('giderler', JSON.stringify(giderler)); }, [giderler]);
    useEffect(() => { localStorage.setItem('gelirler', JSON.stringify(gelirler)); }, [gelirler]);
    useEffect(() => { localStorage.setItem('transferler', JSON.stringify(transferler)); }, [transferler]);
    useEffect(() => { localStorage.setItem('sabitOdemeler', JSON.stringify(sabitOdemeler)); }, [sabitOdemeler]);
    useEffect(() => { localStorage.setItem('butceler', JSON.stringify(butceler)); }, [butceler]);
    useEffect(() => { localStorage.setItem('giderKategorileri', JSON.stringify(giderKategorileri)); }, [giderKategorileri]);
    useEffect(() => { localStorage.setItem('gelirKategorileri', JSON.stringify(gelirKategorileri)); }, [gelirKategorileri]);
    useEffect(() => { localStorage.setItem('hesaplar', JSON.stringify(hesaplar)); }, [hesaplar]);
    useEffect(() => { localStorage.setItem('kategoriRenkleri', JSON.stringify(kategoriRenkleri)); }, [kategoriRenkleri]);

    useEffect(() => {
        const tumKategoriler = [...giderKategorileri, ...gelirKategorileri];
        let renklerGuncellendi = false;
        const yeniRenkHaritasi = { ...kategoriRenkleri };
        tumKategoriler.forEach(kategori => {
            if (!yeniRenkHaritasi[kategori]) {
                yeniRenkHaritasi[kategori] = generateStablePastelColor(kategori);
                renklerGuncellendi = true;
            }
        });
        if (renklerGuncellendi) { setKategoriRenkleri(yeniRenkHaritasi); }
    }, [giderKategorileri, gelirKategorileri]);

    // === 3. YENİDEN YAPILANDIRILMIŞ VERİ YÖNETİM FONKSİYONLARI ===
    // Bu fonksiyonlar artık formdan gelen hazır veri objelerini alarak çalışır.

    const addIslem = (tip, islemData) => {
        const yeniIslem = { id: Date.now(), ...islemData };
        if (tip === ISLEM_TURLERI.GIDER) {
            setGiderler(prev => [...prev, yeniIslem]);
            toast.success("Gider eklendi!");
        } else if (tip === ISLEM_TURLERI.GELIR) {
            setGelirler(prev => [...prev, yeniIslem]);
            toast.success("Gelir eklendi!");
        } else if (tip === ISLEM_TURLERI.TRANSFER) {
            setTransferler(prev => [...prev, yeniIslem]);
            toast.success("Transfer gerçekleştirildi!");
        }
    };

    const updateIslem = (tip, id, guncelIslemData) => {
        if (tip === ISLEM_TURLERI.GIDER) {
            setGiderler(prev => prev.map(g => g.id === id ? { ...g, ...guncelIslemData } : g));
            toast.success("Gider güncellendi!");
        } else if (tip === ISLEM_TURLERI.GELIR) {
            setGelirler(prev => prev.map(g => g.id === id ? { ...g, ...guncelIslemData } : g));
            toast.success("Gelir güncellendi!");
        } else if (tip === ISLEM_TURLERI.TRANSFER) {
            setTransferler(prev => prev.map(t => t.id === id ? { ...t, ...guncelIslemData } : t));
            toast.success("Transfer güncellendi!");
        }
    };

    // Silme işlemleri için modal'ı açan fonksiyonlar
    const openDeleteModal = (id, type) => {
        setItemToDelete({ id, type });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        const { id, type } = itemToDelete;
        if (type === ISLEM_TURLERI.GIDER) {
            setGiderler(prev => prev.filter(g => g.id !== id));
        } else if (type === ISLEM_TURLERI.GELIR) {
            setGelirler(prev => prev.filter(g => g.id !== id));
        } else if (type === ISLEM_TURLERI.TRANSFER) {
            setTransferler(prev => prev.filter(t => t.id !== id));
        }
        toast.error('İşlem silindi.');
        handleCloseModal();
    };


    // Diğer yönetim fonksiyonları ( Hesap, Kategori, Bütçe vb.) - (Değişiklik yok)
    const handleHesapEkle = (yeniHesapAdi) => { if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) { toast.error("Bu hesap adı zaten mevcut veya geçersiz."); return; } const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() }; setHesaplar(prev => [...prev, yeniHesap]); toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`); };
    const handleHesapSil = (silinecekId) => { if (hesaplar.length <= 1) { toast.error("En az bir hesap kalmalıdır."); return; } const isUsedInGelirGider = [...gelirler, ...giderler].some(islem => islem.hesapId === silinecekId); const isUsedInTransfer = transferler.some(t => t.gonderenHesapId === silinecekId || t.aliciHesapId === silinecekId); if (isUsedInGelirGider || isUsedInTransfer) { toast.error("Bu hesapta işlem bulunduğu için silinemez."); return; } setHesaplar(prev => prev.filter(h => h.id !== silinecekId)); toast.error("Hesap silindi."); };
    const handleHesapGuncelle = (id, yeniAd) => { if (!yeniAd.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniAd.trim().toLowerCase() && h.id !== id)) { toast.error("Bu hesap adı zaten mevcut veya geçersiz."); return; } setHesaplar(prev => prev.map(hesap => hesap.id === id ? { ...hesap, ad: yeniAd.trim() } : hesap)); toast.success("Hesap adı güncellendi!"); };
    const handleKategoriEkle = (tip, yeniKategori) => { const kategoriler = tip === ISLEM_TURLERI.GIDER ? giderKategorileri : gelirKategorileri; const setKategoriler = tip === ISLEM_TURLERI.GIDER ? setGiderKategorileri : setGelirKategorileri; if (!kategoriler.includes(yeniKategori) && yeniKategori) { setKategoriler(prev => [...prev, yeniKategori]); setKategoriRenkleri(prevRenkler => { if (!prevRenkler[yeniKategori]) { const yeniRenk = generateStablePastelColor(yeniKategori); return { ...prevRenkler, [yeniKategori]: yeniRenk }; } return prevRenkler; }); toast.success(`${tip === 'gider' ? 'Gider' : 'Gelir'} kategorisi eklendi!`); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } };
    const handleKategoriSil = (tip, kategori) => { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } const isUsed = (tip === ISLEM_TURLERI.GIDER ? giderler : gelirler).some(islem => islem.kategori === kategori); if (isUsed) { toast.error("Bu kategori kullanımda olan işlemlere sahip olduğu için silinemez."); return; } if (tip === ISLEM_TURLERI.GIDER) { setGiderKategorileri(prev => prev.filter(k => k !== kategori)); } else { setGelirKategorileri(prev => prev.filter(k => k !== kategori)); } toast.error(`${tip === 'gider' ? 'Gider' : 'Gelir'} kategorisi silindi.`); };
    const handleKategoriSirala = (tip, aktifId, hedefId) => { const setKategoriler = tip === ISLEM_TURLERI.GIDER ? setGiderKategorileri : setGelirKategorileri; setKategoriler(prev => { const eskiIndex = prev.findIndex(k => k === aktifId); const yeniIndex = prev.findIndex(k => k === hedefId); return arrayMove(prev, eskiIndex, yeniIndex); }); };
    const handleKategoriGuncelle = (tip, eskiAd, yeniAd) => { const kategoriler = tip === ISLEM_TURLERI.GIDER ? giderKategorileri : gelirKategorileri; const setKategoriler = tip === ISLEM_TURLERI.GIDER ? setGiderKategorileri : setGelirKategorileri; const islemler = tip === ISLEM_TURLERI.GIDER ? giderler : gelirler; const setIslemler = tip === ISLEM_TURLERI.GIDER ? setGiderler : setGelirler; if (!yeniAd.trim() || kategoriler.some(k => k.toLowerCase() === yeniAd.trim().toLowerCase() && k.toLowerCase() !== eskiAd.toLowerCase())) { toast.error("Bu kategori adı zaten mevcut veya geçersiz."); return; } setKategoriler(prev => prev.map(k => (k === eskiAd ? yeniAd.trim() : k))); setIslemler(prev => prev.map(islem => (islem.kategori === eskiAd ? { ...islem, kategori: yeniAd.trim() } : islem))); setKategoriRenkleri(prev => { const yeniRenkler = { ...prev }; yeniRenkler[yeniAd.trim()] = yeniRenkler[eskiAd]; delete yeniRenkler[eskiAd]; return yeniRenkler; }); toast.success("Kategori güncellendi!"); };
    const handleButceEkle = (yeniButce) => { const mevcutButce = butceler.find(b => b.kategori === yeniButce.kategori); if (mevcutButce) { setButceler(butceler.map(b => b.kategori === yeniButce.kategori ? yeniButce : b)); toast.success(`'${yeniButce.kategori}' bütçesi güncellendi!`); } else { setButceler(prev => [...prev, yeniButce]); toast.success(`'${yeniButce.kategori}' için yeni bütçe oluşturuldu!`); } };
    const handleButceSil = (kategori) => { setButceler(butceler.filter(b => b.kategori !== kategori)); toast.error(`'${kategori}' bütçesi silindi.`); };
    const handleSabitOdemeEkle = (yeniOdeme) => { const { aciklama, tutar, baslangicTarihi } = yeniOdeme; if (!aciklama || !tutar || !baslangicTarihi) { toast.error("Lütfen Açıklama, Tutar ve Başlangıç Tarihi alanlarını doldurun."); return false; } setSabitOdemeler(prev => [...prev, { id: Date.now(), ...yeniOdeme }]); toast.success('Sabit ödeme başarıyla eklendi!'); return true; };
    const handleSabitOdemeGuncelle = (id, guncelOdeme) => { const { aciklama, tutar, baslangicTarihi } = guncelOdeme; if (!aciklama || !tutar || !baslangicTarihi) { toast.error("Lütfen Açıklama, Tutar ve Başlangıç Tarihi alanlarını doldurun."); return; } setSabitOdemeler(prev => prev.map(odeme => odeme.id === id ? { ...odeme, ...guncelOdeme } : odeme)); toast.success("Sabit ödeme güncellendi!"); };
    const handleSabitOdemeSil = (id) => { setSabitOdemeler(sabitOdemeler.filter(odeme => odeme.id !== id)); toast.error('Sabit ödeme silindi.'); };
    const handleVeriIndir = () => { const basliklar = "ID,Tip,Açıklama,Tutar,Kategori,Tarih,Hesap ID"; const birlesikIslemler = [...gelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })), ...giderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER }))]; const satirlar = birlesikIslemler.map(islem => `${islem.id},${islem.tip},"${islem.aciklama.replace(/"/g, '""')}",${islem.tutar},${islem.kategori},${islem.tarih},${islem.hesapId}`); const csvIcerik = [basliklar, ...satirlar].join('\n'); const blob = new Blob([`\uFEFF${csvIcerik}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `finans_raporu.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } toast.success("Rapor indirildi!"); };
    
    // === 4. HESAPLANMIŞ DEĞERLER (useMemo'lar) - (Değişiklik yok) ===
    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);
    const gecenAyFiltrelenmisGiderler = useMemo(() => { const simdi = new Date(seciliYil, seciliAy - 1, 1); const gecenAyTarih = new Date(simdi.setMonth(simdi.getMonth() - 1)); const gecenAy = gecenAyTarih.getMonth() + 1; const gecenAyinYili = gecenAyTarih.getFullYear(); return giderler.filter(g => new Date(g.tarih).getFullYear() === gecenAyinYili && new Date(g.tarih).getMonth() + 1 === gecenAy); }, [giderler, seciliAy, seciliYil]);
    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);
    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
    const butceDurumlari = useMemo(() => butceler.map(butce => { const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0); const gecenAyHarcanan = gecenAyFiltrelenmisGiderler.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0); let degisimYuzdesi = 0; if (gecenAyHarcanan > 0) { degisimYuzdesi = ((harcanan - gecenAyHarcanan) / gecenAyHarcanan) * 100; } else if (harcanan > 0) { degisimYuzdesi = 100; } const kalan = butce.limit - harcanan; const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0; const yuzde = Math.min(yuzdeRaw, 100); let durum = 'normal'; if (yuzdeRaw > 100) durum = 'asildi'; else if (yuzdeRaw >= 90) durum = 'uyari'; return { ...butce, harcanan, kalan, yuzde, yuzdeRaw, durum, degisimYuzdesi }; }).sort((a, b) => b.yuzdeRaw - a.yuzdeRaw), [butceler, filtrelenmisGiderler, gecenAyFiltrelenmisGiderler]);
    const kategoriOzeti = useMemo(() => filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}), [filtrelenmisGiderler]);
    const grafikVerisi = useMemo(() => { const labels = Object.keys(kategoriOzeti); const data = Object.values(kategoriOzeti); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#CCCCCC'); return { labels, datasets: [{ label: 'Harcama Miktarı', data, backgroundColor, borderColor: '#ffffff', borderWidth: 2 }] }; }, [kategoriOzeti, kategoriRenkleri]);
    const gelirGrafikVerisi = useMemo(() => { const gelirKaynaklari = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}); const labels = Object.keys(gelirKaynaklari); const data = Object.values(gelirKaynaklari); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71'); return { labels, datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }] }; }, [filtrelenmisGelirler, kategoriRenkleri]);
    const yaklasanOdemeler = useMemo(() => { const bugun = new Date(); const bugununGunu = bugun.getDate(); const mevcutAy = bugun.getMonth(); const mevcutYil = bugun.getFullYear(); const mevcutAydakiGunSayisi = new Date(mevcutYil, mevcutAy + 1, 0).getDate(); return sabitOdemeler.filter(odeme => typeof odeme.odemeGunu === 'number' && odeme.odemeGunu > 0 && odeme.odemeGunu <= 31).map(odeme => { let kalanGun; if (odeme.odemeGunu > bugununGunu) { kalanGun = odeme.odemeGunu - bugununGunu; } else { kalanGun = (mevcutAydakiGunSayisi - bugununGunu) + odeme.odemeGunu; } return { ...odeme, kalanGun }; }).sort((a, b) => a.kalanGun - b.kalanGun).slice(0, 3); }, [sabitOdemeler]);
    const birlesikIslemler = useMemo(() => { const filtrelenmisTransferler = transferler.filter(t => new Date(t.tarih).getFullYear() === seciliYil && new Date(t.tarih).getMonth() + 1 === seciliAy); const temelListe = [...filtrelenmisGelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER })), ...filtrelenmisTransferler.map(t => ({ ...t, tip: ISLEM_TURLERI.TRANSFER }))]; const filtrelenmisListe = temelListe.filter(islem => { const tipFiltresiGecti = birlesikFiltreTip === ISLEM_TURLERI.TUMU || islem.tip === birlesikFiltreTip; const kategoriFiltresiGecti = islem.tip === ISLEM_TURLERI.TRANSFER || birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori; const hesapFiltresiGecti = birlesikFiltreHesap === 'Tümü' || islem.hesapId === birlesikFiltreHesap || islem.gonderenHesapId === birlesikFiltreHesap || islem.aliciHesapId === birlesikFiltreHesap; return tipFiltresiGecti && kategoriFiltresiGecti && hesapFiltresiGecti; }); return filtrelenmisListe.sort((a, b) => { switch (birlesikSiralamaKriteri) { case SIRALAMA_KRITERLERI.TARIH_ESKI: return new Date(a.tarih) - new Date(b.tarih); case SIRALAMA_KRITERLERI.TUTAR_ARTAN: return a.tutar - b.tutar; case SIRALAMA_KRITERLERI.TUTAR_AZALAN: return b.tutar - a.tutar; case SIRALAMA_KRITERLERI.TARIH_YENI: default: return new Date(b.tarih) - new Date(a.tarih); } }); }, [filtrelenmisGelirler, filtrelenmisGiderler, transferler, seciliAy, seciliYil, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri, birlesikFiltreHesap]);
    const mevcutYillar = useMemo(() => { const yillar = new Set([...gelirler, ...giderler].map(islem => new Date(islem.tarih).getFullYear())); if (yillar.size === 0) yillar.add(new Date().getFullYear()); return Array.from(yillar).sort((a, b) => b - a); }, [gelirler, giderler]);
    const trendVerisi = useMemo(() => { const labels = []; const gelirlerData = []; const giderlerData = []; const bugun = new Date(); for (let i = 5; i >= 0; i--) { const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1); const yil = tarih.getFullYear(); const ay = tarih.getMonth() + 1; labels.push(tarih.toLocaleString('tr-TR', { month: 'long' })); const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); gelirlerData.push(aylikGelir); giderlerData.push(aylikGider); } return { labels, gelirler: gelirlerData, giderler: giderlerData }; }, [gelirler, giderler]);
    const yillikRaporVerisi = useMemo(() => { const aylar = []; let yillikToplamGelir = 0; let yillikToplamGider = 0; for (let i = 1; i <= 12; i++) { const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); if (aylikGelirler.length > 0 || aylikGiderler.length > 0) { const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0); const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0); yillikToplamGelir += ayGelir; yillikToplamGider += ayGider; aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider }); } } return { aylar, toplamGelir: yillikToplamGelir, toplamGider: yillikToplamGider, toplamBakiye: yillikToplamGelir - yillikToplamGider }; }, [gelirler, giderler, seciliYil]);

    // === 5. DIŞARIYA AÇILACAK DEĞERLER (contextValue) ===
    const contextValue = {
        // Ana Veri Listeleri
        giderler, gelirler, transferler, hesaplar, giderKategorileri, gelirKategorileri, kategoriRenkleri, butceler, sabitOdemeler,
        
        // Veri Yönetim Fonksiyonları
        addIslem, updateIslem, openDeleteModal,
        handleHesapEkle, handleHesapSil, handleHesapGuncelle,
        handleKategoriEkle, handleKategoriSil, handleKategoriSirala, handleKategoriGuncelle,
        handleButceEkle, handleButceSil,
        handleSabitOdemeEkle, handleSabitOdemeSil, handleSabitOdemeGuncelle,
        handleVeriIndir,

        // Filtre State'leri ve Setter'ları
        seciliAy, setSeciliAy, seciliYil, setSeciliYil,
        birlesikFiltreKategori, setBirlesikFiltreKategori,
        birlesikFiltreTip, setBirlesikFiltreTip,
        birlesikSiralamaKriteri, setBirlesikSiralamaKriteri,
        birlesikFiltreHesap, setBirlesikFiltreHesap,

        // Modal State'leri ve Kontrolleri
        isModalOpen, handleCloseModal, handleConfirmDelete, itemToDelete,

        // Hesaplanmış (Memoized) Değerler
        filtrelenmisGelirler, filtrelenmisGiderler, toplamGelir, toplamGider,
        aylikHesapGiderleri, toplamBakiye, kategoriOzeti, grafikVerisi, gelirGrafikVerisi,
        butceDurumlari, birlesikIslemler, mevcutYillar, trendVerisi, yillikRaporVerisi,
        yaklasanOdemeler, genelHesapBakiyeleri
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};

export const useFinans = () => useContext(FinansContext);