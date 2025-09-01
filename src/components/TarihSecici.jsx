// src/components/TarihSecici.jsx
import { useFinans } from '../context/FinansContext';

function TarihSecici() {
  const { seciliAy, setSeciliAy, seciliYil, setSeciliYil, mevcutYillar } = useFinans();

  const handleAyDegistir = (artis) => {
     let yeniAy = seciliAy + artis;
     let yeniYil = seciliYil;

     if (yeniAy > 12) {
         yeniAy = 1;
         yeniYil++;
     } else if (yeniAy < 1) {
         yeniAy = 12;
         yeniYil--;
     }
     setSeciliAy(yeniAy);
     setSeciliYil(yeniYil);
  };
  const aylar = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' },
  ];

  return (
    <div className="zaman-filtresi-kutusu">
      <button onClick={() => handleAyDegistir(-1)} className="tarih-yon-btn">{"<"}</button>
      <div className="kontrol-grubu">
        <label>Ay:</label>
        <select value={seciliAy} onChange={(e) => setSeciliAy(parseInt(e.target.value))}>
          {aylar.map((ay) => (
            <option key={ay.value} value={ay.value}>{ay.label}</option>
          ))}
        </select>
      </div>
      <div className="kontrol-grubu">
        <label>Yıl:</label>
        <select value={seciliYil} onChange={(e) => setSeciliYil(parseInt(e.target.value))}>
          {mevcutYillar.map((yil) => (
            <option key={yil} value={yil}>{yil}</option>
          ))}
        </select>
      </div>
       <button onClick={() => handleAyDegistir(1)} className="tarih-yon-btn">{">"}</button>
    </div>
  );
}

export default TarihSecici;