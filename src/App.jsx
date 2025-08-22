// GÜNCELLENMİŞ ve TAM - App.jsx

import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './App.css';
import Modal from './components/Modal';
import './components/Modal.css';
import GenelBakis from './pages/GenelBakis';
import Islemler from './pages/Islemler';
import SabitOdemeler from './pages/SabitOdemeler';
import Raporlar from './pages/Raporlar';
import Ayarlar from './pages/Ayarlar';
import Butceler from './pages/Butceler';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const GIDER_KATEGORILERI_VARSAYILAN = ["Market", "Fatura", "Ulaşım", "Eğlence", "Sağlık", "Kira", "Kredi", "Abonelik", "Diğer"];
const GELIR_KATEGORILERI_VARSAYILAN = ["Maaş", "Ek Gelir", "Hediye", "Diğer"];

function App() {
  const getBugununTarihi = () => new Date().toISOString().split('T')[0];

  const [giderKategorileri, setGiderKategorileri] = useState(() => JSON.parse(localStorage.getItem('giderKategorileri')) || GIDER_KATEGORILERI_VARSAYILAN);
  const [gelirKategorileri, setGelirKategorileri] = useState(() => JSON.parse(localStorage.getItem('gelirKategorileri')) || GELIR_KATEGORILERI_VARSAYILAN);
  const [giderler, setGiderler] = useState(() => JSON.parse(localStorage.getItem('giderler')) || []);
  const [gelirler, setGelirler] = useState(() => JSON.parse(localStorage.getItem('gelirler')) || []);
  const [sabitOdemeler, setSabitOdemeler] = useState(() => JSON.parse(localStorage.getItem('sabitOdemeler')) || []);
  const [butceler, setButceler] = useState(() => JSON.parse(localStorage.getItem('butceler')) || []);
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
  const [giderFiltreKategori, setGiderFiltreKategori] = useState('Tümü');
  const [giderSiralamaKriteri, setGiderSiralamaKriteri] = useState('tarih-yeni');
  const [gelirFiltreKategori, setGelirFiltreKategori] = useState('Tümü');
  const [gelirSiralamaKriteri, setGelirSiralamaKriteri] = useState('tarih-yeni');
  const [seciliAy, setSeciliAy] = useState(new Date().getMonth() + 1);
  const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [onayBekleyenAbonelikler, setOnayBekleyenAbonelikler] = useState([]);
  const [aktifIslemTipi, setAktifIslemTipi] = useState('gider');

  useEffect(() => { localStorage.setItem('giderler', JSON.stringify(giderler)); }, [giderler]);
  useEffect(() => { localStorage.setItem('gelirler', JSON.stringify(gelirler)); }, [gelirler]);
  useEffect(() => { localStorage.setItem('sabitOdemeler', JSON.stringify(sabitOdemeler)); }, [sabitOdemeler]);
  useEffect(() => { localStorage.setItem('giderKategorileri', JSON.stringify(giderKategorileri)); }, [giderKategorileri]);
  useEffect(() => { localStorage.setItem('gelirKategorileri', JSON.stringify(gelirKategorileri)); }, [gelirKategorileri]);
  useEffect(() => { localStorage.setItem('butceler', JSON.stringify(butceler)); }, [butceler]);

  useEffect(() => {
    const kontrolTarihi = new Date(seciliYil, seciliAy - 1, 1);
    const eklenecekOtomatikGiderler = [];
    sabitOdemeler.forEach(odeme => { if (!odeme.taksitSayisi) return; const baslangicTarihi = new Date(odeme.baslangicTarihi); const bitisTarihi = new Date(baslangicTarihi); bitisTarihi.setMonth(bitisTarihi.getMonth() + odeme.taksitSayisi); if (kontrolTarihi >= baslangicTarihi && kontrolTarihi < bitisTarihi) { const odemeTarihiStr = `${seciliYil}-${String(seciliAy).padStart(2, '0')}-${String(odeme.odemeGunu).padStart(2, '0')}`; const aylarFarki = (seciliYil - baslangicTarihi.getFullYear()) * 12 + (seciliAy - (baslangicTarihi.getMonth() + 1)); const kacinciTaksit = aylarFarki + 1; const aciklamaText = `${odeme.aciklama} (${kacinciTaksit}/${odeme.taksitSayisi})`; const zatenEklenmisMi = giderler.some(gider => gider.kaynakId === odeme.id && gider.tarih === odemeTarihiStr); if (!zatenEklenmisMi) { eklenecekOtomatikGiderler.push({ id: Date.now() + Math.random(), aciklama: aciklamaText, tutar: odeme.tutar, kategori: odeme.kategori, tarih: odemeTarihiStr, otomatikMi: true, kaynakId: odeme.id }); } } });
    if (eklenecekOtomatikGiderler.length > 0) { setGiderler(prevGiderler => [...prevGiderler, ...eklenecekOtomatikGiderler]); toast.success(`${eklenecekOtomatikGiderler.length} adet taksitli ödeme giderlere eklendi!`, { icon: '🤖' }); }
  }, [seciliAy, seciliYil, sabitOdemeler, giderler]);

  useEffect(() => {
    const kontrolTarihi = new Date(seciliYil, seciliAy - 1, 1);
    const yaklasanAbonelikler = [];
    sabitOdemeler.forEach(odeme => { if (odeme.taksitSayisi) return; const baslangicTarihi = new Date(odeme.baslangicTarihi); if (kontrolTarihi >= baslangicTarihi) { const zatenEklenmisMi = giderler.some(gider => gider.kaynakId === odeme.id && gider.tarih.startsWith(`${seciliYil}-${String(seciliAy).padStart(2, '0')}`)); if (!zatenEklenmisMi) { yaklasanAbonelikler.push(odeme); } } });
    setOnayBekleyenAbonelikler(yaklasanAbonelikler);
  }, [seciliAy, seciliYil, sabitOdemeler, giderler]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (aktifIslemTipi === 'gider') {
      if (!aciklama || !tutar || !kategori) return;
      if (giderDuzenlemeModu) { setGiderler(giderler.map(g => g.id === duzenlenecekGiderId ? { ...g, aciklama, tutar: parseFloat(tutar), kategori, tarih } : g)); toast.success('Gider başarıyla güncellendi!'); } 
      else {
        const yeniGider = { id: Date.now(), aciklama, tutar: parseFloat(tutar), kategori, tarih };
        setGiderler(prevGiderler => [...prevGiderler, yeniGider]);
        toast.success('Gider başarıyla eklendi!');
        const ilgiliButce = butceler.find(b => b.kategori === kategori);
        if (ilgiliButce) {
          const mevcutHarcama = giderler.filter(g => new Date(g.tarih).getFullYear() === new Date(tarih).getFullYear() && new Date(g.tarih).getMonth() + 1 === new Date(tarih).getMonth() + 1 && g.kategori === kategori).reduce((toplam, g) => toplam + g.tutar, 0);
          const yeniToplamHarcama = mevcutHarcama + parseFloat(tutar);
          const butceYuzdesi = (yeniToplamHarcama / ilgiliButce.limit) * 100;
          if (butceYuzdesi > 100) { toast.error(`'${kategori}' bütçesini aştınız!`, { duration: 4000 }); }
          else if (butceYuzdesi >= 90) { toast(`'${kategori}' bütçenizin %90'ını doldurdunuz!`, { icon: '⚠️', duration: 4000 }); }
        }
      }
      handleGiderVazgec();
    } else {
      if (!gelirAciklama || !gelirTutar || !gelirKategori) return;
      if (gelirDuzenlemeModu) { setGelirler(gelirler.map(g => g.id === duzenlenecekGelirId ? { ...g, aciklama: gelirAciklama, tutar: parseFloat(gelirTutar), kategori: gelirKategori, tarih: gelirTarih } : g)); toast.success('Gelir başarıyla güncellendi!'); }
      else { setGelirler([...gelirler, { id: Date.now(), aciklama: gelirAciklama, tutar: parseFloat(gelirTutar), kategori: gelirKategori, tarih: gelirTarih }]); toast.success('Gelir başarıyla eklendi!'); }
      handleGelirVazgec();
    }
  };

  const handleGiderDuzenleBaslat = (gider) => { setAktifIslemTipi('gider'); setGiderDuzenlemeModu(true); setDuzenlenecekGiderId(gider.id); setAciklama(gider.aciklama); setTutar(gider.tutar); setKategori(gider.kategori); setTarih(gider.tarih); };
  const handleGiderSil = (id) => { setItemToDelete({ id: id, type: 'gider' }); setIsModalOpen(true); };
  const handleGiderVazgec = () => { setGiderDuzenlemeModu(false); setDuzenlenecekGiderId(null); setAciklama(''); setTutar(''); setKategori(giderKategorileri[0]); setTarih(getBugununTarihi()); };
  const handleGelirDuzenleBaslat = (gelir) => { setAktifIslemTipi('gelir'); setGelirDuzenlemeModu(true); setDuzenlenecekGelirId(gelir.id); setGelirAciklama(gelir.aciklama); setGelirTutar(gelir.tutar); setGelirKategori(gelir.kategori); setGelirTarih(gelir.tarih); };
  const handleGelirSil = (id) => { setItemToDelete({ id: id, type: 'gelir' }); setIsModalOpen(true); };
  const handleGelirVazgec = () => { setGelirDuzenlemeModu(false); setDuzenlenecekGelirId(null); setGelirAciklama(''); setGelirTutar(''); setGelirKategori(gelirKategorileri[0]); setGelirTarih(getBugununTarihi()); };
  const handleCloseModal = () => { setIsModalOpen(false); setItemToDelete(null); };
  const handleConfirmDelete = () => { if (!itemToDelete) return; if (itemToDelete.type === 'gider') { setGiderler(giderler.filter(g => g.id !== itemToDelete.id)); toast.error('Gider silindi.'); } else if (itemToDelete.type === 'gelir') { setGelirler(gelirler.filter(g => g.id !== itemToDelete.id)); toast.error('Gelir silindi.'); } handleCloseModal(); };
  const handleSabitOdemeEkle = (yeniOdeme) => { setSabitOdemeler(prev => [...prev, { id: Date.now(), ...yeniOdeme }]); toast.success('Sabit ödeme başarıyla eklendi!'); };
  const handleSabitOdemeSil = (id) => { setSabitOdemeler(sabitOdemeler.filter(odeme => odeme.id !== id)); toast.error('Sabit ödeme silindi.'); };
  const handleAbonelikOnayla = (abonelik) => { const odemeTarihiStr = `${seciliYil}-${String(seciliAy).padStart(2, '0')}-${String(abonelik.odemeGunu).padStart(2, '0')}`; const yeniGider = { id: Date.now() + Math.random(), aciklama: abonelik.aciklama, tutar: abonelik.tutar, kategori: abonelik.kategori, tarih: odemeTarihiStr, otomatikMi: true, kaynakId: abonelik.id }; setGiderler(prevGiderler => [...prevGiderler, yeniGider]); toast.success(`'${abonelik.aciklama}' ödemesi giderlere eklendi!`); };
  const handleKategoriEkle = (tip, yeniKategori) => { if (tip === 'gider') { if (!giderKategorileri.includes(yeniKategori) && yeniKategori) { setGiderKategorileri(prev => [...prev, yeniKategori]); toast.success("Gider kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } else { if (!gelirKategorileri.includes(yeniKategori) && yeniKategori) { setGelirKategorileri(prev => [...prev, yeniKategori]); toast.success("Gelir kategorisi eklendi!"); } else { toast.error("Bu kategori zaten mevcut veya geçersiz."); } } };
  const handleKategoriSil = (tip, kategori) => { if (tip === 'gider') { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGiderKategorileri(giderKategorileri.filter(k => k !== kategori)); toast.error("Gider kategorisi silindi."); } else { if (kategori === 'Diğer') { toast.error("'Diğer' kategorisi silinemez."); return; } setGelirKategorileri(gelirKategorileri.filter(k => k !== kategori)); toast.error("Gelir kategorisi silindi."); } };
  const handleButceEkle = (yeniButce) => { const mevcutButce = butceler.find(b => b.kategori === yeniButce.kategori); if (mevcutButce) { setButceler(butceler.map(b => b.kategori === yeniButce.kategori ? yeniButce : b)); toast.success(`'${yeniButce.kategori}' bütçesi güncellendi!`); } else { setButceler(prev => [...prev, yeniButce]); toast.success(`'${yeniButce.kategori}' için yeni bütçe oluşturuldu!`); } };
  const handleButceSil = (kategori) => { setButceler(butceler.filter(b => b.kategori !== kategori)); toast.error(`'${kategori}' bütçesi silindi.`); };
  const handleVeriIndir = () => { const indirilecekVeri = [...filtrelenmisGelirler.map(gelir => ({ ...gelir, tip: 'Gelir' })), ...filtrelenmisGiderler.map(gider => ({ ...gider, tip: 'Gider' }))].sort((a, b) => new Date(a.tarih) - new Date(b.tarih)); if (indirilecekVeri.length === 0) { toast.error('İndirilecek veri bulunmuyor.'); return; } const basliklar = ['Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar']; const csvRows = [basliklar.join(';')]; indirilecekVeri.forEach(islem => { const row = [new Date(islem.tarih).toLocaleDateString('tr-TR'), islem.tip, islem.kategori, `"${islem.aciklama.replace(/"/g, '""')}"`, islem.tutar.toFixed(2).replace('.', ',')]; csvRows.push(row.join(';')); }); const csvString = csvRows.join('\r\n'); const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.setAttribute('href', url); link.setAttribute('download', `bütçe_raporu_${seciliAy}_${seciliYil}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); toast.success('Rapor başarıyla indirildi!'); };

  const filtrelenmisGelirler = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
  const filtrelenmisGiderler = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === seciliAy);
  const butceDurumlari = butceler.map(butce => { const harcanan = filtrelenmisGiderler.filter(gider => gider.kategori === butce.kategori).reduce((toplam, gider) => toplam + gider.tutar, 0); const kalan = butce.limit - harcanan; const yuzdeRaw = butce.limit > 0 ? (harcanan / butce.limit) * 100 : 0; const yuzde = Math.min(yuzdeRaw, 100); let durum = 'normal'; if (yuzdeRaw > 100) { durum = 'asildi'; } else if (yuzdeRaw >= 90) { durum = 'uyari'; } return { ...butce, harcanan, kalan, yuzde, durum }; }).sort((a,b) => b.yuzde - a.yuzde);
  const tumIslemler = [...gelirler, ...giderler];
  const mevcutYillar = [...new Set(tumIslemler.map(islem => new Date(islem.tarih).getFullYear()))].sort((a,b) => b-a);
  const toplamGelir = filtrelenmisGelirler.reduce((t, g) => t + g.tutar, 0);
  const toplamGider = filtrelenmisGiderler.reduce((t, g) => t + g.tutar, 0);
  const bakiye = toplamGelir - toplamGider;
  const sortFunction = (kriter) => (a, b) => { switch (kriter) { case 'tutar-artan': return a.tutar - b.tutar; case 'tutar-azalan': return b.tutar - a.tutar; case 'tarih-eski': return new Date(a.tarih) - new Date(b.tarih); default: return new Date(b.tarih) - new Date(a.tarih); } };
  const goruntulenecekGiderler = filtrelenmisGiderler.filter(g => giderFiltreKategori === 'Tümü' || g.kategori === giderFiltreKategori).sort(sortFunction(giderSiralamaKriteri));
  const goruntulenecekGelirler = filtrelenmisGelirler.filter(g => gelirFiltreKategori === 'Tümü' || g.kategori === gelirFiltreKategori).sort(sortFunction(gelirSiralamaKriteri));
  const birlesikIslemler = [...filtrelenmisGelirler.map(gelir => ({ ...gelir, tip: 'gelir' })),...filtrelenmisGiderler.map(gider => ({ ...gider, tip: 'gider' }))].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
  const kategoriOzeti = filtrelenmisGiderler.reduce((acc, gider) => { const { kategori, tutar } = gider; if (!acc[kategori]) { acc[kategori] = 0; } acc[kategori] += tutar; return acc; }, {});
  const grafikVerisi = { labels: Object.keys(kategoriOzeti), datasets: [{ label: 'Harcama Miktarı', data: Object.values(kategoriOzeti), backgroundColor: ['rgba(255, 99, 132, 0.7)','rgba(54, 162, 235, 0.7)','rgba(255, 206, 86, 0.7)','rgba(75, 192, 192, 0.7)','rgba(153, 102, 255, 0.7)','rgba(255, 159, 64, 0.7)', '#8e44ad', '#34495e'], borderColor: ['#fff'], borderWidth: 1,},],};
  const gelirKategoriOzeti = filtrelenmisGelirler.reduce((acc, gelir) => { const { kategori, tutar } = gelir; if (!acc[kategori]) { acc[kategori] = 0; } acc[kategori] += tutar; return acc; }, {});
  const gelirGrafikVerisi = { labels: Object.keys(gelirKategoriOzeti), datasets: [{ label: 'Gelir Miktarı', data: Object.values(gelirKategoriOzeti), backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(110, 214, 123, 0.7)', 'rgba(46, 204, 113, 0.7)', 'rgba(39, 174, 96, 0.7)'], borderColor: ['rgba(75, 192, 192, 1)', 'rgba(110, 214, 123, 1)', 'rgba(46, 204, 113, 1)', 'rgba(39, 174, 96, 1)'], borderWidth: 1, },], };
  const trendVerisi = { labels: [], gelirler: [], giderler: [], };
  const yillikRaporVerisi = { aylar: [], toplamGelir: 0, toplamGider: 0, toplamBakiye: 0 };
  for (let i = 1; i <= 12; i++) { const aylikGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i).reduce((toplam, g) => toplam + g.tutar, 0); const aylikGider = giderler.filter(g => new Date(g.tarih).getFullYear() === seciliYil && new Date(g.tarih).getMonth() + 1 === i).reduce((toplam, g) => toplam + g.tutar, 0); if (aylikGelir > 0 || aylikGider > 0) { yillikRaporVerisi.aylar.push({ ay: new Date(seciliYil, i - 1, 1).toLocaleString('tr-TR', { month: 'long' }), gelir: aylikGelir, gider: aylikGider, bakiye: aylikGelir - aylikGider }); } yillikRaporVerisi.toplamGelir += aylikGelir; yillikRaporVerisi.toplamGider += aylikGider; }
  yillikRaporVerisi.toplamBakiye = yillikRaporVerisi.toplamGelir - yillikRaporVerisi.toplamGider;
  for (let i = 5; i >= 0; i--) { const tarih = new Date(seciliYil, seciliAy - 1, 1); tarih.setMonth(tarih.getMonth() - i); const ay = tarih.getMonth() + 1; const yil = tarih.getFullYear(); const oAykiGelir = gelirler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((toplam, g) => toplam + g.tutar, 0); const oAykiGider = giderler.filter(g => new Date(g.tarih).getFullYear() === yil && new Date(g.tarih).getMonth() + 1 === ay).reduce((toplam, g) => toplam + g.tutar, 0); trendVerisi.labels.push(`${tarih.toLocaleString('tr-TR', { month: 'long' })}`); trendVerisi.gelirler.push(oAykiGelir); trendVerisi.giderler.push(oAykiGider); }

  return (
    <Router>
      <div className="app-container">
        <Toaster position="bottom-center" reverseOrder={false} toastOptions={{ style: { background: '#363636', color: '#fff', borderRadius: '8px', boxShadow: '0 3px 6px rgba(0,0,0,0.16)', }, success: { iconTheme: { primary: '#4ade80', secondary: '#fff', }, }, error: { iconTheme: { primary: '#f87171', secondary: '#fff', }, },}} />
        <h1>Gelir - Gider Takip</h1>
        <nav className="nav-menu">
            <NavLink to="/">Genel Bakış</NavLink>
            <NavLink to="/islemler">İşlemler</NavLink>
            <NavLink to="/raporlar">Raporlar</NavLink>
            <NavLink to="/sabit-odemeler">Sabit Ödemeler</NavLink>
            <NavLink to="/butceler">Bütçeler</NavLink>
            <NavLink to="/ayarlar">Ayarlar</NavLink>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<GenelBakis seciliYil={seciliYil} setSeciliYil={setSeciliYil} seciliAy={seciliAy} setSeciliAy={setSeciliAy} mevcutYillar={mevcutYillar} toplamGelir={toplamGelir} toplamGider={toplamGider} bakiye={bakiye} filtrelenmisGiderler={filtrelenmisGiderler} filtrelenmisGelirler={filtrelenmisGelirler} kategoriOzeti={kategoriOzeti} grafikVerisi={grafikVerisi} setGiderFiltreKategori={setGiderFiltreKategori} trendVerisi={trendVerisi} onayBekleyenAbonelikler={onayBekleyenAbonelikler} handleAbonelikOnayla={handleAbonelikOnayla} butceDurumlari={butceDurumlari} gelirGrafikVerisi={gelirGrafikVerisi} />} />
            <Route path="/islemler" element={
              <Islemler 
                aktifIslemTipi={aktifIslemTipi}
                setAktifIslemTipi={setAktifIslemTipi}
                handleSubmit={handleSubmit}
                gelirDuzenlemeModu={gelirDuzenlemeModu} gelirKategori={gelirKategori} setGelirKategori={setGelirKategori} gelirKategorileri={gelirKategorileri} gelirAciklama={gelirAciklama} setGelirAciklama={setGelirAciklama} gelirTarih={gelirTarih} setGelirTarih={setGelirTarih} gelirTutar={gelirTutar} setGelirTutar={setGelirTutar} handleGelirVazgec={handleGelirVazgec}
                birlesikIslemler={birlesikIslemler} 
                handleGelirDuzenleBaslat={handleGelirDuzenleBaslat} 
                handleGelirSil={handleGelirSil}
                giderDuzenlemeModu={giderDuzenlemeModu} kategori={kategori} setKategori={setKategori} giderKategorileri={giderKategorileri} aciklama={aciklama} setAciklama={setAciklama} tarih={tarih} setTarih={setTarih} tutar={tutar} setTutar={setTutar} handleGiderVazgec={handleGiderVazgec}
                handleGiderDuzenleBaslat={handleGiderDuzenleBaslat} 
                handleGiderSil={handleGiderSil}
              />} 
            />
            <Route path="/raporlar" element={<Raporlar trendVerisi={trendVerisi} yillikRaporVerisi={yillikRaporVerisi} seciliYil={seciliYil} handleVeriIndir={handleVeriIndir} />} />
            <Route path="/sabit-odemeler" element={<SabitOdemeler sabitOdemeler={sabitOdemeler} handleSabitOdemeEkle={handleSabitOdemeEkle} handleSabitOdemeSil={handleSabitOdemeSil} giderKategorileri={giderKategorileri} />} />
            <Route path="/butceler" element={
              <Butceler 
                giderKategorileri={giderKategorileri}
                butceler={butceler}
                handleButceEkle={handleButceEkle}
                handleButceSil={handleButceSil}
              />} 
            />
            <Route path="/ayarlar" element={
              <Ayarlar 
                giderKategorileri={giderKategorileri}
                gelirKategorileri={gelirKategorileri}
                handleKategoriEkle={handleKategoriEkle}
                handleKategoriSil={handleKategoriSil}
              />} 
            />
          </Routes>
        </main>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmDelete} title="İşlemi Sil"><p>Bu işlemi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p></Modal>
    </Router>
  );
}

export default App;