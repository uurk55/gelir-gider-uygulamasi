// src/context/FinansContext.jsx (TÜM HATALARI GİDERİLMİŞ NİHAİ VERSİYON)

import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import { ISLEM_TURLERI, SIRALAMA_KRITERLERI } from '../utils/constants';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { 
    collection, 
    onSnapshot, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc,
    writeBatch
} from 'firebase/firestore';

const FinansContext = createContext();

export const useFinans = () => useContext(FinansContext);

const GIDER_KATEGORILERI_VARSAYILAN = ["Market", "Fatura", "Ulaşım", "Eğlence", "Sağlık", "Kredi", "Kira", "Abonelik", "Diğer"];
const GELIR_KATEGORILERI_VARSAYILAN = ["Maaş", "Ek Gelir", "Hediye", "Diğer"];
const VARSAYILAN_HESAPLAR = [{ id: Date.now(), ad: 'Nakit' }, { id: Date.now() + 1, ad: 'Banka Hesabı' }];

const generateStablePastelColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 85%)`;
};

export const FinansProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // State'ler
    const [giderler, setGiderler] = useState([]);
    const [gelirler, setGelirler] = useState([]);
    const [transferler, setTransferler] = useState([]);
    const [sabitOdemeler, setSabitOdemeler] = useState([]);
    const [butceler, setButceler] = useState([]);
    const [hesaplar, setHesaplar] = useState(VARSAYILAN_HESAPLAR);
    const [giderKategorileri, setGiderKategorileri] = useState(GIDER_KATEGORILERI_VARSAYILAN);
    const [gelirKategorileri, setGelirKategorileri] = useState(GELIR_KATEGORILERI_VARSAYILAN);
    const [kategoriRenkleri, setKategoriRenkleri] = useState({});
    
    // UI State'leri
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState(ISLEM_TURLERI.TUMU);
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState(SIRALAMA_KRITERLERI.TARIH_YENI);
    const [birlesikFiltreHesap, setBirlesikFiltreHesap] = useState('Tümü');

    // Firestore'dan veri okuma
    useEffect(() => {
        if (currentUser) {
            const uid = currentUser.uid;
            const unsubscribers = [
                onSnapshot(collection(db, 'users', uid, 'gelirler'), snapshot => setGelirler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
                onSnapshot(collection(db, 'users', uid, 'giderler'), snapshot => setGiderler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
                onSnapshot(collection(db, 'users', uid, 'transferler'), snapshot => setTransferler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
                onSnapshot(collection(db, 'users', uid, 'butceler'), snapshot => setButceler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
                onSnapshot(collection(db, 'users', uid, 'sabitOdemeler'), snapshot => setSabitOdemeler(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
                onSnapshot(doc(db, 'users', uid), async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setHesaplar(data.hesaplar || VARSAYILAN_HESAPLAR);
                        setGiderKategorileri(data.giderKategorileri || GIDER_KATEGORILERI_VARSAYILAN);
                        setGelirKategorileri(data.gelirKategorileri || GELIR_KATEGORILERI_VARSAYILAN);
                    } else {
                        const userDocRef = doc(db, 'users', uid);
                        await setDoc(userDocRef, {
                            hesaplar: VARSAYILAN_HESAPLAR,
                            giderKategorileri: GIDER_KATEGORILERI_VARSAYILAN,
                            gelirKategorileri: GELIR_KATEGORILERI_VARSAYILAN
                        });
                    }
                })
            ];
            return () => unsubscribers.forEach(unsub => unsub());
        } else {
            setGelirler([]); setGiderler([]); setTransferler([]); setButceler([]); setSabitOdemeler([]);
            setHesaplar(VARSAYILAN_HESAPLAR); setGiderKategorileri(GIDER_KATEGORILERI_VARSAYILAN); setGelirKategorileri(GELIR_KATEGORILERI_VARSAYILAN);
        }
    }, [currentUser]);

    useEffect(() => {
        const tumKategoriler = [...giderKategorileri, ...gelirKategorileri];
        const yeniRenkHaritasi = {};
        tumKategoriler.forEach(kategori => {
            if (!yeniRenkHaritasi[kategori]) yeniRenkHaritasi[kategori] = generateStablePastelColor(kategori);
        });
        setKategoriRenkleri(yeniRenkHaritasi);
    }, [giderKategorileri, gelirKategorileri]);

    const updateAyarlar = async (yeniAyarlar) => {
        if (!currentUser) return;
        const ayarlarRef = doc(db, 'users', currentUser.uid);
        await setDoc(ayarlarRef, yeniAyarlar, { merge: true });
    };

    const addIslem = async (tip, islemData) => {
        if (!currentUser) return toast.error("Giriş yapmalısınız.");
        const collectionName = tip === 'Transfer' ? 'transferler' : tip.toLowerCase() + 'ler';
        const collectionRef = collection(db, 'users', currentUser.uid, collectionName);
        await addDoc(collectionRef, islemData);
        toast.success(tip.charAt(0).toUpperCase() + tip.slice(1) + " eklendi!");
    };

    const updateIslem = async (tip, id, guncelIslemData) => {
        if (!currentUser) return toast.error("Giriş yapmalısınız.");
        const collectionName = tip === 'Transfer' ? 'transferler' : tip.toLowerCase() + 'ler';
        const docRef = doc(db, 'users', currentUser.uid, collectionName, id);
        await updateDoc(docRef, guncelIslemData);
        toast.success(tip.charAt(0).toUpperCase() + tip.slice(1) + " güncellendi!");
    };
    
    const openDeleteModal = (id, type) => setItemToDelete({ id, type });
    const handleCloseModal = () => setItemToDelete(null);

    const handleConfirmDelete = async () => {
        if (!itemToDelete || !currentUser) return;
        const { id, type } = itemToDelete;
        const collectionName = type === 'Transfer' ? 'transferler' : type.toLowerCase() + 'ler';
        const docRef = doc(db, 'users', currentUser.uid, collectionName, id);
        await deleteDoc(docRef);
        toast.error('İşlem silindi.');
        handleCloseModal();
    };
    
    const handleHesapEkle = (yeniHesapAdi) => {
        if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) return toast.error("Bu hesap adı zaten mevcut veya geçersiz.");
        const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() };
        updateAyarlar({ hesaplar: [...hesaplar, yeniHesap] });
        toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`);
    };

    const handleHesapSil = (silinecekId) => {
        if (hesaplar.length <= 1) return toast.error("En az bir hesap kalmalıdır.");
        const isUsed = [...gelirler, ...giderler].some(islem => islem.hesapId === silinecekId) || transferler.some(t => t.gonderenHesapId === silinecekId || t.aliciHesapId === silinecekId);
        if (isUsed) return toast.error("Bu hesapta işlem bulunduğu için silinemez.");
        updateAyarlar({ hesaplar: hesaplar.filter(h => h.id !== silinecekId) });
        toast.error("Hesap silindi.");
    };

    const handleHesapGuncelle = (id, yeniAd) => {
        if (!yeniAd.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniAd.trim().toLowerCase() && h.id !== id)) return toast.error("Bu hesap adı zaten mevcut veya geçersiz.");
        updateAyarlar({ hesaplar: hesaplar.map(h => (h.id === id ? { ...h, ad: yeniAd.trim() } : h)) });
        toast.success("Hesap adı güncellendi!");
    };

    const handleKategoriEkle = (tip, yeniKategori) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri;
        if (kategoriler.includes(yeniKategori) || !yeniKategori) return toast.error("Bu kategori zaten mevcut veya geçersiz.");
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri';
        updateAyarlar({ [key]: [...kategoriler, yeniKategori] });
        toast.success(`${tip.charAt(0).toUpperCase() + tip.slice(1)} kategorisi eklendi!`);
    };

    const handleKategoriSil = async (tip, kategori) => {
        if (kategori === 'Diğer') return toast.error("'Diğer' kategorisi silinemez.");
        const isUsed = (tip === 'gider' ? giderler : gelirler).some(islem => islem.kategori === kategori);
        if (isUsed) return toast.error("Bu kategori kullanımda olan işlemlere sahip olduğu için silinemez.");
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri';
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri;
        await updateAyarlar({ [key]: kategoriler.filter(k => k !== kategori) });
        toast.error(`${tip.charAt(0).toUpperCase() + tip.slice(1)} kategorisi silindi.`);
    };
    
    const handleKategoriSirala = (tip, aktifId, hedefId) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri;
        const yeniSiralanmisListe = arrayMove(kategoriler, kategoriler.indexOf(aktifId), kategoriler.indexOf(hedefId));
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri';
        updateAyarlar({ [key]: yeniSiralanmisListe });
    };

    const handleKategoriGuncelle = async (tip, eskiAd, yeniAd) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri;
        if (!yeniAd.trim() || kategoriler.some(k => k.toLowerCase() === yeniAd.trim().toLowerCase() && k.toLowerCase() !== eskiAd.toLowerCase())) return toast.error("Bu kategori adı zaten mevcut veya geçersiz.");
        
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri';
        const islemlerKey = tip === 'gider' ? 'giderler' : 'gelirler';
        const islemler = tip === 'gider' ? giderler : gelirler;
        const batch = writeBatch(db);
        
        const guncelKategoriler = kategoriler.map(k => (k === eskiAd ? yeniAd.trim() : k));
        const ayarlarRef = doc(db, 'users', currentUser.uid);
        batch.update(ayarlarRef, { [key]: guncelKategoriler });

        islemler.forEach(islem => {
            if (islem.kategori === eskiAd) {
                const islemRef = doc(db, 'users', currentUser.uid, islemlerKey, islem.id);
                batch.update(islemRef, { kategori: yeniAd.trim() });
            }
        });

        await batch.commit();
        toast.success("Kategori ve ilgili tüm işlemler güncellendi!");
    };
    
    const handleButceEkle = (yeniButce) => addDoc(collection(db, 'users', currentUser.uid, 'butceler'), yeniButce).then(() => toast.success("Bütçe eklendi!"));
    const handleButceSil = (id) => deleteDoc(doc(db, 'users', currentUser.uid, 'butceler', id)).then(() => toast.error("Bütçe silindi."));
    const handleSabitOdemeEkle = (yeniOdeme) => addDoc(collection(db, 'users', currentUser.uid, 'sabitOdemeler'), yeniOdeme).then(() => toast.success("Sabit ödeme eklendi!"));
    const handleSabitOdemeSil = (id) => deleteDoc(doc(db, 'users', currentUser.uid, 'sabitOdemeler', id)).then(() => toast.error("Sabit ödeme silindi."));
    const handleSabitOdemeGuncelle = (id, guncelOdeme) => updateDoc(doc(db, 'users', currentUser.uid, 'sabitOdemeler', id), guncelOdeme).then(() => toast.success("Sabit ödeme güncellendi!"));
    
    const handleVeriIndir = () => { /* Bu fonksiyon lokal verilerle çalıştığı için şimdilik olduğu gibi kalabilir */ };

    // --- HESAPLANMIŞ DEĞERLER (useMemo'lar) ---
    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);
    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);
    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
    const butceDurumlari = useMemo(() => butceler.map(butce => { const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0); const kalan = butce.limit - harcanan; const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0; return { ...butce, harcanan, kalan, yuzde: Math.min(yuzdeRaw, 100), yuzdeRaw }; }), [butceler, filtrelenmisGiderler]);
    const yaklasanOdemeler = useMemo(() => { const bugun = new Date(); const bugununGunu = bugun.getDate(); return sabitOdemeler.map(odeme => { let kalanGun = odeme.odemeGunu - bugununGunu; if (kalanGun < 0) kalanGun += new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0).getDate(); return { ...odeme, kalanGun }; }).sort((a, b) => a.kalanGun - b.kalanGun).slice(0, 3); }, [sabitOdemeler]);
    const kategoriOzeti = useMemo(() => filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}), [filtrelenmisGiderler]);
    
    const grafikVerisi = useMemo(() => {
        const labels = Object.keys(kategoriOzeti);
        if (labels.length === 0) {
            return {
                labels: ['Veri Yok'],
                datasets: [{ label: 'Harcama Miktarı', data: [1], backgroundColor: ['#E0E0E0'], borderColor: '#ffffff', borderWidth: 2 }],
            };
        }
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
            if (!acc[kategori]) acc[kategori] = 0;
            acc[kategori] += tutar;
            return acc;
        }, {});
    
        const labels = Object.keys(gelirKaynaklari);
    
        if (labels.length === 0) {
            return {
                labels: ['Veri Yok'],
                datasets: [{ label: 'Gelir Kaynağı', data: [], backgroundColor: [] }],
            };
        }
    
        const data = Object.values(gelirKaynaklari);
        const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71');
        return {
            labels,
            datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }],
        };
    }, [filtrelenmisGelirler, kategoriRenkleri]);

    const birlesikIslemler = useMemo(() => { const temelListe = [...filtrelenmisGelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER })), ...transferler.filter(t => new Date(t.tarih).getFullYear() === seciliYil && new Date(t.tarih).getMonth() + 1 === seciliAy).map(t => ({ ...t, tip: ISLEM_TURLERI.TRANSFER }))]; const filtrelenmisListe = temelListe.filter(islem => (birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip) && (islem.tip === 'Transfer' || birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori) && (birlesikFiltreHesap === 'Tümü' || islem.hesapId === birlesikFiltreHesap || islem.gonderenHesapId === birlesikFiltreHesap || islem.aliciHesapId === birlesikFiltreHesap)); return filtrelenmisListe.sort((a, b) => { switch (birlesikSiralamaKriteri) { case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih); case 'tutar-artan': return a.tutar - b.tutar; case 'tutar-azalan': return b.tutar - a.tutar; default: return new Date(b.tarih) - new Date(a.tarih); } }); }, [filtrelenmisGelirler, filtrelenmisGiderler, transferler, seciliAy, seciliYil, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri, birlesikFiltreHesap]);
    
    const mevcutYillar = useMemo(() => {
        const yillar = new Set([...gelirler, ...giderler].map(islem => new Date(islem.tarih).getFullYear()));
        if (yillar.size === 0) { yillar.add(new Date().getFullYear()); }
        return Array.from(yillar).sort((a, b) => b - a);
    }, [gelirler, giderler]);

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
        let yillikToplamGelir = 0;
        let yillikToplamGider = 0;
        for (let i = 1; i <= 12; i++) {
            const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i);
            const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i);
            if (aylikGelirler.length > 0 || aylikGiderler.length > 0) {
                const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0);
                const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0);
                yillikToplamGelir += ayGelir;
                yillikToplamGider += ayGider;
                aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider });
            }
        }
        return { aylar, toplamGelir: yillikToplamGelir, toplamGider: yillikToplamGider, toplamBakiye: yillikToplamGelir - yillikToplamGider };
    }, [gelirler, giderler, seciliYil]);

    const contextValue = {
        giderler, gelirler, transferler, hesaplar, giderKategorileri, gelirKategorileri, kategoriRenkleri, butceler, sabitOdemeler,
        addIslem, updateIslem, openDeleteModal, handleCloseModal, handleConfirmDelete,
        handleHesapEkle, handleHesapSil, handleHesapGuncelle,
        handleKategoriEkle, handleKategoriSil, handleKategoriSirala, handleKategoriGuncelle,
        handleButceEkle, handleButceSil,
        handleSabitOdemeEkle, handleSabitOdemeSil, handleSabitOdemeGuncelle,
        handleVeriIndir,
        seciliAy, setSeciliAy, seciliYil, setSeciliYil,
        birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikFiltreTip, setBirlesikFiltreTip,
        birlesikSiralamaKriteri, setBirlesikSiralamaKriteri, birlesikFiltreHesap, setBirlesikFiltreHesap,
        isModalOpen, itemToDelete,
        filtrelenmisGelirler, filtrelenmisGiderler, toplamGelir, toplamGider,
        toplamBakiye, kategoriOzeti, grafikVerisi, gelirGrafikVerisi, butceDurumlari, birlesikIslemler,
        mevcutYillar, 
        trendVerisi, 
        yillikRaporVerisi,
        yaklasanOdemeler, genelHesapBakiyeleri, aylikHesapGiderleri
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};