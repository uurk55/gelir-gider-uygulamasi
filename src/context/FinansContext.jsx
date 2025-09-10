// src/context/FinansContext.jsx (YAKLAŞAN ÖDEMELERE TUTAR EKLENMİŞ NİHAİ VERSİYON)

import Papa from 'papaparse';
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

const getLocalData = (key, defaultValue) => {
    try {
        const localValue = localStorage.getItem(key);
        return localValue ? JSON.parse(localValue) : defaultValue;
    } catch (error) {
        console.error(`localStorage'dan veri okunamadı (${key}):`, error);
        return defaultValue;
    }
};

const setLocalData = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`localStorage'a veri yazılamadı (${key}):`, error);
    }
};

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

    const [giderler, setGiderler] = useState(() => currentUser ? [] : getLocalData('guest_giderler', []));
    const [gelirler, setGelirler] = useState(() => currentUser ? [] : getLocalData('guest_gelirler', []));
    const [transferler, setTransferler] = useState(() => currentUser ? [] : getLocalData('guest_transferler', []));
    const [sabitOdemeler, setSabitOdemeler] = useState(() => currentUser ? [] : getLocalData('guest_sabitOdemeler', []));
    const [butceler, setButceler] = useState(() => currentUser ? [] : getLocalData('guest_butceler', []));
    const [hesaplar, setHesaplar] = useState(() => currentUser ? VARSAYILAN_HESAPLAR : getLocalData('guest_hesaplar', VARSAYILAN_HESAPLAR));
    const [giderKategorileri, setGiderKategorileri] = useState(() => currentUser ? GIDER_KATEGORILERI_VARSAYILAN : getLocalData('guest_giderKategorileri', GIDER_KATEGORILERI_VARSAYILAN));
    const [gelirKategorileri, setGelirKategorileri] = useState(() => currentUser ? GELIR_KATEGORILERI_VARSAYILAN : getLocalData('guest_gelirKategorileri', GELIR_KATEGORILERI_VARSAYILAN));
    
    const [kategoriRenkleri, setKategoriRenkleri] = useState({});
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState(ISLEM_TURLERI.TUMU);
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState(SIRALAMA_KRITERLERI.TARIH_YENI);
    const [birlesikFiltreHesap, setBirlesikFiltreHesap] = useState('Tümü');

    const transferGuestDataToFirestore = async (uid) => {
        if (!localStorage.getItem('guest_giderler') && !localStorage.getItem('guest_gelirler')) { return; }
        const toastId = toast.loading("Misafir verileriniz hesabınıza aktarılıyor...");
        const batch = writeBatch(db);
        const guestDataMap = {
            'gelirler': getLocalData('guest_gelirler', []), 'giderler': getLocalData('guest_giderler', []), 'transferler': getLocalData('guest_transferler', []),
            'butceler': getLocalData('guest_butceler', []), 'sabitOdemeler': getLocalData('guest_sabitOdemeler', [])
        };
        Object.keys(guestDataMap).forEach(collectionName => {
            guestDataMap[collectionName].forEach(item => {
                const docRef = doc(collection(db, 'users', uid, collectionName));
                const { id, ...data } = item;
                batch.set(docRef, data);
            });
        });
        const ayarlarRef = doc(db, 'users', uid);
        batch.set(ayarlarRef, {
            hesaplar: getLocalData('guest_hesaplar', VARSAYILAN_HESAPLAR),
            giderKategorileri: getLocalData('guest_giderKategorileri', GIDER_KATEGORILERI_VARSAYILAN),
            gelirKategorileri: getLocalData('guest_gelirKategorileri', GELIR_KATEGORILERI_VARSAYILAN)
        }, { merge: true });
        await batch.commit();
        Object.keys(guestDataMap).forEach(key => localStorage.removeItem(`guest_${key}`));
        localStorage.removeItem('guest_hesaplar'); localStorage.removeItem('guest_giderKategorileri'); localStorage.removeItem('guest_gelirKategorileri');
        toast.success("Misafir verileriniz hesabınıza başarıyla aktarıldı!", { id: toastId });
    };

    useEffect(() => {
        if (currentUser) {
            transferGuestDataToFirestore(currentUser.uid);
            const uid = currentUser.uid;
            const unsubscribers = [
                onSnapshot(collection(db, 'users', uid, 'gelirler'), s => setGelirler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, 'users', uid, 'giderler'), s => setGiderler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, 'users', uid, 'transferler'), s => setTransferler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, 'users', uid, 'butceler'), s => setButceler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, 'users', uid, 'sabitOdemeler'), s => setSabitOdemeler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(doc(db, 'users', uid), async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setHesaplar(data.hesaplar || VARSAYILAN_HESAPLAR);
                        setGiderKategorileri(data.giderKategorileri || GIDER_KATEGORILERI_VARSAYILAN);
                        setGelirKategorileri(data.gelirKategorileri || GELIR_KATEGORILERI_VARSAYILAN);
                    } else {
                        await setDoc(doc(db, 'users', uid), { hesaplar: VARSAYILAN_HESAPLAR, giderKategorileri: GIDER_KATEGORILERI_VARSAYILAN, gelirKategorileri: GELIR_KATEGORILERI_VARSAYILAN });
                    }
                })
            ];
            return () => unsubscribers.forEach(unsub => unsub());
        } else {
            setGelirler(getLocalData('guest_gelirler', [])); setGiderler(getLocalData('guest_giderler', [])); setTransferler(getLocalData('guest_transferler', []));
            setButceler(getLocalData('guest_butceler', [])); setSabitOdemeler(getLocalData('guest_sabitOdemeler', [])); setHesaplar(getLocalData('guest_hesaplar', VARSAYILAN_HESAPLAR));
            setGiderKategorileri(getLocalData('guest_giderKategorileri', GIDER_KATEGORILERI_VARSAYILAN)); setGelirKategorileri(getLocalData('guest_gelirKategorileri', GELIR_KATEGORILERI_VARSAYILAN));
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
        if (!currentUser) {
            Object.keys(yeniAyarlar).forEach(key => {
                const localKey = `guest_${key}`; setLocalData(localKey, yeniAyarlar[key]);
                if (key === 'hesaplar') setHesaplar(yeniAyarlar[key]);
                if (key === 'giderKategorileri') setGiderKategorileri(yeniAyarlar[key]);
                if (key === 'gelirKategorileri') setGelirKategorileri(yeniAyarlar[key]);
            }); return;
        }
        await setDoc(doc(db, 'users', currentUser.uid), yeniAyarlar, { merge: true });
    };

    const addIslem = async (tip, islemData) => {
        let collectionName = tip.toLowerCase() + 'ler'; if (tip === 'Transfer') collectionName = 'transferler';
        if (!currentUser) {
            const key = `guest_${collectionName}`; const currentData = getLocalData(key, []); const newData = { ...islemData, id: `${Date.now()}-${Math.random()}` }; setLocalData(key, [...currentData, newData]);
            const stateSetter = { 'gelirler': setGelirler, 'giderler': setGiderler, 'transferler': setTransferler }; stateSetter[collectionName](prev => [...prev, newData]);
            toast.success(`${tip} eklendi! (Misafir)`); return;
        }
        await addDoc(collection(db, 'users', currentUser.uid, collectionName), islemData); toast.success(`${tip} eklendi!`);
    };

    const updateIslem = async (tip, id, guncelIslemData) => {
        let collectionName = tip.toLowerCase() + 'ler'; if (tip === 'Transfer') collectionName = 'transferler';
        if (!currentUser) {
            const key = `guest_${collectionName}`; const currentData = getLocalData(key, []); const updatedData = currentData.map(item => item.id === id ? { ...item, ...guncelIslemData } : item);
            setLocalData(key, updatedData);
            const stateSetter = { 'gelirler': setGelirler, 'giderler': setGiderler, 'transferler': setTransferler }; stateSetter[collectionName](updatedData);
            toast.success(`${tip} güncellendi! (Misafir)`); return;
        }
        await updateDoc(doc(db, 'users', currentUser.uid, collectionName, id), guncelIslemData); toast.success(`${tip} güncellendi!`);
    };
    
    const openDeleteModal = (id, type) => {
        setItemToDelete({ id, type });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { id, type } = itemToDelete;
        let collectionName;
        if (type === ISLEM_TURLERI.TRANSFER) {
            collectionName = 'transferler';
        } else if (type) {
            collectionName = type.toLowerCase() + 'ler';
        } else {
            toast.error("Hata: Silinecek işlem tipi bulunamadı.");
            return handleCloseModal();
        }
        if (!currentUser) {
            const key = `guest_${collectionName}`;
            const currentData = getLocalData(key, []);
            const updatedData = currentData.filter(item => item.id !== id);
            setLocalData(key, updatedData);
            const stateSetter = { 'gelirler': setGelirler, 'giderler': setGiderler, 'transferler': setTransferler };
            if (stateSetter[collectionName]) { stateSetter[collectionName](updatedData); }
            toast.error('İşlem silindi. (Misafir)');
            handleCloseModal();
            return;
        }
        try {
            const docRef = doc(db, 'users', currentUser.uid, collectionName, id);
            await deleteDoc(docRef);
            toast.error('İşlem başarıyla silindi.');
        } catch (error) {
            console.error("Tekli silme hatası:", error);
            toast.error("İşlem silinirken bir hata oluştu.");
        } finally {
            handleCloseModal();
        }
    };
    
    const handleHesapEkle = (yeniHesapAdi) => {
        if (!yeniHesapAdi.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniHesapAdi.trim().toLowerCase())) return toast.error("Bu hesap adı zaten mevcut veya geçersiz.");
        const yeniHesap = { id: Date.now(), ad: yeniHesapAdi.trim() }; updateAyarlar({ hesaplar: [...hesaplar, yeniHesap] }); toast.success(`'${yeniHesapAdi.trim()}' hesabı eklendi!`);
    };

    const handleHesapSil = (silinecekId) => {
        if (hesaplar.length <= 1) return toast.error("En az bir hesap kalmalıdır.");
        const isUsed = [...gelirler, ...giderler].some(islem => islem.hesapId === silinecekId) || transferler.some(t => t.gonderenHesapId === silinecekId || t.aliciHesapId === silinecekId);
        if (isUsed) return toast.error("Bu hesapta işlem bulunduğu için silinemez.");
        updateAyarlar({ hesaplar: hesaplar.filter(h => h.id !== silinecekId) }); toast.error("Hesap silindi.");
    };

    const handleHesapGuncelle = (id, yeniAd) => {
        if (!yeniAd.trim() || hesaplar.some(h => h.ad.toLowerCase() === yeniAd.trim().toLowerCase() && h.id !== id)) return toast.error("Bu hesap adı zaten mevcut veya geçersiz.");
        updateAyarlar({ hesaplar: hesaplar.map(h => (h.id === id ? { ...h, ad: yeniAd.trim() } : h)) }); toast.success("Hesap adı güncellendi!");
    };

    const handleKategoriEkle = (tip, yeniKategori) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri; if (kategoriler.includes(yeniKategori) || !yeniKategori) return toast.error("Bu kategori zaten mevcut veya geçersiz.");
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri'; updateAyarlar({ [key]: [...kategoriler, yeniKategori] }); toast.success(`Kategori eklendi!`);
    };

    const handleKategoriSil = (tip, kategori) => {
        if (kategori === 'Diğer') return toast.error("'Diğer' kategorisi silinemez."); const isUsed = (tip === 'gider' ? giderler : gelirler).some(islem => islem.kategori === kategori);
        if (isUsed) return toast.error("Bu kategori kullanımda olduğu için silinemez."); const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri';
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri; updateAyarlar({ [key]: kategoriler.filter(k => k !== kategori) }); toast.error(`Kategori silindi.`);
    };
    
    const handleKategoriSirala = (tip, aktifId, hedefId) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri; const yeniSiralanmisListe = arrayMove(kategoriler, kategoriler.indexOf(aktifId), kategoriler.indexOf(hedefId));
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri'; updateAyarlar({ [key]: yeniSiralanmisListe });
    };

    const handleKategoriGuncelle = async (tip, eskiAd, yeniAd) => {
        const kategoriler = tip === 'gider' ? giderKategorileri : gelirKategorileri; if (!yeniAd.trim() || kategoriler.some(k => k.toLowerCase() === yeniAd.trim().toLowerCase() && k.toLowerCase() !== eskiAd.toLowerCase())) return toast.error("Bu kategori adı zaten mevcut veya geçersiz.");
        const key = tip === 'gider' ? 'giderKategorileri' : 'gelirKategorileri'; const islemlerKey = tip === 'gider' ? 'giderler' : 'gelirler'; const islemler = tip === 'gider' ? giderler : gelirler;
        if (!currentUser) {
            const guncelKategoriler = kategoriler.map(k => (k === eskiAd ? yeniAd.trim() : k)); updateAyarlar({ [key]: guncelKategoriler });
            const guncelIslemler = islemler.map(islem => islem.kategori === eskiAd ? { ...islem, kategori: yeniAd.trim() } : islem);
            const stateSetter = tip === 'gider' ? setGiderler : setGelirler; stateSetter(guncelIslemler); setLocalData(`guest_${islemlerKey}`, guncelIslemler);
            toast.success("Kategori ve ilgili işlemler güncellendi! (Misafir)"); return;
        }
        const batch = writeBatch(db); const guncelKategoriler = kategoriler.map(k => (k === eskiAd ? yeniAd.trim() : k));
        batch.update(doc(db, 'users', currentUser.uid), { [key]: guncelKategoriler }); islemler.forEach(islem => {
            if (islem.kategori === eskiAd) { batch.update(doc(db, 'users', currentUser.uid, islemlerKey, islem.id), { kategori: yeniAd.trim() }); }
        }); await batch.commit(); toast.success("Kategori ve ilgili tüm işlemler güncellendi!");
    };
    
    const addOrUpdateDocument = async (collectionName, data, id = null) => {
        if (!currentUser) {
            const key = `guest_${collectionName}`; const currentData = getLocalData(key, []); let updatedData;
            if (id) { updatedData = currentData.map(item => item.id === id ? { ...item, ...data } : item);
            } else { updatedData = [...currentData, { ...data, id: `${Date.now()}-${Math.random()}` }]; }
            setLocalData(key, updatedData); const stateSetter = { 'butceler': setButceler, 'sabitOdemeler': setSabitOdemeler };
            stateSetter[collectionName](updatedData); return;
        }
        if (id) { await updateDoc(doc(db, 'users', currentUser.uid, collectionName, id), data);
        } else { await addDoc(collection(db, 'users', currentUser.uid, collectionName), data); }
    };

    const deleteDocument = async (collectionName, id) => {
        if (!currentUser) {
            const key = `guest_${collectionName}`; const currentData = getLocalData(key, []); const updatedData = currentData.filter(item => item.id !== id);
            setLocalData(key, updatedData); const stateSetter = { 'butceler': setButceler, 'sabitOdemeler': setSabitOdemeler };
            stateSetter[collectionName](updatedData); return;
        }
        await deleteDoc(doc(db, 'users', currentUser.uid, collectionName, id));
    };

    const handleButceGuncelle = async (id, guncelButce) => {
        if (!currentUser) {
            const key = 'guest_butceler'; const currentData = getLocalData(key, []); const updatedData = currentData.map(item => item.id === id ? { ...item, ...guncelButce } : item);
            setLocalData(key, updatedData); setButceler(updatedData); toast.success("Bütçe güncellendi! (Misafir)"); return;
        }
        try {
            const docRef = doc(db, 'users', currentUser.uid, 'butceler', id); await updateDoc(docRef, guncelButce);
            toast.success("Bütçe başarıyla güncellendi.");
        } catch (error) { console.error("Bütçe güncelleme hatası:", error); toast.error("Bütçe güncellenirken bir hata oluştu."); }
    };

    const handleButceEkle = (yeniButce) => addOrUpdateDocument('butceler', yeniButce).then(() => toast.success("Bütçe eklendi!"));
    const handleButceSil = (id) => deleteDocument('butceler', id).then(() => toast.error("Bütçe silindi."));
    const handleSabitOdemeEkle = (yeniOdeme) => addOrUpdateDocument('sabitOdemeler', yeniOdeme).then(() => toast.success("Sabit ödeme eklendi!"));
    const handleSabitOdemeSil = (id) => deleteDocument('sabitOdemeler', id).then(() => toast.error("Sabit ödeme silindi."));
    const handleSabitOdemeGuncelle = (id, guncelOdeme) => addOrUpdateDocument('sabitOdemeler', guncelOdeme, id).then(() => toast.success("Sabit ödeme güncellendi!"));
    
    const handleVeriIndir = () => {
        if (!gelirler && !giderler && !transferler) { return toast.error("İndirilecek veri bulunmuyor."); }
        const toastId = toast.loading("Veriler hazırlanıyor...");
        try {
            const raporVerisi = [
                ...gelirler.map(item => ({ Tip: 'Gelir', Tarih: item.tarih, Aciklama: item.aciklama, Kategori: item.kategori, Hesap: hesaplar.find(h => h.id === item.hesapId)?.ad || 'Bilinmiyor', Tutar: item.tutar })),
                ...giderler.map(item => ({ Tip: 'Gider', Tarih: item.tarih, Aciklama: item.aciklama, Kategori: item.kategori, Hesap: hesaplar.find(h => h.id === item.hesapId)?.ad || 'Bilinmiyor', Tutar: -item.tutar })),
                ...transferler.map(item => ({ Tip: 'Transfer', Tarih: item.tarih, Aciklama: item.aciklama || 'Transfer', Kategori: '', Hesap: `${hesaplar.find(h => h.id === item.gonderenHesapId)?.ad || '?'} -> ${hesaplar.find(h => h.id === item.aliciHesapId)?.ad || '?'}`, Tutar: -item.tutar }))
            ];
            raporVerisi.sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih));
            const csv = Papa.unparse(raporVerisi);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            const today = new Date().toISOString().slice(0, 10);
            link.setAttribute("download", `FinansTakip-Rapor-${today}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Veriler başarıyla indirildi!", { id: toastId });
        } catch (error) {
            console.error("CSV indirme hatası:", error);
            toast.error("Veriler indirilirken bir hata oluştu.", { id: toastId });
        }
    };

    const handleTopluSil = async (silinecekIdBilgileri) => {
        if (!silinecekIdBilgileri || silinecekIdBilgileri.length === 0) return;
        if (!currentUser) {
            let guncellenmisGelirler = getLocalData('guest_gelirler', []); let guncellenmisGiderler = getLocalData('guest_giderler', []); let guncellenmisTransferler = getLocalData('guest_transferler', []);
            silinecekIdBilgileri.forEach(({ id, tip }) => {
                if (tip === ISLEM_TURLERI.GELIR) guncellenmisGelirler = guncellenmisGelirler.filter(item => item.id !== id);
                if (tip === ISLEM_TURLERI.GIDER) guncellenmisGiderler = guncellenmisGiderler.filter(item => item.id !== id);
                if (tip === ISLEM_TURLERI.TRANSFER) guncellenmisTransferler = guncellenmisTransferler.filter(item => item.id !== id);
            });
            setLocalData('guest_gelirler', guncellenmisGelirler); setGelirler(guncellenmisGelirler);
            setLocalData('guest_giderler', guncellenmisGiderler); setGiderler(guncellenmisGiderler);
            setLocalData('guest_transferler', guncellenmisTransferler); setTransferler(guncellenmisTransferler);
            toast.error(`${silinecekIdBilgileri.length} işlem silindi. (Misafir)`); return;
        }
        const batch = writeBatch(db); const uid = currentUser.uid;
        silinecekIdBilgileri.forEach(({ id, tip }) => {
            let collectionName = tip.toLowerCase() + 'ler'; if (tip === ISLEM_TURLERI.TRANSFER) collectionName = 'transferler';
            const docRef = doc(db, 'users', uid, collectionName, id); batch.delete(docRef);
        });
        try { await batch.commit(); toast.error(`${silinecekIdBilgileri.length} işlem başarıyla silindi.`);
        } catch (error) { console.error("Toplu silme hatası:", error); toast.error("İşlemler silinirken bir hata oluştu."); }
    };
    
    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);
    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);
    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
    const butceDurumlari = useMemo(() => { const oncekiAyTarih = new Date(seciliYil, seciliAy - 2, 1); const oncekiAyGiderleri = giderler.filter(g => { const giderTarihi = new Date(g.tarih); return giderTarihi.getFullYear() === oncekiAyTarih.getFullYear() && giderTarihi.getMonth() === oncekiAyTarih.getMonth(); }); return butceler.map(butce => { const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0); const oncekiAyHarcanan = oncekiAyGiderleri.filter(gider => gider.kategori.trim() === butce.kategori.trim()).reduce((toplam, gider) => toplam + gider.tutar, 0); let degisimYuzdesi = 0; if (oncekiAyHarcanan > 0) { degisimYuzdesi = ((harcanan - oncekiAyHarcanan) / oncekiAyHarcanan) * 100; } else if (harcanan > 0) { degisimYuzdesi = 100; } const kalan = butce.limit - harcanan; const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0; let durum = 'normal'; if (yuzdeRaw >= 100) { durum = 'asildi'; } else if (yuzdeRaw >= 90) { durum = 'uyari'; } return { ...butce, harcanan, kalan, yuzde: Math.min(yuzdeRaw, 100), yuzdeRaw, degisimYuzdesi, durum }; }); }, [butceler, filtrelenmisGiderler, giderler, seciliAy, seciliYil]);
    
    // --- DEĞİŞİKLİK BURADA ---
    const yaklasanOdemeler = useMemo(() => { 
        const bugun = new Date(); 
        const bugununGunu = bugun.getDate(); 
        return sabitOdemeler.map(odeme => { 
            let kalanGun = odeme.odemeGunu - bugununGunu; 
            if (kalanGun < 0) kalanGun += new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0).getDate(); 
            // 'tutar' alanını da objeye ekliyoruz
            return { ...odeme, kalanGun, tutar: odeme.tutar || 0 }; 
        }).sort((a, b) => a.kalanGun - b.kalanGun).slice(0, 3); 
    }, [sabitOdemeler]);

    const kategoriOzeti = useMemo(() => filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}), [filtrelenmisGiderler]);
    const grafikVerisi = useMemo(() => { const labels = Object.keys(kategoriOzeti); if (labels.length === 0) { return { labels: ['Veri Yok'], datasets: [{ label: 'Harcama Miktarı', data: [1], backgroundColor: ['#E0E0E0'], borderColor: '#ffffff', borderWidth: 2 }], }; } const data = Object.values(kategoriOzeti); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#CCCCCC'); return { labels, datasets: [{ label: 'Harcama Miktarı', data, backgroundColor, borderColor: '#ffffff', borderWidth: 2 }], }; }, [kategoriOzeti, kategoriRenkleri]);
    const gelirGrafikVerisi = useMemo(() => { const gelirKaynaklari = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}); const labels = Object.keys(gelirKaynaklari); if (labels.length === 0) { return { labels: ['Veri Yok'], datasets: [{ label: 'Gelir Kaynağı', data: [], backgroundColor: [] }], }; } const data = Object.values(gelirKaynaklari); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71'); return { labels, datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }], }; }, [filtrelenmisGelirler, kategoriRenkleri]);
    const birlesikIslemler = useMemo(() => { const temelListe = [...filtrelenmisGelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })), ...filtrelenmisGiderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER })), ...transferler.filter(t => new Date(t.tarih).getFullYear() === seciliYil && new Date(t.tarih).getMonth() + 1 === seciliAy).map(t => ({ ...t, tip: ISLEM_TURLERI.TRANSFER }))]; const filtrelenmisListe = temelListe.filter(islem => (birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip) && (islem.tip === 'Transfer' || birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori) && (birlesikFiltreHesap === 'Tümü' || islem.hesapId === birlesikFiltreHesap || islem.gonderenHesapId === birlesikFiltreHesap || islem.aliciHesapId === birlesikFiltreHesap)); return filtrelenmisListe.sort((a, b) => { switch (birlesikSiralamaKriteri) { case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih); case 'tutar-artan': return a.tutar - b.tutar; case 'tutar-azalan': return b.tutar - a.tutar; default: return new Date(b.tarih) - new Date(a.tarih); } }); }, [filtrelenmisGelirler, filtrelenmisGiderler, transferler, seciliAy, seciliYil, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri, birlesikFiltreHesap]);
    const mevcutYillar = useMemo(() => { const yillar = new Set([...gelirler, ...giderler].map(islem => new Date(islem.tarih).getFullYear())); if (yillar.size === 0) { yillar.add(new Date().getFullYear()); } return Array.from(yillar).sort((a, b) => b - a); }, [gelirler, giderler]);
    const trendVerisi = useMemo(() => { const labels = []; const gelirlerData = []; const giderlerData = []; const bugun = new Date(); for (let i = 5; i >= 0; i--) { const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1); const yil = tarih.getFullYear(); const ay = tarih.getMonth() + 1; labels.push(tarih.toLocaleString('tr-TR', { month: 'long' })); const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); gelirlerData.push(aylikGelir); giderlerData.push(aylikGider); } return { labels, gelirler: gelirlerData, giderler: giderlerData }; }, [gelirler, giderler]);
    const yillikRaporVerisi = useMemo(() => { const aylar = []; let yillikToplamGelir = 0; let yillikToplamGider = 0; for (let i = 1; i <= 12; i++) { const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); if (aylikGelirler.length > 0 || aylikGiderler.length > 0) { const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0); const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0); yillikToplamGelir += ayGelir; yillikToplamGider += ayGider; aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider }); } } return { aylar, toplamGelir: yillikToplamGelir, toplamGider: yillikToplamGider, toplamBakiye: yillikToplamGelir - yillikToplamGider }; }, [gelirler, giderler, seciliYil]);

    const contextValue = {
        giderler, gelirler, transferler, hesaplar, giderKategorileri, gelirKategorileri, kategoriRenkleri, butceler, sabitOdemeler,
        addIslem, updateIslem, openDeleteModal, handleCloseModal, handleConfirmDelete, handleTopluSil,
        handleHesapEkle, handleHesapSil, handleHesapGuncelle,
        handleKategoriEkle, handleKategoriSil, handleKategoriSirala, handleKategoriGuncelle,
        handleButceEkle, handleButceSil, handleButceGuncelle,
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
        yaklasanOdemeler, genelHesapBakiyeleri, aylikHesapGiderleri,
        transferGuestDataToFirestore
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};