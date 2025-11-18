// src/components/GenelBakis/AyYilSecici.jsx
import { memo } from "react";

const AY_ISIMLERI = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function AyYilSecici({
  seciliAy,
  setSeciliAy,
  seciliYil,
  setSeciliYil,
  mevcutYillar = [],
}) {
  const handleAyChange = (e) => {
    setSeciliAy(Number(e.target.value));
  };

  const handleYilChange = (e) => {
    setSeciliYil(Number(e.target.value));
  };

  const yillar = mevcutYillar.length
    ? mevcutYillar
    : [seciliYil - 1, seciliYil, seciliYil + 1];

  return (
    <div className="ay-yil-kapsul">
      <div className="secici-grup">
        <label>Ay</label>
        <select value={seciliAy} onChange={handleAyChange}>
          {AY_ISIMLERI.map((ad, idx) => (
            <option key={ad} value={idx + 1}>
              {ad}
            </option>
          ))}
        </select>
      </div>
      <div className="secici-grup">
        <label>Yıl</label>
        <select value={seciliYil} onChange={handleYilChange}>
          {yillar.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default memo(AyYilSecici);
