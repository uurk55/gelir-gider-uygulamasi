// src/context/FinansContext.jsx (Arama Özelliği Eklendi)

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

import { formatCurrency } from '../utils/formatters';

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
    const [krediKartlari, setKrediKartlari] = useState(() => currentUser ? [] : getLocalData('guest_krediKartlari', []));
    const [hedefler, setHedefler] = useState(() => currentUser ? [] : getLocalData('guest_hedefler', []));
    const [ayarlar, setAyarlar] = useState({
    bildirimler: {
        yaklasanOdemeler: false,
        butceAsimi: false,
        haftalikOzet: false,
    }
});
    const [bekleyenOdemeler, setBekleyenOdemeler] = useState([]);
    const [kategoriRenkleri, setKategoriRenkleri] = useState({});
    const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
    const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [birlesikFiltreKategori, setBirlesikFiltreKategori] = useState('Tümü');
    const [birlesikFiltreTip, setBirlesikFiltreTip] = useState(ISLEM_TURLERI.TUMU);
    const [birlesikSiralamaKriteri, setBirlesikSiralamaKriteri] = useState(SIRALAMA_KRITERLERI.TARIH_YENI);
    const [birlesikFiltreHesap, setBirlesikFiltreHesap] = useState('Tümü');
    const [aramaMetni, setAramaMetni] = useState('');

    const [tarihAraligi, setTarihAraligi] = useState([
        {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            key: 'selection'
        }
    ]);

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
                onSnapshot(collection(db, 'users', uid, 'krediKartlari'), s => setKrediKartlari(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(collection(db, 'users', uid, 'hedefler'), s => setHedefler(s.docs.map(d => ({ id: d.id, ...d.data() })))),
                onSnapshot(doc(db, 'users', uid), async (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        setHesaplar(data.hesaplar || VARSAYILAN_HESAPLAR);
                        setGiderKategorileri(data.giderKategorileri || GIDER_KATEGORILERI_VARSAYILAN);
                        setGelirKategorileri(data.gelirKategorileri || GELIR_KATEGORILERI_VARSAYILAN);
                     if (data.ayarlar && data.ayarlar.bildirimler) {
            setAyarlar({
                bildirimler: {
                    ...ayarlar.bildirimler, // Varsayılanları koru
                    ...data.ayarlar.bildirimler // Üzerine yaz
                }
            });
        }
                    } else {
        await setDoc(doc(db, 'users', uid), { 
            hesaplar: VARSAYILAN_HESAPLAR, 
            giderKategorileri: GIDER_KATEGORILERI_VARSAYILAN, 
            gelirKategorileri: GELIR_KATEGORILERI_VARSAYILAN,
            // YENİ: Yeni kullanıcı için varsayılan ayarlar
            ayarlar: { bildirimler: { yaklasanOdemeler: false, butceAsimi: false, haftalikOzet: false } }
        });
    }
})
            ];
            return () => unsubscribers.forEach(unsub => unsub());
        } else {
            setGelirler(getLocalData('guest_gelirler', [])); setGiderler(getLocalData('guest_giderler', [])); setTransferler(getLocalData('guest_transferler', []));
            setButceler(getLocalData('guest_butceler', [])); setSabitOdemeler(getLocalData('guest_sabitOdemeler', [])); setKrediKartlari(getLocalData('guest_krediKartlari', [])); setHedefler(getLocalData('guest_hedefler', [])); setHesaplar(getLocalData('guest_hesaplar', VARSAYILAN_HESAPLAR)); setHesaplar(getLocalData('guest_hesaplar', VARSAYILAN_HESAPLAR));
            setGiderKategorileri(getLocalData('guest_giderKategorileri', GIDER_KATEGORILERI_VARSAYILAN)); setGelirKategorileri(getLocalData('guest_gelirKategorileri', GELIR_KATEGORILERI_VARSAYILAN));

        }
    }, [currentUser]);
    
    useEffect(() => {
        if (!currentUser || sabitOdemeler.length === 0) {
            setBekleyenOdemeler([]);
            return;
        }

        const bugun = new Date();
        const buAy = bugun.getMonth();
        const buYil = bugun.getFullYear();
        const yeniBekleyenOdemeler = [];
        
        // YENİ: Bu ay için atlanmış olanları localStorage'dan çek
        const buAyYil = `${buYil}-${buAy}`;
        const atlananlarKey = `atlananOdemeler_${currentUser.uid}_${buAyYil}`;
        const buAyAtlananlar = getLocalData(atlananlarKey, []);

        const vadesiGecenler = sabitOdemeler.filter(odeme => {
            const odemeGunu = parseInt(odeme.odemeGunu, 10);
            if (!odeme.baslangicTarihi || isNaN(odemeGunu)) return false;
            const ilkOdemeTarihi = new Date(odeme.baslangicTarihi);
            return odemeGunu <= bugun.getDate() && ilkOdemeTarihi <= bugun;
        });

        vadesiGecenler.forEach(odeme => {
            const zatenEklenmis = giderler.some(gider => 
                gider.sabitOdemeId === odeme.id &&
                new Date(gider.tarih).getMonth() === buAy &&
                new Date(gider.tarih).getFullYear() === buYil
            );

            // YENİ: Bu ödeme, bu ay için atlanmış mı diye kontrol et
            const buAyAtlandi = buAyAtlananlar.includes(odeme.id);

            // GÜNCELLENMİŞ KONTROL: Eğer eklenmemişse VE atlanmamışsa
            if (!zatenEklenmis && !buAyAtlandi) {
                const odemeGunu = parseInt(odeme.odemeGunu, 10);
                const islenecekTarih = new Date(buYil, buAy, odemeGunu).toISOString().split('T')[0];
                yeniBekleyenOdemeler.push({ ...odeme, islenecekTarih });
            }
        });
        setBekleyenOdemeler(yeniBekleyenOdemeler);
    }, [sabitOdemeler, giderler, currentUser]);
    useEffect(() => {
        const tumKategoriler = [...giderKategorileri, ...gelirKategorileri];
        const yeniRenkHaritasi = {};
        tumKategoriler.forEach(kategori => {
            if (!yeniRenkHaritasi[kategori]) yeniRenkHaritasi[kategori] = generateStablePastelColor(kategori);
        });
        setKategoriRenkleri(yeniRenkHaritasi);
    }, [giderKategorileri, gelirKategorileri]);

    const handleBekleyenOdemeleriIsle = async (islemListesi = bekleyenOdemeler) => {
        if (islemListesi.length === 0 || !currentUser) return;
        const toastId = toast.loading(`${islemListesi.length} adet ödeme işleniyor...`);
        try {
            const batch = writeBatch(db);
            const uid = currentUser.uid;
            islemListesi.forEach(odeme => {
                if (!odeme.hesapId) {
                    throw new Error(`'${odeme.aciklama}' için bir ödeme hesabı belirtilmemiş.`);
                }
                const giderVerisi = {
                    aciklama: odeme.aciklama,
                    tutar: odeme.tutar,
                    kategori: odeme.kategori,
                    tarih: odeme.islenecekTarih,
                    sabitOdemeId: odeme.id,
                    hesapId: odeme.hesapId 
                };
                const docRef = doc(collection(db, 'users', uid, 'giderler'));
                batch.set(docRef, giderVerisi);
            });
            await batch.commit();
            toast.success(`${islemListesi.length} adet ödeme giderlere eklendi.`, { id: toastId });
        } catch (error) {
            console.error("Bekleyen ödemeler işlenirken hata:", error);
            toast.error(error.message || "Ödemeler işlenirken bir hata oluştu.", { id: toastId });
        }
    };
    
    const handleBekleyenOdemeyiAtla = (atlananOdeme) => {
        if (!currentUser) return;

        // 1. O anki ay ve yılı al (Örn: "2025-9")
        const bugun = new Date();
        const buAyYil = `${bugun.getFullYear()}-${bugun.getMonth()}`;

        // 2. localStorage'dan bu aya ait atlananlar listesini çek
        const atlananlarKey = `atlananOdemeler_${currentUser.uid}_${buAyYil}`;
        const mevcutAtlananlar = getLocalData(atlananlarKey, []);

        // 3. Yeni atlanan ödemenin ID'sini listeye ekle ve tekrar kaydet
        const yeniAtlananlar = [...mevcutAtlananlar, atlananOdeme.id];
        setLocalData(atlananlarKey, yeniAtlananlar);

        // 4. Arayüzün anında güncellenmesi için "bekleyenler" state'inden çıkar
        setBekleyenOdemeler(prev => prev.filter(odeme => odeme.id !== atlananOdeme.id));
        
        toast.info(`'${atlananOdeme.aciklama}' ödemesi bu ay için kalıcı olarak atlandı.`);
    };
    
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
        if (kategori === 'Diğer') return toast.error("'Diğer' kategorisi silinemez."); const isUsed = (tip === 'gider' ? giderler : gelirKategorileri).some(islem => islem.kategori === kategori);
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
    const handleKrediKartiEkle = (yeniKart) => addOrUpdateDocument('krediKartlari', yeniKart).then(() => toast.success("Kredi kartı eklendi!"));
    const handleKrediKartiSil = (id) => deleteDocument('krediKartlari', id).then(() => toast.error("Kredi kartı silindi."));
    const handleKrediKartiGuncelle = (id, guncelKart) => addOrUpdateDocument('krediKartlari', guncelKart, id).then(() => toast.success("Kredi kartı güncellendi!"));
    const handleHedefEkle = (yeniHedef) => {
    const hedefVerisi = {
        ...yeniHedef,
        mevcutTutar: 0, // Hedef oluşturulduğunda birikim 0'dır
        olusturmaTarihi: new Date().toISOString()
    };
    // Mevcut addOrUpdateDocument fonksiyonumuzu kullanıyoruz
    addOrUpdateDocument('hedefler', hedefVerisi).then(() => {
        toast.success(`'${yeniHedef.ad}' hedefi başarıyla oluşturuldu!`);
    });
};

