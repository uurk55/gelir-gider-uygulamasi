import React from 'react';

const AyarKarti = ({ title, description, children }) => {
  return (
    <div className="ayar-karti">
      <header className="ayar-karti-header">
        {/* Başlık her zaman olacak */}
        <h2 className="ayar-karti-baslik">{title}</h2>
        {/* Açıklama varsa gösterilecek */}
        {description && <p className="ayar-karti-aciklama">{description}</p>}
      </header>
      <div className="ayar-karti-govde">
        {children}
      </div>
    </div>
  );
};

export default AyarKarti;