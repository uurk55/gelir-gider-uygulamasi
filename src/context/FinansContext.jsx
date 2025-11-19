// src/context/FinansContext.jsx (HATADAN ARINDIRILMIŞ KESİN KOD)
import * as XLSX from 'xlsx'; // <<--- YENİ IMPORT
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
        },
        tercihler: {
            paraBirimi: 'TRY',
            baslangicSayfasi: '/',
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

    // YENİ: CSV verilerini toplu halde işleyecek fonksiyon
   const handleVeriIçeAktar = async (veriler, toastId) => {
        // 1. Giriş Kontrolü
        if (!currentUser) {
            return toast.error("Verileri içe aktarmak için giriş yapmış olmalısınız.", { id: toastId });
        }
        // 2. Veri Varlığı Kontrolü
        if (!veriler || veriler.length === 0) {
            return toast.error("Excel dosyasında içe aktarılacak veri bulunamadı.", { id: toastId });
        }

        const hatalar = []; // Satır bazlı hataları biriktir
        let eklenenIslemSayisi = 0;

        // Uygulamadaki mevcut hesap ve kategori adlarını küçük harfe çevirip Set'e at (hızlı kontrol için)
        const mevcutHesapAdlari = new Set(hesaplar.map(h => h.ad.toLowerCase().trim()));
        const mevcutGiderKategorileri = new Set(giderKategorileri.map(k => k.toLowerCase().trim()));
        const mevcutGelirKategorileri = new Set(gelirKategorileri.map(k => k.toLowerCase().trim()));

        // Excel'den gelen tarihleri (sayı veya farklı formatlar olabilir) YYYY-MM-DD metnine çeviren fonksiyon
        const excelTarihiniFormatla = (excelDate) => {
            if (typeof excelDate === 'number') {
                // Excel tarih sayısı -> JavaScript Date -> YYYY-MM-DD
                const jsDate = new Date(Date.UTC(1899, 11, 30 + excelDate));
                if (!isNaN(jsDate.getTime())) {
                    return jsDate.toISOString().split('T')[0];
                }
            } else if (typeof excelDate === 'string') {
                // "YYYY-MM-DD" formatını direkt kullan
                if (excelDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return excelDate;
                }
                // "DD.MM.YYYY" veya "DD/MM/YYYY" gibi formatları çevirmeyi dene
                try {
                    // Ayırıcıyı nokta veya slash yap, sonra parçala
                    const parts = excelDate.replace(/\//g, '.').split('.');
                    if (parts.length === 3) {
                         // YYYY-MM-DD formatına getir
                        const year = parts[2];
                        const month = parts[1].padStart(2, '0');
                        const day = parts[0].padStart(2, '0');
                        const dateObj = new Date(`${year}-${month}-${day}`);
                         // Geçerli bir tarih mi diye son kontrol
                        if (!isNaN(dateObj.getTime())) {
                            return `${year}-${month}-${day}`;
                        }
                    }
                } catch (e) { /* Hata olursa aşağıda null dönecek */ }
            }
            // Geçersiz veya tanınmayan format
            return null;
        };


        // --- ÖN KONTROL AŞAMASI: Hesap ve Kategori adları uygulamada var mı? ---
        for (const [index, satir] of veriler.entries()) {
            const satirNumarasi = index + 2; // Excel'deki satır numarası (+1 header, +1 index)
            const hesapAdi = satir.Hesap?.toString().trim(); // Hesap adı sayı da olabilir, stringe çevir ve boşlukları al
            const kategori = satir.Kategori?.trim();
            const tip = satir.Tip?.trim().toLowerCase();

            // Hesap Adı Kontrolü
            if (hesapAdi && !mevcutHesapAdlari.has(hesapAdi.toLowerCase())) {
                hatalar.push(`${satirNumarasi}. Satır: '${hesapAdi}' hesabı uygulamada tanımlı değil.`);
            }
            // Kategori Adı Kontrolü (Tipe göre)
            if (kategori) {
                if (tip === 'gider' && !mevcutGiderKategorileri.has(kategori.toLowerCase())) {
                    hatalar.push(`${satirNumarasi}. Satır: '${kategori}' gider kategorisi bulunamadı.`);
                } else if (tip === 'gelir' && !mevcutGelirKategorileri.has(kategori.toLowerCase())) {
                    hatalar.push(`${satirNumarasi}. Satır: '${kategori}' gelir kategorisi bulunamadı.`);
                }
            }
            // Diğer zorunlu alanların varlığını da kontrol edebiliriz (isteğe bağlı)
            // if (!tip || !satir.Tarih || !satir.Açıklama || !satir.Tutar) {
            //     hatalar.push(`${satirNumarasi}. Satır: Tip, Tarih, Açıklama veya Tutar bilgisi eksik.`);
            // }
        }

        // Eğer ön kontrolde bir hata bulunduysa, işlemi durdur ve tüm hataları göster.
        if (hatalar.length > 0) {
            const benzersizHatalar = [...new Set(hatalar)]; // Aynı hatayı tekrar gösterme
            toast.error(
                <div>
                    <b>İçe aktarma başarısız! Lütfen önce Excel dosyanızdaki şu hataları düzeltin:</b>
                    <ul style={{ textAlign: 'left', paddingLeft: '20px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                        {benzersizHatalar.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                </div>,
                { id: toastId, duration: 15000 } // Hataları okumak için uzun süre göster
            );
            return; // Fonksiyondan çık
        }

        // --- VERİ İŞLEME VE KAYDETME AŞAMASI ---
        const batch = writeBatch(db);
        try {
            for (const [index, satir] of veriler.entries()) {
                const satirNumarasi = index + 2;
                const tip = satir.Tip?.trim().toLowerCase();
                // Tutar'ı daha sağlam al: Para birimi simgesi, binlik ayıracı temizle, ondalık virgülünü noktaya çevir
                const tutarStr = satir.Tutar?.toString().replace(/[^0-9.,-]+/g,"").replace(',', '.');
                const tutar = parseFloat(tutarStr);
                const tarih = excelTarihiniFormatla(satir.Tarih); // Formatlanmış tarihi al
                const aciklama = satir.Açıklama?.trim(); // Excel başlığı 'Açıklama' olmalı
                const kategori = satir.Kategori?.trim();
                const hesapAdi = satir.Hesap?.toString().trim();

                // Satırın geçerli olup olmadığını son kez kontrol et (daha detaylı)
                 if (!['gelir', 'gider'].includes(tip)) {
                    console.warn(`${satirNumarasi}. Satır: Geçersiz 'Tip' ('${satir.Tip}'). Atlandı.`); continue;
                }
                if (isNaN(tutar)) {
                    console.warn(`${satirNumarasi}. Satır: Geçersiz 'Tutar' ('${satir.Tutar}'). Atlandı.`); continue;
                }
                 if (!tarih) {
                    console.warn(`${satirNumarasi}. Satır: Geçersiz 'Tarih' ('${satir.Tarih}'). Atlandı.`); continue;
                 }
                if (!aciklama) {
                    console.warn(`${satirNumarasi}. Satır: 'Açıklama' boş. Atlandı.`); continue;
                 }
                 if (!kategori) {
                    console.warn(`${satirNumarasi}. Satır: 'Kategori' boş. Atlandı.`); continue;
                 }
                 if (!hesapAdi) {
                    console.warn(`${satirNumarasi}. Satır: 'Hesap' boş. Atlandı.`); continue;
                 }

                // Hesap ID'sini bul (ön kontrolden geçtiği için bulunmalı)
                const hesap = hesaplar.find(h => h.ad.toLowerCase().trim() === hesapAdi.toLowerCase());
                if (!hesap) continue; // Yine de bir kontrol ekleyelim

                // Veritabanına yazılacak veriyi oluştur
                const islemVerisi = { aciklama, tutar, kategori, tarih, hesapId: hesap.id };

                // Doğru koleksiyona ekle
                const collectionName = tip + 'ler';
                const docRef = doc(collection(db, 'users', currentUser.uid, collectionName));
                batch.set(docRef, islemVerisi); // Toplu yazma işlemine ekle
                eklenenIslemSayisi++;
            }

            // Toplu yazma işlemini gerçekleştir
            if (eklenenIslemSayisi > 0) {
                await batch.commit();
                toast.success(`${eklenenIslemSayisi} adet işlem başarıyla içe aktarıldı!`, { id: toastId });
            } else {
                // Bu durum genellikle dosya boşsa veya tüm satırlar hatalıysa olur.
                toast.error("Dosyada içe aktarılacak geçerli formatta bir veri bulunamadı.", { id: toastId });
            }

        } catch (error) {
            console.error("Toplu veri ekleme sırasında hata:", error);
            toast.error("Veriler içe aktarılırken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.", { id: toastId });
        }
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
                        
                        setAyarlar(prev => ({
                            ...prev,
                            bildirimler: { ...prev.bildirimler, ...(data.ayarlar?.bildirimler || {}) },
                            tercihler: { ...prev.tercihler, ...(data.ayarlar?.tercihler || {}) }
                        }));

                    } else {
                        await setDoc(doc(db, 'users', uid), {
                            hesaplar: VARSAYILAN_HESAPLAR,
                            giderKategorileri: GIDER_KATEGORILERI_VARSAYILAN,
                            gelirKategorileri: GELIR_KATEGORILERI_VARSAYILAN,
                            ayarlar: {
                                bildirimler: { yaklasanOdemeler: false, butceAsimi: false, haftalikOzet: false },
                                tercihler: { paraBirimi: 'TRY', baslangicSayfasi: '/' }
                            }
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

    // ... dosyanın geri kalan tüm fonksiyonları aynı kalacak ...
    // useEffect, handleBekleyen, updateAyarlar, addIslem, vs. hepsi aynı...
    useEffect(() => {
        if (!currentUser || sabitOdemeler.length === 0) {
            setBekleyenOdemeler([]);
            return;
        }

        const bugun = new Date();
        const buAy = bugun.getMonth();
        const buYil = bugun.getFullYear();
        const yeniBekleyenOdemeler = [];
        
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

            const buAyAtlandi = buAyAtlananlar.includes(odeme.id);

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
        
        const bugun = new Date();
        const buAyYil = `${bugun.getFullYear()}-${bugun.getMonth()}`;
        
        const atlananlarKey = `atlananOdemeler_${currentUser.uid}_${buAyYil}`;
        const mevcutAtlananlar = getLocalData(atlananlarKey, []);

        const yeniAtlananlar = [...mevcutAtlananlar, atlananOdeme.id];
        setLocalData(atlananlarKey, yeniAtlananlar);

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
        mevcutTutar: 0, 
        olusturmaTarihi: new Date().toISOString()
    };
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
    deleteDocument('hedefler', id).then(() => {
        toast.error("Hedef silindi.");
    });
};

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
        
        const yeniMevcutTutar = (hedef.mevcutTutar || 0) + tutar;
        const hedefGuncellemePromise = addOrUpdateDocument('hedefler', { mevcutTutar: yeniMevcutTutar }, hedefId);

        const giderVerisi = {
            aciklama: `'${hedef.ad}' hedefi için birikim`,
            tutar: tutar,
            kategori: 'Hedef Birikimi',
            tarih: new Date().toISOString().split('T')[0],
            hesapId: kaynakHesapId,
            hedefId: hedefId
        };
        const giderEklemePromise = addIslem(ISLEM_TURLERI.GIDER, giderVerisi);
        
        await Promise.all([hedefGuncellemePromise, giderEklemePromise]);

        toast.success(`${formatCurrency(tutar)} hedefinize eklendi!`, { id: toastId });

    } catch (error) {
        console.error("Hedefe para eklenirken hata:", error);
        toast.error(error.message || "İşlem sırasında bir hata oluştu.", { id: toastId });
    }
};
    const updateBildirimAyarlari = async (yeniBildirimAyar) => {
    if (!currentUser) return; 
    
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, {
            ayarlar: {
                bildirimler: yeniBildirimAyar
            }
        }, { merge: true });
        
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

    const updateTercihler = async (yeniTercihler) => {
        if (!currentUser) return;
        
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, {
                ayarlar: {
                    tercihler: yeniTercihler
                }
            }, { merge: true });

            setAyarlar(prev => ({
                ...prev,
                tercihler: yeniTercihler
            }));

            toast.success('Tercihleriniz güncellendi!');
        } catch (error) {
            console.error("Tercihler güncellenirken hata:", error);
            toast.error('Tercihler güncellenirken bir hata oluştu.');
        }
    };

    const handleVeriIndir = () => {
        if (!gelirler && !giderler && !transferler) {
            return toast.error("İndirilecek veri bulunmuyor.");
        }
        const toastId = toast.loading("Excel dosyası hazırlanıyor...");

        try {
            // Veriyi hazırlama (CSV ile aynı mantık)
            const raporVerisi = [
                ...gelirler.map(item => ({ Tip: 'Gelir', Tarih: item.tarih, Aciklama: item.aciklama, Kategori: item.kategori, Hesap: hesaplar.find(h => h.id === item.hesapId)?.ad || 'Bilinmiyor', Tutar: item.tutar })),
                ...giderler.map(item => ({ Tip: 'Gider', Tarih: item.tarih, Aciklama: item.aciklama, Kategori: item.kategori, Hesap: hesaplar.find(h => h.id === item.hesapId)?.ad || 'Bilinmiyor', Tutar: item.tutar })), // Gider tutarı pozitif kalsın
                ...transferler.map(item => ({ Tip: 'Transfer', Tarih: item.tarih, Aciklama: item.aciklama || 'Transfer', Kategori: '', Hesap: `${hesaplar.find(h => h.id === item.gonderenHesapId)?.ad || '?'} -> ${hesaplar.find(h => h.id === item.aliciHesapId)?.ad || '?'}`, Tutar: item.tutar }))
            ];
            raporVerisi.sort((a, b) => new Date(b.Tarih) - new Date(a.Tarih)); // Tarihe göre sırala

            // Excel için veri formatını düzenle (Başlık sırası önemli)
            const excelData = raporVerisi.map(item => ({
                'Tip': item.Tip,
                'Tarih': item.Tarih,
                'Açıklama': item.Aciklama,
                'Kategori': item.Kategori,
                'Hesap': item.Hesap,
                'Tutar': item.Tutar // Sayı olarak bırakıyoruz
            }));

            // Excel Çalışma Sayfası Oluşturma
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Sütun genişliklerini ayarlama (isteğe bağlı ama güzel görünür)
            worksheet['!cols'] = [
                { wch: 10 }, // Tip
                { wch: 12 }, // Tarih
                { wch: 30 }, // Açıklama
                { wch: 15 }, // Kategori
                { wch: 25 }, // Hesap
                { wch: 15 }  // Tutar
            ];

             // Tutar sütununu para birimi formatına ayarlama (isteğe bağlı)
            // Bu kısım biraz daha detaylı, şimdilik sayı olarak bırakalım, istersen sonra ekleriz.
             Object.keys(worksheet).forEach(cellAddress => {
                if (cellAddress.startsWith('F') && cellAddress !== 'F1') { // F sütunu (Tutar), başlık hariç
                    const cell = worksheet[cellAddress];
                    if (cell && typeof cell.v === 'number') {
                        cell.t = 'n'; // Sayı formatı
                        cell.z = '#,##0.00 ₺'; // Türkçe para birimi formatı
                    }
                }
             });


            // Excel Çalışma Kitabı Oluşturma
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "İşlemler"); // Sayfa adı

            // Dosyayı İndirme
            const today = new Date().toISOString().slice(0, 10);
            XLSX.writeFile(workbook, `FinansTakip-Rapor-${today}.xlsx`);

            toast.success("Excel dosyası başarıyla indirildi!", { id: toastId });

        } catch (error) {
            console.error("Excel indirme hatası:", error);
            toast.error("Excel dosyası indirilirken bir hata oluştu.", { id: toastId });
        }
    };
    const handleDownloadExcelTemplate = () => {
    try {
        // Şablonda görünecek örnek veriler
        const templateData = [
            { Tip: 'gider', Tarih: 'YYYY-AA-GG', Açıklama: 'Market Alışverişi', Kategori: 'Market', Hesap: 'Banka Hesabı', Tutar: 150.75 },
            { Tip: 'gelir', Tarih: 'YYYY-AA-GG', Açıklama: 'Ekim Ayı Maaşı', Kategori: 'Maaş', Hesap: 'Banka Hesabı', Tutar: 15000.00 }
            // İstersen daha fazla örnek satır ekleyebilirsin
        ];
        // Veriyi Excel sayfasına dönüştür
        const worksheet = XLSX.utils.json_to_sheet(templateData);

        // Sütun başlıklarını kalın yap (isteğe bağlı)
         const headerCellStyle = { font: { bold: true } };
         ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'].forEach(cell => {
             if(worksheet[cell]) worksheet[cell].s = headerCellStyle;
         });

        // Sütun genişliklerini ayarla (daha okunaklı olması için)
        worksheet['!cols'] = [
            { wch: 10 }, // Tip
            { wch: 12 }, // Tarih
            { wch: 30 }, // Açıklama
            { wch: 15 }, // Kategori
            { wch: 25 }, // Hesap
            { wch: 15 }  // Tutar
        ];

        // Tutar sütununu para birimi formatına ayarla
         Object.keys(worksheet).forEach(cellAddress => {
            // F sütunu (Tutar), başlık (F1) hariç
            if (cellAddress.startsWith('F') && cellAddress !== 'F1') {
                const cell = worksheet[cellAddress];
                // Hücre varsa ve değeri bir sayı ise formatı uygula
                if (cell && typeof cell.v === 'number') {
                    cell.t = 'n'; // Hücre tipini 'sayı' yap
                    cell.z = '#,##0.00 ₺'; // Türkçe para birimi formatı
                }
            }
             // Tarih sütununu metin olarak ayarla (Excel'in otomatik çevirmesini engellemek için)
             else if (cellAddress.startsWith('B') && cellAddress !== 'B1') {
                 const cell = worksheet[cellAddress];
                 if (cell) {
                     cell.t = 's'; // Hücre tipini 'metin' yap
                 }
             }
         });

        // Yeni bir Excel çalışma kitabı oluştur
        const workbook = XLSX.utils.book_new();
        // Çalışma sayfasını kitaba ekle, sayfa adı "Şablon" olsun
        XLSX.utils.book_append_sheet(workbook, worksheet, "Şablon");
        // Kullanıcıya dosyayı indir
        XLSX.writeFile(workbook, "FinansTakip_Sablon.xlsx");

    } catch (error) {
        console.error("Excel şablon indirme hatası:", error);
        toast.error("Şablon indirilirken bir hata oluştu.");
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

    const birlesikIslemler = useMemo(() => {
        const { startDate, endDate } = tarihAraligi[0];

        // Filtre tarihlerinin saatini sıfırlayarak tam gün kapsaması sağla
        const baslangic = new Date(startDate);
        baslangic.setHours(0, 0, 0, 0);
        const bitis = new Date(endDate);
        bitis.setHours(23, 59, 59, 999);
        
        const temelListe = [
            ...gelirler.map(g => ({ ...g, tip: ISLEM_TURLERI.GELIR })),
            ...giderler.map(g => ({ ...g, tip: ISLEM_TURLERI.GIDER })),
            ...transferler.map(t => ({ ...t, tip: ISLEM_TURLERI.TRANSFER }))
        ];

        const aramaTerimi = aramaMetni.toLowerCase();

        const filtrelenmisListe = temelListe.filter(islem => {
            let islemTarihi;

            // --- YENİ VE KESİN TARİH DÖNÜŞTÜRME MANTIĞI ---
            // islem.tarih'in ne olduğunu kontrol edip her zaman geçerli bir Date nesnesine dönüştürür.
            if (islem.tarih && typeof islem.tarih.toDate === 'function') {
                // Seçenek 1: Bu bir Firestore Timestamp nesnesi.
                islemTarihi = islem.tarih.toDate();
            } else if (typeof islem.tarih === 'string' && islem.tarih.includes('-')) {
                // Seçenek 2: Bu "YYYY-MM-DD" formatında bir metin. Saat dilimi sorunlarını önlemek için parçalayarak birleştir.
                const dateParts = islem.tarih.split('-');
                islemTarihi = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            } else {
                // Seçenek 3: Bu zaten bir Date nesnesi veya başka bir format.
                islemTarihi = new Date(islem.tarih);
            }
            // --- DÖNÜŞTÜRME SONU ---
            
            // Artık islemTarihi'nin her zaman geçerli bir Date nesnesi olduğundan eminiz.
            const tarihSart = islemTarihi >= baslangic && islemTarihi <= bitis;
            
            const tipSart = birlesikFiltreTip === 'Tümü' || islem.tip === birlesikFiltreTip;
            const kategoriSart = islem.tip === 'Transfer' || birlesikFiltreKategori === 'Tümü' || islem.kategori === birlesikFiltreKategori;
            const hesapSart = birlesikFiltreHesap === 'Tümü' || islem.hesapId === birlesikFiltreHesap || islem.gonderenHesapId === birlesikFiltreHesap || islem.aliciHesapId === birlesikFiltreHesap;
            const aramaSart = aramaTerimi === '' || (islem.aciklama && islem.aciklama.toLowerCase().includes(aramaTerimi));

            return tarihSart && tipSart && kategoriSart && hesapSart && aramaSart;
        });

        return filtrelenmisListe.sort((a, b) => {
            // Sıralama için new Date() kullanmak güvenlidir.
            return new Date(b.tarih) - new Date(a.tarih);
        });
    }, [gelirler, giderler, transferler, tarihAraligi, birlesikFiltreTip, birlesikFiltreKategori, birlesikSiralamaKriteri, birlesikFiltreHesap, aramaMetni]);

    const filtrelenmisGelirler = useMemo(() => gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [gelirler, seciliAy, seciliYil]);
    const filtrelenmisGiderler = useMemo(() => giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy), [giderler, seciliAy, seciliYil]);

    const toplamGelir = useMemo(() => filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGelirler]);
    const toplamGider = useMemo(() => filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0), [filtrelenmisGiderler]);

    const genelHesapBakiyeleri = useMemo(() => { return hesaplar.reduce((acc, hesap) => { const toplamGiren = gelirler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.aliciHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); const toplamCikan = giderler.filter(g => g.hesapId === hesap.id).reduce((t, g) => t + g.tutar, 0) + transferler.filter(t => t.gonderenHesapId === hesap.id).reduce((t, tr) => t + tr.tutar, 0); acc[hesap.id] = toplamGiren - toplamCikan; return acc; }, {}); }, [hesaplar, gelirler, giderler, transferler]);
    const toplamBakiye = useMemo(() => Object.values(genelHesapBakiyeleri).reduce((t, b) => t + b, 0), [genelHesapBakiyeleri]);
    
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

    }, [gelirler, giderler, seciliAy, seciliYil, toplamGelir, toplamGider]);
    const onecelikliHedef = useMemo(() => {
    const aktifHedefler = hedefler.filter(h => h.mevcutTutar < h.hedefTutar);
    
    if (aktifHedefler.length === 0) {
        return null;
    }

    const tarihliHedefler = aktifHedefler.filter(h => h.hedefTarih);
    if (tarihliHedefler.length > 0) {
        tarihliHedefler.sort((a, b) => new Date(a.hedefTarih) - new Date(b.hedefTarih));
        return tarihliHedefler[0];
    }

    aktifHedefler.sort((a, b) => new Date(b.olusturmaTarihi) - new Date(a.olusturmaTarihi));
    return aktifHedefler[0];

}, [hedefler]);

    
    const tumHesaplar = useMemo(() => {
        const formatlanmisKrediKartlari = krediKartlari.map(kart => ({ ...kart, ad: `${kart.ad} (KK)`, tip: 'krediKarti' }));
        const formatlanmisNakitHesaplar = hesaplar.map(hesap => ({ ...hesap, tip: 'varlik' }));
        return [...formatlanmisNakitHesaplar, ...formatlanmisKrediKartlari];
    }, [hesaplar, krediKartlari]);
    const aylikHesapGiderleri = useMemo(() => { const giderlerByHesap = filtrelenmisGiderler.reduce((acc, gider) => { const hesapId = gider.hesapId; if (!acc[hesapId]) acc[hesapId] = 0; acc[hesapId] += gider.tutar; return acc; }, {}); return hesaplar.map(hesap => { const aylikGider = giderlerByHesap[hesap.id] || 0; if (aylikGider === 0) return null; const giderYuzdesi = toplamGider > 0 ? (aylikGider / toplamGider) * 100 : 0; return { id: hesap.id, ad: hesap.ad, aylikGider, giderYuzdesi }; }).filter(Boolean).sort((a, b) => b.aylikGider - a.aylikGider); }, [hesaplar, filtrelenmisGiderler, toplamGider]);
    const butceDurumlari = useMemo(() => {
    const oncekiAyTarih = new Date(seciliYil, seciliAy - 2, 1);
    const oncekiAyGiderleri = giderler.filter(g => {
        const giderTarihi = new Date(g.tarih);
        return giderTarihi.getFullYear() === oncekiAyTarih.getFullYear() && giderTarihi.getMonth() === oncekiAyTarih.getMonth();
    });

    const bugun = new Date();
    const ayinSonGunu = new Date(seciliYil, seciliAy, 0).getDate(); 
    const bugununGunu = bugun.getDate();

    return butceler.map(butce => {
        const harcanan = filtrelenmisGiderler
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);

        const oncekiAyHarcanan = oncekiAyGiderleri
            .filter(gider => gider.kategori.trim() === butce.kategori.trim())
            .reduce((toplam, gider) => toplam + gider.tutar, 0);
        
        let tahminiHarcama = 0;
        if (harcanan > 0 && seciliYil === bugun.getFullYear() && seciliAy === bugun.getMonth() + 1) {
            tahminiHarcama = (harcanan / bugununGunu) * ayinSonGunu;
        }
        const tahminiAsim = tahminiHarcama > butce.limit ? tahminiHarcama - butce.limit : 0;

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
        
        return { 
            ...butce, harcanan, kalan, yuzde: Math.min(yuzdeRaw, 100), 
            yuzdeRaw, degisimYuzdesi, durum,
            tahminiHarcama,
            tahminiAsim,
        };
    });
}, [butceler, filtrelenmisGiderler, giderler, seciliAy, seciliYil]);
const finansalSaglikPuani = useMemo(() => {
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

    let butceKontrolPuani = 0;
    let basariliButceOrani = 0;
    if (butceDurumlari && butceDurumlari.length > 0) {
        const basariliButceSayisi = butceDurumlari.filter(b => b.yuzdeRaw <= 100).length;
        basariliButceOrani = basariliButceSayisi / butceDurumlari.length;
        butceKontrolPuani = basariliButceOrani * 30;
    } else {
        butceKontrolPuani = 15;
    }
    
    let acilDurumFonuPuani = 0;
    let fonKarsilamaAyi = 0;
    if (ortalamaAylikGider > 0) {
        fonKarsilamaAyi = toplamBakiye / ortalamaAylikGider;
        const fonYeterliligi = fonKarsilamaAyi / 3;
        acilDurumFonuPuani = Math.min(1, fonYeterliligi) * 30;
    } else if (toplamBakiye > 0) {
        acilDurumFonuPuani = 30;
    }
    
    const toplamPuan = Math.round(tasarrufOraniPuani + butceKontrolPuani + acilDurumFonuPuani) || 0;
    
    let genelDurum = 'Geliştirilmeli';
    if (toplamPuan > 80) genelDurum = 'Mükemmel';
    else if (toplamPuan > 60) genelDurum = 'İyi';
    
    return {
        puan: toplamPuan,
        durum: genelDurum,
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
        }).sort((a, b) => a.kalanGun - b.kalanGun);
    }, [sabitOdemeler]);

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
            
            let hesapKesimTarihi = new Date(buYil, buAy, kesimGunu);
            let sonOdemeTarihi = new Date(buYil, buAy, sonOdemeGunu);

            if (sonOdemeGunu < kesimGunu) {
                sonOdemeTarihi.setMonth(buAy + 1);
            }
            
            if (bugun.getDate() > kesimGunu) {
                hesapKesimTarihi.setMonth(buAy + 1);
                sonOdemeTarihi.setMonth(buAy + 2);
                if (sonOdemeGunu >= kesimGunu) {
                    sonOdemeTarihi.setMonth(buAy + 1);
                }
            }

            const oncekiKesimTarihi = new Date(hesapKesimTarihi);
            oncekiKesimTarihi.setMonth(oncekiKesimTarihi.getMonth() - 1);

            const donemHarcamalari = giderler.filter(gider => {
                if (gider.hesapId !== kart.id) return false;
                const giderTarihi = new Date(gider.tarih);
                return giderTarihi > oncekiKesimTarihi && giderTarihi <= hesapKesimTarihi;
            }).reduce((toplam, gider) => toplam + gider.tutar, 0);

            const zamanFarki = sonOdemeTarihi.getTime() - bugun.getTime();
            const kalanGun = Math.ceil(zamanFarki / (1000 * 60 * 60 * 24));

            return {
                id: kart.id,
                ad: kart.ad,
                guncelBorc: donemHarcamalari,
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

const kategoriHarcamaOzeti = useMemo(() => {
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

    return Object.entries(ozet)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

}, [giderler, tarihAraligi]);


const nakitAkisiVerisi = useMemo(() => {
    const labels = [];
    const netAkimData = [];
    const bugun = new Date();

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
        if (gelirler.length < 2) return null;

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
    
const enBuyukHarcamalar = useMemo(() => {
    return giderler.filter(gider => {
        const giderTarihi = new Date(gider.tarih);
        const baslangic = new Date(tarihAraligi[0].startDate);
        const bitis = new Date(tarihAraligi[0].endDate);
        baslangic.setHours(0, 0, 0, 0);
        bitis.setHours(23, 59, 59, 999);
        return giderTarihi >= baslangic && giderTarihi <= bitis;
    })
    .sort((a, b) => b.tutar - a.tutar)
    .slice(0, 10);

}, [giderler, tarihAraligi]);

    const contextValue = {
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
        updateTercihler,
        handleVeriIndir, // Güncellenmiş Excel indirme
        handleVeriIçeAktar, // Güncellenmiş Excel içe aktarma
        handleDownloadExcelTemplate,
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
        trendAnalizi,
        nakitAkisiOzeti,
        sabitOdemelerOzeti,        
    };

    return <FinansContext.Provider value={contextValue}>{children}</FinansContext.Provider>;
};