const handleHedefGuncelle = (id, guncelVeri) => {
        addOrUpdateDocument('hedefler', guncelVeri, id).then(() => {
            toast.success("Hedef bilgileri güncellendi!");
        });
    };

const handleHedefSil = (id) => {
    // Not: Bu işlem, hedefe yapılmış birikim GİDERLERİNİ silmez.
    // Bu, genel bakiye tutarlılığını korumak için önemlidir.
    deleteDocument('hedefler', id).then(() => {
        toast.error("Hedef silindi.");
    });
};

// Hedefe para aktarmayı sağlayan en önemli fonksiyon
const handleHedefeParaEkle = async (hedefId, kaynakHesapId, tutar) => {
    const toastId = toast.loading("Birikim hedefinize aktarılıyor...");

    try {
        const hedef = hedefler.find(h => h.id === hedefId);
        if (!hedef) {
            throw new Error("Aktarım yapılacak hedef bulunamadı.");
        }
        if (!kaynakHesapId) {
             throw new Error("Kaynak hesap seçilmedi.");
        }
         if (!tutar || tutar <= 0) {
             throw new Error("Geçerli bir tutar girilmedi.");
        }

        // 1. Hedefin kendi içindeki birikim tutarını güncelle
        const yeniMevcutTutar = (hedef.mevcutTutar || 0) + tutar;
        const hedefGuncellemePromise = addOrUpdateDocument('hedefler', { mevcutTutar: yeniMevcutTutar }, hedefId);

        // 2. Bu işlemi bir "gider" olarak kaydet ki seçilen hesabın bakiyesi düşsün.
        // Bu sayede sistemin genel bakiye tutarlılığı bozulmaz.
        const giderVerisi = {
            aciklama: `'${hedef.ad}' hedefi için birikim`,
            tutar: tutar,
            kategori: 'Hedef Birikimi', // Bu özel bir kategori adıdır.
            tarih: new Date().toISOString().split('T')[0],
            hesapId: kaynakHesapId,
            hedefId: hedefId // Giderin hangi hedefe ait olduğunu belirtmek için
        };
        const giderEklemePromise = addIslem(ISLEM_TURLERI.GIDER, giderVerisi);
        
        // İki işlemi de aynı anda çalıştır
        await Promise.all([hedefGuncellemePromise, giderEklemePromise]);

        toast.success(`${formatCurrency(tutar)} hedefinize eklendi!`, { id: toastId });

    } catch (error) {
        console.error("Hedefe para eklenirken hata:", error);
        toast.error(error.message || "İşlem sırasında bir hata oluştu.", { id: toastId });
    }
};
    const updateBildirimAyarlari = async (yeniBildirimAyar) => {
    if (!currentUser) return; // Sadece giriş yapmış kullanıcılar için
    
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        // setDoc'ta { merge: true } kullanmak, 'ayarlar' objesinin diğer alanlarını
        // (gelecekte eklersek) silmeden sadece 'bildirimler' alanını günceller.
        await setDoc(userDocRef, {
            ayarlar: {
                bildirimler: yeniBildirimAyar
            }
        }, { merge: true });

        // Arayüzün anında güncellenmesi için local state'i de güncelle
        setAyarlar(prev => ({
            ...prev,
            bildirimler: yeniBildirimAyar
        }));

        toast.success('Bildirim ayarları güncellendi!');
    } catch (error) {
        console.error("Bildirim ayarları güncellenirken hata:", error);
        toast.error('Ayarlar güncellenirken bir hata oluştu.');
    }
};
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

    // DEĞİŞİKLİK: `birlesikIslemler` hesaplaması güncellendi
    const birlesikIslemler = useMemo(() => {
        const { startDate, endDate } = tarihAraligi[0];
        const baslangic = new Date(startDate);
        baslangic.setHours(0, 0, 0, 0);
        const bitis = new Date(endDate);
        bitis.setHours(23, 59, 59, 999);
        
        const temelListe = [
            ...gelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })),
            ...giderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER })),
            ...transferler.map(t => ({ ...t, tip: ISLEM_TURLERI.TRANSFER }))
        ];

        // YENİ: Arama metnini küçük harfe çevirerek daha esnek bir arama sağlıyoruz
        const aramaTerimi = aramaMetni.toLowerCase();

        const filtrelenmisListe = temelListe.filter(islem => {
            const islemTarihi = new Date(islem.tarih);
            
            const tarihSart = islemTarihi >= baslangic && islemTarihi <= bitis;
            const tipSart = birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip;
            const kategoriSart = islem.tip === 'Transfer' || birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori;
            const hesapSart = birlesikFiltreHesap === 'Tümü' || islem.hesapId === birlesikFiltreHesap || islem.gonderenHesapId === birlesikFiltreHesap || islem.aliciHesapId === birlesikFiltreHesap;

            // YENİ: Arama filtresi
            const aramaSart = aramaTerimi === '' || (islem.aciklama && islem.aciklama.toLowerCase().includes(aramaTerimi));

            return tarihSart && tipSart && kategoriSart && hesapSart && aramaSart;
        });

        return filtrelenmisListe.sort((a, b) => {
            switch (birlesikSiralamaKriteri) {
                case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih);
                case 'tutar-artan': return a.tutar - b.tutar;
                case 'tutar-azalan': return b.tutar - a.tutar;
                default: return new Date(b.tarih) - new Date(a.tarih);
            }
        });
    // YENİ: Bağımlılık dizisine `aramaMetni` eklendi
    }, [gelirler, giderler, transferler, tarihAraligi, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri, birlesikFiltreHesap, aramaMetni]);

    
    // ... (diğer useMemo hesaplamaları aynı kalıyor) ...
    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);

    // --- 2. TEMEL TOPLAMLAR ---
    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);

    // --- 3. GENEL BAKİYE HESAPLAMALARI ---
    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    
    // --- 4. KARŞILAŞTIRMALI VERİ (Artık tüm bağımlılıkları hazır) ---
    const karsilastirmaliAylikOzet = useMemo(() => {
        const oncekiAyTarih = new Date(seciliYil, seciliAy - 2, 1);
        const oncekiAy = oncekiAyTarih.getMonth() + 1;
        const oncekiAyYil = oncekiAyTarih.getFullYear();

        const toplamOncekiAyGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === oncekiAyYil && new Date(g.tarih).getMonth() + 1 === oncekiAy).reduce((t, g) => t + g.tutar, 0);
        const toplamOncekiAyGider = giderler.filter(g => new Date(g.tarih).getFullYear() === oncekiAyYil && new Date(g.tarih).getMonth() + 1 === oncekiAy).reduce((t, g) => t + g.tutar, 0);

        let gelirDegisimYuzdesi = 0;
        if (toplamOncekiAyGelir > 0) gelirDegisimYuzdesi = ((toplamGelir - toplamOncekiAyGelir) / toplamOncekiAyGelir) * 100;
        else if (toplamGelir > 0) gelirDegisimYuzdesi = 100;

        let giderDegisimYuzdesi = 0;
        if (toplamOncekiAyGider > 0) giderDegisimYuzdesi = ((toplamGider - toplamOncekiAyGider) / toplamOncekiAyGider) * 100;
        else if (toplamGider > 0) giderDegisimYuzdesi = 100;
        
        const aylikBakiyeDegisimi = toplamGelir - toplamGider;
        
        return { gelirDegisimYuzdesi, giderDegisimYuzdesi, aylikBakiyeDegisimi };

    }, [gelirler, giderler, seciliAy, seciliYil, toplamGelir, toplamGider]); // `toplamBakiye` bağımlılığını kaldırdık
    const onecelikliHedef = useMemo(() => {
    // Henüz tamamlanmamış hedefleri filtrele
    const aktifHedefler = hedefler.filter(h => h.mevcutTutar < h.hedefTutar);
    
    if (aktifHedefler.length === 0) {
        return null; // Gösterilecek aktif hedef yoksa null döndür
    }

    // Bitiş tarihi olan hedefleri ayır ve en yakın tarihli olanı bul
    const tarihliHedefler = aktifHedefler.filter(h => h.hedefTarih);
    if (tarihliHedefler.length > 0) {
        tarihliHedefler.sort((a, b) => new Date(a.hedefTarih) - new Date(b.hedefTarih));
        return tarihliHedefler[0];
    }

    // Eğer hiç bitiş tarihli hedef yoksa, en son oluşturulan hedefi göster
    aktifHedefler.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));
    return aktifHedefler[0];

}, [hedefler]);

    
    // --- 5. DİĞER TÜM HESAPLAMALAR ---
    const tumHesaplar = useMemo(() => {
        const formatlanmisKrediKartlari = krediKartlari.map(kart => ({ ...kart, ad: `${kart.ad} (KK)`, tip: 'krediKarti' }));
        const formatlanmisNakitHesaplar = hesaplar.map(hesap => ({ ...hesap, tip: 'varlik' }));
        return [...formatlanmisNakitHesaplar, ...formatlanmisKrediKartlari];
    }, [hesaplar, krediKartlari]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
    const butceDurumlari = useMemo(() => {
    // Önceki aya ait harcamaları hesaplamak için gerekli tarih bilgileri
    const oncekiAyTarih = new Date(seciliYil, seciliAy - 2, 1);
    const oncekiAyGiderleri = giderler.filter(g => {
        const giderTarihi = new Date(g.tarih);
        return giderTarihi.getFullYear() === oncekiAyTarih.getFullYear() && giderTarihi.getMonth() === oncekiAyTarih.getMonth();
    });

    // --- YENİ TAHMİN MANTIĞI İÇİN GEREKLİ BİLGİLER ---
    const bugun = new Date();
    // Ayın son gününü alarak ayın kaç gün çektiğini buluyoruz (28, 29, 30 veya 31)
    const ayinSonGunu = new Date(seciliYil, seciliAy, 0).getDate(); 
    // Ayın bugünkü gününü alıyoruz
    const bugununGunu = bugun.getDate();

    return butceler.map(butce => {
        // Mevcut ay için o kategorideki harcama
        const harcanan = filtrelenmisGiderler
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);

        // Önceki ay için harcama
        const oncekiAyHarcanan = oncekiAyGiderleri
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);

        // --- YENİ TAHMİN HESAPLAMASI ---
        let tahminiHarcama = 0;
        // Sadece içinde bulunduğumuz ay için ve harcama varsa tahmin yapalım
        if (harcanan > 0 && seciliYil === bugun.getFullYear() && seciliAy === bugun.getMonth() + 1) {
            // Oran-orantı: (bugüne kadarki harcama / bugünün günü) * ayın toplam günü
            tahminiHarcama = (harcanan / bugununGunu) * ayinSonGunu;
        }
        const tahminiAsim = tahminiHarcama > butce.limit ? tahminiHarcama - butce.limit : 0;
        // --- YENİ HESAPLAMANIN SONU ---

        // Diğer hesaplamalar aynı kalıyor
        let degisimYuzdesi = 0;
        if (oncekiAyHarcanan > 0) {
            degisimYuzdesi = ((harcanan - oncekiAyHarcanan) / oncekiAyHarcanan) * 100;
        } else if (harcanan > 0) {
            degisimYuzdesi = 100;
        }
        const kalan = butce.limit - harcanan;
        const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0;
        let durum = 'normal';
        if (yuzdeRaw >= 100) { durum = 'asildi'; } 
        else if (yuzdeRaw >= 90) { durum = 'uyari'; }
        
        // Yeni tahmin verilerini de objeye ekleyerek döndürüyoruz
        return { 
            ...butce, harcanan, kalan, yuzde: Math.min(yuzdeRaw, 100), 
            yuzdeRaw, degisimYuzdesi, durum,
            tahminiHarcama, // YENİ
            tahminiAsim,   // YENİ
        };
    });
}, [butceler, filtrelenmisGiderler, giderler, seciliAy, seciliYil]);
const finansalSaglikPuani = useMemo(() => {
    // --- Metrik 1: Tasarruf Oranı ---
    const sonUcAyGelir = gelirler
        .filter(g => new Date(g.tarih) > new Date(new Date().setMonth(new Date().getMonth() - 3)))
        .reduce((acc, g) => acc + g.tutar, 0);
    const sonUcAyGider = giderler
        .filter(g => new Date(g.tarih) > new Date(new Date().setMonth(new Date().getMonth() - 3)))
        .reduce((acc, g) => acc + g.tutar, 0);

    const ortalamaAylikGelir = sonUcAyGelir / 3;
    const ortalamaAylikGider = sonUcAyGider / 3;

    let tasarrufOraniPuani = 0;
    let tasarrufOraniYuzde = 0;
    if (ortalamaAylikGelir > 0) {
        tasarrufOraniYuzde = (ortalamaAylikGelir - ortalamaAylikGider) / ortalamaAylikGelir;
        tasarrufOraniPuani = Math.max(0, Math.min(1, tasarrufOraniYuzde / 0.2)) * 40;
    }

    // --- Metrik 2: Bütçe Kontrolü ---
    let butceKontrolPuani = 0;
    let basariliButceOrani = 0;
    if (butceDurumlari && butceDurumlari.length > 0) {
        const basariliButceSayisi = butceDurumlari.filter(b => b.yuzdeRaw <= 100).length;
        basariliButceOrani = basariliButceSayisi / butceDurumlari.length;
        butceKontrolPuani = basariliButceOrani * 30;
    } else {
        butceKontrolPuani = 15;
    }

    // --- Metrik 3: Acil Durum Fonu ---
    let acilDurumFonuPuani = 0;
    let fonKarsilamaAyi = 0;
    if (ortalamaAylikGider > 0) {
        fonKarsilamaAyi = toplamBakiye / ortalamaAylikGider;
        const fonYeterliligi = fonKarsilamaAyi / 3;
        acilDurumFonuPuani = Math.min(1, fonYeterliligi) * 30;
    } else if (toplamBakiye > 0) {
        acilDurumFonuPuani = 30;
    }

    // --- Nihai Puan ve Durum Hesaplaması (TANIMLAMALAR) ---
    const toplamPuan = Math.round(tasarrufOraniPuani + butceKontrolPuani + acilDurumFonuPuani) || 0;
    
    let genelDurum = 'Geliştirilmeli'; // TANIMLAMA BURADA
    if (toplamPuan > 80) genelDurum = 'Mükemmel';
    else if (toplamPuan > 60) genelDurum = 'İyi';

    // --- Nihai Return Objesi ---
    return {
        puan: toplamPuan,
        durum: genelDurum, // ARTIK GÜVENLE KULLANILABİLİR
        metrikler: {
            tasarrufOrani: {
                puan: Math.round(tasarrufOraniPuani) || 0,
                maksimumPuan: 40,
                durum: tasarrufOraniPuani > 32 ? 'Mükemmel' : (tasarrufOraniPuani > 20 ? 'İyi' : 'Geliştirilmeli'),
                aciklama: `Son 3 ayda gelirinizin ortalama %${(tasarrufOraniYuzde * 100).toFixed(0)} kadarını birikime ayırdınız.`
            },
            butceKontrolu: {
                puan: Math.round(butceKontrolPuani) || 0,
                maksimumPuan: 30,
                durum: butceKontrolPuani > 24 ? 'Mükemmel' : (butceKontrolPuani > 15 ? 'İyi' : 'Geliştirilmeli'),
                aciklama: `Bütçelerinizin %${(basariliButceOrani * 100).toFixed(0)}'ine sadık kaldınız.`
            },
            acilDurumFonu: {
                puan: Math.round(acilDurumFonuPuani) || 0,
                maksimumPuan: 30,
                durum: acilDurumFonuPuani > 24 ? 'Mükemmel' : (acilDurumFonuPuani > 15 ? 'İyi' : 'Geliştirilmeli'),
                aciklama: `Mevcut birikiminiz, yaklaşık ${fonKarsilamaAyi.toFixed(1)} aylık giderinizi karşılıyor.`
            }
        }
    };
}, [gelirler, giderler, butceDurumlari, toplamBakiye]);

    const yaklasanOdemeler = useMemo(() => { 
        const bugun = new Date(); 
        const bugununGunu = bugun.getDate(); 
        return sabitOdemeler.map(odeme => { 
            let kalanGun = odeme.odemeGunu - bugununGunu; 
            if (kalanGun < 0) kalanGun += new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0).getDate(); 
            return { ...odeme, kalanGun, tutar: odeme.tutar || 0 }; 
        }).sort((a, b) => a.kalanGun - b.kalanGun); // DEĞİŞİKLİK: slice(0, 3) kaldırıldı, tüm liste lazım
    }, [sabitOdemeler]);

    // YENİ: Sabit Ödemeler sayfası için özet verisi
    const sabitOdemelerOzeti = useMemo(() => {
        const toplamAylikTaahhut = sabitOdemeler.reduce((acc, odeme) => acc + (odeme.tutar || 0), 0);
        const aktifOdemeSayisi = sabitOdemeler.length;
        const enYakinOdeme = yaklasanOdemeler.length > 0 ? yaklasanOdemeler[0] : null;

        return {
            toplamAylikTaahhut,
            aktifOdemeSayisi,
            enYakinOdeme
        };
    }, [sabitOdemeler, yaklasanOdemeler]);

    const krediKartiOzetleri = useMemo(() => {
        if (krediKartlari.length === 0) return [];

        const bugun = new Date();
        const buYil = bugun.getFullYear();
        const buAy = bugun.getMonth();

        return krediKartlari.map(kart => {
            const kesimGunu = parseInt(kart.kesimGunu, 10);
            const sonOdemeGunu = parseInt(kart.sonOdemeGunu, 10);
            
            // Bu ayki hesap kesim ve son ödeme tarihlerini belirle
            let hesapKesimTarihi = new Date(buYil, buAy, kesimGunu);
            let sonOdemeTarihi = new Date(buYil, buAy, sonOdemeGunu);

            // Eğer son ödeme günü, kesim gününden küçükse (örn: kesim 27, ödeme 9), 
            // son ödeme bir sonraki ayın demektir.
            if (sonOdemeGunu < kesimGunu) {
                sonOdemeTarihi.setMonth(buAy + 1);
            }
            
            // Eğer bugünün tarihi, bu ayın kesim gününü geçmişse,
            // bir sonraki ekstreyi ve ödemeyi hesaplıyoruz.
            if (bugun.getDate() > kesimGunu) {
                hesapKesimTarihi.setMonth(buAy + 1);
                sonOdemeTarihi.setMonth(buAy + 2); // Son ödeme 2 ay sonraya kalır
                if (sonOdemeGunu >= kesimGunu) { // Eğer aynı aydaysa
                    sonOdemeTarihi.setMonth(buAy + 1);
                }
            }

            // Önceki ayın kesim tarihini bul
            const oncekiKesimTarihi = new Date(hesapKesimTarihi);
            oncekiKesimTarihi.setMonth(oncekiKesimTarihi.getMonth() - 1);

            // Son ekstre dönemindeki harcamaları topla
            const donemHarcamalari = giderler.filter(gider => {
                if (gider.hesapId !== kart.id) return false;
                const giderTarihi = new Date(gider.tarih);
                // Harcama, önceki kesimden sonra VE bu ayki kesimden önce mi yapılmış?
                return giderTarihi > oncekiKesimTarihi && giderTarihi <= hesapKesimTarihi;
            }).reduce((toplam, gider) => toplam + gider.tutar, 0);

            // Son ödeme gününe kalan günü hesapla
            const zamanFarki = sonOdemeTarihi.getTime() - bugun.getTime();
            const kalanGun = Math.ceil(zamanFarki / (1000 * 60 * 60 * 24));

            return {
                id: kart.id,
                ad: kart.ad,
                guncelBorc: donemHarcamalari, // Bu şimdilik sadece harcamalar, ödemeleri de düşebiliriz
                kalanGun: kalanGun,
                sonOdemeTarihi: sonOdemeTarihi.toLocaleDateString('tr-TR')
            };
        });
    }, [krediKartlari, giderler]);
    const kategoriOzeti = useMemo(() => filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}), [filtrelenmisGiderler]);
    const grafikVerisi = useMemo(() => { const labels = Object.keys(kategoriOzeti); if (labels.length === 0) { return { labels: ['Veri Yok'], datasets: [{ label: 'Harcama Miktarı', data: [1], backgroundColor: ['#E0E0E0'], borderColor: '#ffffff', borderWidth: 2 }], }; } const data = Object.values(kategoriOzeti); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#CCCCCC'); return { labels, datasets: [{ label: 'Harcama Miktarı', data, backgroundColor, borderColor: '#ffffff', borderWidth: 2 }], }; }, [kategoriOzeti, kategoriRenkleri]);
    const gelirGrafikVerisi = useMemo(() => { const gelirKaynaklari = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) acc[kategori] = 0; acc[kategori] += tutar; return acc; }, {}); const labels = Object.keys(gelirKaynaklari); if (labels.length === 0) { return { labels: ['Veri Yok'], datasets: [{ label: 'Gelir Kaynağı', data: [], backgroundColor: [] }], }; } const data = Object.values(gelirKaynaklari); const backgroundColor = labels.map(label => kategoriRenkleri[label] || '#2ecc71'); return { labels, datasets: [{ label: 'Gelir Kaynağı', data, backgroundColor, borderRadius: 4 }], }; }, [filtrelenmisGelirler, kategoriRenkleri]);
    
    const mevcutYillar = useMemo(() => { const yillar = new Set([...gelirler, ...giderler].map(islem => new Date(islem.tarih).getFullYear())); if (yillar.size === 0) { yillar.add(new Date().getFullYear()); } return Array.from(yillar).sort((a, b) => b - a); }, [gelirler, giderler]);
    const trendVerisi = useMemo(() => { const labels = []; const gelirlerData = []; const giderlerData = []; const bugun = new Date(); for (let i = 5; i >= 0; i--) { const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1); const yil = tarih.getFullYear(); const ay = tarih.getMonth() + 1; labels.push(tarih.toLocaleString('tr-TR', { month: 'long' })); const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((t, g) => t + g.tutar, 0); gelirlerData.push(aylikGelir); giderlerData.push(aylikGider); } return { labels, gelirler: gelirlerData, giderler: giderlerData }; }, [gelirler, giderler]);
    const yillikRaporVerisi = useMemo(() => { const aylar = []; let yillikToplamGelir = 0; let yillikToplamGider = 0; for (let i = 1; i <= 12; i++) { const aylikGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); const aylikGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i); if (aylikGelirler.length > 0 || aylikGiderler.length > 0) { const ayGelir = aylikGelirler.reduce((t, g) => t + g.tutar, 0); const ayGider = aylikGiderler.reduce((t, g) => t + g.tutar, 0); yillikToplamGelir += ayGelir; yillikToplamGider += ayGider; aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: ayGelir, gider: ayGider, bakiye: ayGelir - ayGider }); } } return { aylar, toplamGelir: yillikToplamGelir, toplamGider: yillikToplamGider, toplamBakiye: yillikToplamGelir - yillikToplamGider }; }, [gelirler, giderler, seciliYil]);

    // YENİ FİKİR 1: Kategori Karşılaştırma Raporu için Veri
