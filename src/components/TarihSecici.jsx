// src/components/TarihSecici.jsx
import { useFinans } from "../context/FinansContext";

function TarihSecici() {
  const { seciliAy, setSeciliAy, seciliYil, setSeciliYil, mevcutYillar } =
    useFinans();

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
    { value: 1, label: "Ocak" },
    { value: 2, label: "Şubat" },
    { value: 3, label: "Mart" },
    { value: 4, label: "Nisan" },
    { value: 5, label: "Mayıs" },
    { value: 6, label: "Haziran" },
    { value: 7, label: "Temmuz" },
    { value: 8, label: "Ağustos" },
    { value: 9, label: "Eylül" },
    { value: 10, label: "Ekim" },
    { value: 11, label: "Kasım" },
    { value: 12, label: "Aralık" },
  ];

  return (
    <div className="zaman-filtresi-kutusu tarih-secici-kapsul">
      <button
  type="button"
  onClick={() => handleAyDegistir(-1)}
  className="tarih-secici-arrow sol"
  aria-label="Önceki ay"
>
  &lt;
</button>

      <div className="tarih-secici-selectler">
        <select
          className="tarih-secici-select"
          value={seciliAy}
          onChange={(e) => setSeciliAy(parseInt(e.target.value))}
          aria-label="Ay seç"
        >
          {aylar.map((ay) => (
            <option key={ay.value} value={ay.value}>
              {ay.label}
            </option>
          ))}
        </select>

        <span className="tarih-secici-ayrac" />

        <select
          className="tarih-secici-select"
          value={seciliYil}
          onChange={(e) => setSeciliYil(parseInt(e.target.value))}
          aria-label="Yıl seç"
        >
          {mevcutYillar.map((yil) => (
            <option key={yil} value={yil}>
              {yil}
            </option>
          ))}
        </select>
      </div>

      <button
  type="button"
  onClick={() => handleAyDegistir(1)}
  className="tarih-secici-arrow sag"
  aria-label="Sonraki ay"
>
  &gt;
</button>
    </div>
  );
}

export default TarihSecici;
