// src/context/FinansContext.jsx (TÜM HATALAR DÜZELTİLDİ - SON VERSİYON)
import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';

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
    const [transferler, setTransferler] = useState(() => JSON.parse(localStorage.getItem('transferler')) || []);
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
    const [aktifIslemTipi, setAktifIslemTipi] = useState('gider');
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState('Tümü');
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState('tarih-yeni');

    useEffect(() => { localStorage.setItem('giderler', JSON.stringify(giderler)); }, [giderler]);
    useEffect(() => { localStorage.setItem('gelirler', JSON.stringify(gelirler)); }, [gelirler]);
    useEffect(() => { localStorage.setItem('transferler', JSON.stringify(transferler)); }, [transferler]);
    useEffect(() => { localStorage.setItem('sabitOdemeler', JSON.stringify(sabitOdemeler)); }, [sabitOdemeler]);
    useEffect(() => { localStorage.setItem('butceler', JSON.stringify(butceler)); }, [butceler]);
    useEffect(() => { localStorage.setItem('giderKategorileri', JSON.stringify(giderKategorileri)); }, [giderKategorileri]);
    useEffect(() => { localStorage.setItem('gelirKategorileri', JSON.stringify(gelirKategorileri)); }, [gelirKategorileri]);
    useEffect(() => { localStorage.setItem('hesaplar', JSON.stringify(hesaplar)); }, [hesaplar]);
    useEffect(() => { localStorage.setItem('kategoriRenkleri', JSON.stringify(kategoriRenkleri)); }, [kategoriRenkleri]);

    const handleGiderVazgec = () => { setGiderDuzenlemeModu(false); setDuzenlenecekGiderId(null); setAciklama(''); setTutar(''); setKategori(giderKategorileri[0]); setTarih(getBugununTarihi()); };
    const handleGelirVazgec = () => { setGelirDuzenlemeModu(false); setDuzenlenecekGelirId(null); setGelirAciklama(''); setGelirTutar(''); setGelirKategori(gelirKategorileri[0]); setGelirTarih(getBugununTarihi()); };
    const handleSubmit = (e) => { e.preventDefault(); const isGider = aktifIslemTipi === 'gider'; const currentAciklama = isGider ? aciklama : gelirAciklama; const currentTutar = isGider ? tutar : gelirTutar; const currentKategori = isGider ? kategori : gelirKategori; const currentTarih = isGider ? tarih : gelirTarih; const isEditing = isGider ? giderDuzenlemeModu : gelirDuzenlemeModu; const editId = isGider ? duzenlenecekGiderId : duzenlenecekGelirId; if (!currentAciklama || !currentTutar || !currentKategori || !seciliHesapId) { toast.error("Lütfen tüm alanları doldurun."); return; } const newItem = { id: isEditing ? editId : Date.now(), aciklama: currentAciklama, tutar: parseFloat(currentTutar), kategori: currentKategori, tarih: currentTarih, hesapId: seciliHesapId }; if (isGider) { setGiderler(prev => isEditing ? prev.map(g => g.id === editId ? newItem : g) : [...prev, newItem]); toast.success(`Gider başarıyla ${isEditing ? 'güncellendi' : 'eklendi'}!`); handleGiderVazgec(); } else { setGelirler(prev => isEditing ? prev.map(g => g.id === editId ? newItem : g) : [...prev, newItem]); toast.success(`Gelir başarıyla ${isEditing ? 'güncellendi' : 'eklendi'}!`); handleGelirVazgec(); } };
    const handleTransferSubmit = (transferData) => { const { tutar, gonderenHesapId, aliciHesapId, tarih, aciklama } = transferData; if (!tutar || !gonderenHesapId || !aliciHesapId) { toast.error("Lütfen tüm zorunlu alanları doldurun."); return; } if (gonderenHesapId === aliciHesapId) { toast.error("Gönderen ve alıcı hesap aynı olamaz."); return; } if (parseFloat(tutar) <= 0) { toast.error("Tutar pozitif bir değer olmalıdır."); return; } const yeniTransfer = { id: Date.now(), tutar: parseFloat(tutar), gonderenHesapId: parseInt(gonderenHesapId), aliciHesapId: parseInt(aliciHesapId), tarih, aciklama: aciklama || "Hesaplar Arası Transfer", tip: 'transfer' }; setTransferler(prev => [...prev, yeniTransfer]); toast.success("Transfer başarıyla gerçekleştirildi!"); };
    const handleGiderDuzenleBaslat = (gider) => { setAktifIslemTipi('gider'); setGiderDuzenlemeModu(true); setDuzenlenecekGiderId(gider.id); setAciklama(gider.aciklama); setTutar(gider.tutar); setKategori(gider.kategori); setTarih(gider.tarih); setSeciliHesapId(gider.hesapId); };
    const handleGelirDuzenleBaslat = (gelir) => { setAktifIslemTipi('gelir'); setGelirDuzenlemeModu(true); setDuzenlenecekGelirId(gelir.id); setGelirAciklama(gelir.aciklama); setGelirTutar(gelir.tutar); setGelirKategori(gelir.kategori); setGelirTarih(gelir.tarih); setSeciliHesapId(gelir.hesapId); };
    const handleGiderSil = (id) => { setItemToDelete({ id, type: 'gider' }); setIsModalOpen(true); };
    const handleGelirSil = (id) => { setItemToDelete({ id, type: 'gelir' }); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setItemToDelete(null); };
    const handleConfirmDelete = () => { if (!itemToDelete) return; if (itemToDelete.type === 'gider') { setGiderler(prev => prev.filter(g => g.id !== itemToDelete.id)); toast.error('Gider silindi.'); } else { setGelirler(prev => prev.filter(g => g.id !== itemToDelete.id)); toast.error('Gelir silindi.'); } handleCloseModal(); };
    const handleHesapEkle = (yeniHesapAdi) => { if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) { toast.error("Bu hesap adı zaten mevcut veya geçersiz."); return; } const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() }; setHesaplar(prev => [...prev, yeniHesap]); toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`); };
    const handleHesapSil = (silinecekId) => { if (hesaplar.length <= 1) { toast.error("En az bir hesap kalmalıdır."); return; } if ([...giderler, ...gelirler, ...transferler].some(islem => islem.hesapId === silinecekId || islem.gonderenHesapId === silinecekId || islem.aliciHesapId === silinecekId)) { toast.error("Bu hesapta işlem bulunduğu için silinemez."); return; } setHesaplar(prev => prev.filter(h => h.id !== silinecekId)); toast.error("Hesap silindi."); };
    const handleKategoriEkle = (tip, yeniKategori) => { const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri; const setKategoriler = tip === 'gider' ? setGiderKategorileri : setGelirKategorileri; if (!kategoriler.includes(yeniKategori) && yeniKategori) { setKategoriler(prev => [...prev, yeniKategori]); toast.success(`${tip === 'gider' ? 'Gider' : 'Gelir'} kategorisi eklendi!`); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } };
    const handleKategoriSil = (tip, kategori) => { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } if (tip === 'gider') { setGiderKategorileri(prev => prev.filter(k => k !== kategori)); } else { setGelirKategorileri(prev => prev.filter(k => k !== kategori)); } toast.error(`${tip === 'gider' ? 'Gider' : 'Gelir'} kategorisi silindi.`); };
    const handleKategoriSirala = (tip, aktifId, hedefId) => { const setKategoriler = tip === 'gider' ? setGiderKategorileri : setGelirKategorileri; setKategoriler(prev => { const eskiIndex = prev.findIndex(k => k === aktifId); const yeniIndex = prev.findIndex(k => k === hedefId); return arrayMove(prev, eskiIndex, yeniIndex); }); };
    const handleButceEkle = (yeniButce) => { const mevcutButce = butceler.find(b => b.kategori === yeniButce.kategori); if (mevcutButce) { setButceler(butceler.map(b => b.kategori === yeniButce.kategori ? yeniButce : b)); toast.success(`'${yeniButce.kategori}' bütçesi güncellendi!`); } else { setButceler(prev => [...prev, yeniButce]); toast.success(`'${yeniButce.kategori}' için yeni bütçe oluşturuldu!`); } };
    const handleButceSil = (kategori) => { setButceler(butceler.filter(b => b.kategori !== kategori)); toast.error(`'${kategori}' bütçesi silindi.`); };
    const handleSabitOdemeEkle = (yeniOdeme) => { setSabitOdemeler(prev => [...prev, { id: Date.now(), ...yeniOdeme }]); toast.success('Sabit ödeme başarıyla eklendi!'); };
    const handleSabitOdemeSil = (id) => { setSabitOdemeler(sabitOdemeler.filter(odeme => odeme.id !== id)); toast.error('Sabit ödeme silindi.'); };
    const handleVeriIndir = () => { const basliklar = "ID,Tip,Açıklama,Tutar,Kategori,Tarih,Hesap ID"; const birlesikIslemler = [...gelirler.map(g => ({ ...g, tip: 'gelir' })), ...giderler.map(g => ({ ...g, tip: 'gider' }))]; const satirlar = birlesikIslemler.map(islem => `${islem.id},${islem.tip},"${islem.aciklama.replace(/"/g, '""')}",${islem.tutar},${islem.kategori},${islem.tarih},${islem.hesapId}`); const csvIcerik = [basliklar, ...satirlar].join('\n'); const blob = new Blob([`\uFEFF${csvIcerik}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `finans_raporu.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } toast.success("Rapor indirildi!"); };
    
    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);
    const gecenAyFiltrelenmisGiderler = useMemo(() => {
        const simdi = new Date(seciliYil, seciliAy - 1, 1);
        const gecenAyTarih = new Date(simdi.setMonth(simdi.getMonth() - 1));
        const gecenAy = gecenAyTarih.getMonth() + 1;
        const gecenAyinYili = gecenAyTarih.getFullYear();

        return giderler.filter(g => 
            new Date(g.tarih).getFullYear() === gecenAyinYili && 
            new Date(g.tarih).getMonth() + 1 === gecenAy
        );
    }, [giderler, seciliAy, seciliYil]);
    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);
    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
 const butceDurumlari = useMemo(() => butceler.map(butce => {
        // Bu ayki harcama (bu zaten vardı)
        const harcanan = filtrelenmisGiderler
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);

        // YENİ: Geçen ayki harcama
        const gecenAyHarcanan = gecenAyFiltrelenmisGiderler
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);
        
        // YENİ: Değişim yüzdesi hesaplaması
        let degisimYuzdesi = 0;
        if (gecenAyHarcanan > 0) {
            degisimYuzdesi = ((harcanan - gecenAyHarcanan) / gecenAyHarcanan) * 100;
        } else if (harcanan > 0) {
            degisimYuzdesi = 100; // Geçen ay 0 harcanmış, bu ay harcanmışsa %100 artış
        }

        // ... (kalan, yuzdeRaw, durum gibi eski hesaplamalar aynı kalıyor)
        const kalan = butce.limit - harcanan;
        const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0;
        const yuzde = Math.min(yuzdeRaw, 100);
        let durum = 'normal';
        if (yuzdeRaw > 100) durum = 'asildi';
        else if (yuzdeRaw >= 90) durum = 'uyari';
        
        return { ...butce, harcanan, kalan, yuzde, yuzdeRaw, durum, degisimYuzdesi };
    }).sort((a, b) => b.yuzdeRaw - a.yuzdeRaw), [butceler, filtrelenmisGiderler, gecenAyFiltrelenmisGiderler]); // Bağımlılıklara yenisini ekle    
    const kategoriOzeti = useMemo(() => filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}), [filtrelenmisGiderler]);
    const grafikVerisi = useMemo(() => { const labels = Object.keys(kategoriOzeti); const data = Object.values(kategoriOzeti); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#CCCCCC'); return { labels, datasets: [{ label: 'Harcama Miktarı', data, backgroundColor, borderColor: '#ffffff', borderWidth: 2 }] }; }, [kategoriOzeti, kategoriRenkleri]);
    const gelirGrafikVerisi = useMemo(() => { const gelirKaynaklari = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}); const labels = Object.keys(gelirKaynaklari); const data = Object.values(gelirKaynaklari); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71'); return { labels, datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }] }; }, [filtrelenmisGelirler, kategoriRenkleri]);
    const birlesikIslemler = useMemo(() => { const temelListe = [...filtrelenmisGelirler.map(g => ({ ...g, tip: 'gelir' })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: 'gider' }))]; const filtrelenmisListe = temelListe.filter(islem => (birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip) && (birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori)); return filtrelenmisListe.sort((a, b) => { switch (birlesikSiralamaKriteri) { case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih); case 'tutar-artan': return a.tutar - b.tutar; case 'tutar-azalan': return b.tutar - a.tutar; case 'tarih-yeni': default: return new Date(b.tarih) - new Date(a.tarih); } }); }, [filtrelenmisGelirler, filtrelenmisGiderler, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri]);
    const mevcutYillar = useMemo(() => { const yillar = new Set([...gelirler, ...giderler].map(islem => new Date(islem.tarih).getFullYear())); if (yillar.size === 0) yillar.add(new Date().getFullYear()); return Array.from(yillar).sort((a, b) => b - a); }, [gelirler, giderler]);
    const trendVerisi = useMemo(() => { const labels = []; const gelirlerData = []; const giderlerData = []; const bugun = new Date(); for (let i = 5; i >= 0; i--) { const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1); const yil = tarih.getFullYear(); const ay = tarih.getMonth() + 1; labels.push(tarih.toLocaleString('tr-TR', { month: 'long' })); const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); gelirlerData.push(aylikGelir); giderlerData.push(aylikGider); } return { labels, gelirler: gelirlerData, giderler: giderlerData }; }, [gelirler, giderler]);
    const yillikRaporVerisi = useMemo(() => { const aylar = []; let yillikToplamGelir = 0; let yillikToplamGider = 0; for (let i = 1; i <= 12; i++) { const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); if (aylikGelirler.length > 0 || aylikGiderler.length > 0) { const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0); const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0); yillikToplamGelir += ayGelir; yillikToplamGider += ayGider; aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider }); } } return { aylar, toplamGelir: yillikToplamGelir, toplamGider: yillikToplamGider, toplamBakiye: yillikToplamGelir - yillikToplamGider }; }, [gelirler, giderler, seciliYil]);

    const contextValue = {
        giderKategorileri, setGiderKategorileri, gelirKategorileri, setGelirKategorileri, hesaplar, setHesaplar, seciliHesapId, setSeciliHesapId, seciliAy, setSeciliAy, seciliYil, setSeciliYil, aktifIslemTipi, setAktifIslemTipi, aciklama, setAciklama, tutar, setTutar, kategori, setKategori, tarih, setTarih, gelirAciklama, setGelirAciklama, gelirTutar, setGelirTutar, gelirKategori, setGelirKategori, gelirTarih, setGelirTarih, giderDuzenlemeModu, gelirDuzenlemeModu, birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikFiltreTip, setBirlesikFiltreTip, birlesikSiralamaKriteri, setBirlesikSiralamaKriteri, handleSubmit, handleTransferSubmit, handleGiderDuzenleBaslat, handleGelirDuzenleBaslat, handleGiderSil, handleGelirSil, handleGiderVazgec, handleGelirVazgec, handleCloseModal, handleConfirmDelete, handleHesapEkle, handleHesapSil, handleKategoriEkle, handleKategoriSil, handleKategoriSirala, filtrelenmisGelirler, filtrelenmisGiderler, toplamGelir, toplamGider, aylikHesapGiderleri, toplamBakiye, kategoriOzeti, grafikVerisi, gelirGrafikVerisi, butceDurumlari, birlesikIslemler, mevcutYillar, isModalOpen, itemToDelete, kategoriRenkleri, transferler, butceler, sabitOdemeler, handleButceEkle, handleButceSil, handleSabitOdemeEkle, handleSabitOdemeSil, handleVeriIndir, trendVerisi, yillikRaporVerisi
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};

export const useFinans = () => useContext(FinansContext);