const kategoriHarcamaOzeti = useMemo(() => {
    // Tarih aralığına göre filtrelenmiş giderleri kullanıyoruz
    const filtrelenmisGiderler = giderler.filter(gider => {
        const giderTarihi = new Date(gider.tarih);
        const baslangic = new Date(tarihAraligi[0].startDate);
        const bitis = new Date(tarihAraligi[0].endDate);
        baslangic.setHours(0, 0, 0, 0);
        bitis.setHours(23, 59, 59, 999);
        return giderTarihi >= baslangic && giderTarihi <= bitis;
    });

    const ozet = filtrelenmisGiderler.reduce((acc, gider) => {
        const { kategori, tutar } = gider;
        if (!acc[kategori]) {
            acc[kategori] = 0;
        }
        acc[kategori] += tutar;
        return acc;
    }, {});

    // Veriyi büyükten küçüğe sıralayarak daha anlamlı hale getiriyoruz
    return Object.entries(ozet)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

}, [giderler, tarihAraligi]);


// YENİ FİKİR 2: Nakit Akışı Raporu için Veri
const nakitAkisiVerisi = useMemo(() => {
    const labels = [];
    const netAkimData = [];
    const bugun = new Date();

    // Son 6 ay için hesaplama yapıyoruz
    for (let i = 5; i >= 0; i--) {
        const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1);
        const yil = tarih.getFullYear();
        const ay = tarih.getMonth() + 1;
        labels.push(tarih.toLocaleString('tr-TR', { month: 'long' }));

        const aylikGelir = gelirler
            .filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay)
            .reduce((t, g) => t + g.tutar, 0);
            
        const aylikGider = giderler
            .filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay)
            .reduce((t, g) => t + g.tutar, 0);
        
        netAkimData.push(aylikGelir - aylikGider);
    }
    
    return { labels, netAkim: netAkimData };
}, [gelirler, giderler]);
const trendAnalizi = useMemo(() => {
        const { gelirler, giderler } = trendVerisi;
        if (gelirler.length < 2) return null; // Analiz için en az 2 ay veri olmalı

        const sonAyGelir = gelirler[gelirler.length - 1];
        const oncekiAyGelir = gelirler[gelirler.length - 2];
        const sonAyGider = giderler[giderler.length - 1];
        const oncekiAyGider = giderler[giderler.length - 2];

        const gelirTrendi = sonAyGelir - oncekiAyGelir;
        const giderTrendi = sonAyGider - oncekiAyGider;

        if (gelirTrendi > 0 && giderTrendi < 0) {
            return { mesaj: "Mükemmel! Gelirleriniz artarken giderleriniz azalıyor.", durum: "pozitif" };
        }
        if ((sonAyGelir > sonAyGider) && (oncekiAyGelir > oncekiAyGider)) {
            return { mesaj: "Harika gidiyorsunuz! Son iki aydır gelirleriniz giderlerinizden daha fazla.", durum: "pozitif" };
        }
        if (sonAyGider > sonAyGelir) {
            return { mesaj: "Dikkat! Bu ay giderleriniz gelirlerinizi aştı. Harcamaları gözden geçirmek iyi olabilir.", durum: "negatif" };
        }
        return { mesaj: "Finansal durumunuz dengede. Bu şekilde devam edin!", durum: "notr" };
    }, [trendVerisi]);

    // YENİ: "Nakit Akışı" raporu için özet
    const nakitAkisiOzeti = useMemo(() => {
        const { netAkim, labels } = nakitAkisiVerisi;
        if (netAkim.length === 0) return null;

        const toplamNetAkim = netAkim.reduce((acc, val) => acc + val, 0);
        const enYuksekAkim = Math.max(...netAkim);
        const enIyiAy = labels[netAkim.indexOf(enYuksekAkim)];

        let mesaj = `Son 6 ayda toplam ${formatCurrency(toplamNetAkim)} net nakit akışı ${toplamNetAkim >= 0 ? 'sağladınız' : 'oluştu'}.`;
        if (enYuksekAkim > 0) {
            mesaj += ` En iyi performans gösterdiğiniz ay ${enIyiAy} (${formatCurrency(enYuksekAkim)}) oldu.`;
        }
        return { mesaj, durum: toplamNetAkim >= 0 ? "pozitif" : "negatif" };
    }, [nakitAkisiVerisi]);
    

