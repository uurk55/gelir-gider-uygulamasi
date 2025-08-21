// src/components/Modal.jsx

import React from 'react';

function Modal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) {
    return null; // Eğer modal açık değilse, hiçbir şey gösterme
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="vazgec-btn">Vazgeç</button>
          <button onClick={onConfirm} className="sil-btn">Onayla ve Sil</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;