// src/components/SayfaBasligi.jsx
import './SayfaBasligi.css';

const SayfaBasligi = ({ title }) => {
  return (
    <header className="sayfa-basligi-header">
      <h1>{title}</h1>
    </header>
  );
};
export default SayfaBasligi;