// YENİ FİKİR 3: En Büyük Harcamalar Raporu için Veri
const enBuyukHarcamalar = useMemo(() => {
    // Tarih aralığına göre filtrelenmiş giderleri kullanıyoruz
    return giderler.filter(gider => {
        const giderTarihi = new Date(gider.tarih);
        const baslangic = new Date(tarihAraligi[0].startDate);
        const bitis = new Date(tarihAraligi[0].endDate);
        baslangic.setHours(0, 0, 0, 0);
        bitis.setHours(23, 59, 59, 999);
        return giderTarihi >= baslangic && giderTarihi <= bitis;
    })
    .sort((a, b) => b.tutar - a.tutar) // Büyükten küçüğe sırala
    .slice(0, 10); // İlk 10 tanesini al

}, [giderler, tarihAraligi]);

    // DEĞİŞİKLİK: `contextValue` güncellendi
    const contextValue = {
        // ... (mevcut tüm değerler) ...
        giderler, gelirler, transferler, hesaplar, giderKategorileri, gelirKategorileri, kategoriRenkleri, butceler, sabitOdemeler,
        krediKartlari,
        hedefler,
        ayarlar,
        tumHesaplar,
        addIslem, updateIslem, openDeleteModal, handleCloseModal, handleConfirmDelete, handleTopluSil,
        bekleyenOdemeler,
        handleBekleyenOdemeleriIsle,
        handleBekleyenOdemeyiAtla,
        handleHesapEkle, handleHesapSil, handleHesapGuncelle,
        handleKategoriEkle, handleKategoriSil, handleKategoriSirala, handleKategoriGuncelle,
        handleButceEkle, handleButceSil, handleButceGuncelle,
        handleSabitOdemeEkle, handleSabitOdemeSil, handleSabitOdemeGuncelle,
        handleKrediKartiEkle, 
        handleKrediKartiSil, 
        handleKrediKartiGuncelle, 
        handleHedefEkle,
        handleHedefGuncelle,
        handleHedefSil,
        handleHedefeParaEkle,
        updateBildirimAyarlari,
        handleVeriIndir,
        tarihAraligi,        
        setTarihAraligi,
        seciliAy, setSeciliAy, seciliYil, setSeciliYil,
        birlesikFiltreKategori, setBirlesikFiltreKategori, birlesikFiltreTip, setBirlesikFiltreTip,
        birlesikSiralamaKriteri, setBirlesikSiralamaKriteri, birlesikFiltreHesap, setBirlesikFiltreHesap,
        aramaMetni, setAramaMetni,
        isModalOpen, itemToDelete,
        karsilastirmaliAylikOzet,
        onecelikliHedef,
        finansalSaglikPuani,
        filtrelenmisGelirler, filtrelenmisGiderler, toplamGelir, toplamGider,
        toplamBakiye, kategoriOzeti, grafikVerisi, gelirGrafikVerisi, butceDurumlari, birlesikIslemler,
        mevcutYillar, 
        trendVerisi, 
        yillikRaporVerisi,
        kategoriHarcamaOzeti,
        nakitAkisiVerisi,
        enBuyukHarcamalar,
        yaklasanOdemeler, krediKartiOzetleri, genelHesapBakiyeleri, aylikHesapGiderleri,
        transferGuestDataToFirestore,
        // YENİ: Rapor analizleri context'e eklendi
        trendAnalizi,
        nakitAkisiOzeti,
        sabitOdemelerOzeti
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};