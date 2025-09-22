import './SayfaKontrolPaneli.css';

const SayfaKontrolPaneli = ({ children, actions }) => {
  return (
    <div className="kontrol-paneli">
      <nav className="panel-nav">
        {children}
      </nav>
      <div className="panel-actions">
        {actions}
      </div>
    </div>
  );
};

export default SayfaKontrolPaneli;