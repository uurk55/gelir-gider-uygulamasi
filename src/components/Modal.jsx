// src/components/Modal.jsx (NİHAİ VE DOĞRU VERSİYON)

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinans } from '../context/FinansContext';
import './Modal.css';

const modalRoot = document.getElementById('modal-portal');

function Modal({ title, children }) {
    const { isModalOpen, handleCloseModal, handleConfirmDelete } = useFinans();
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    if (!isModalOpen || !isBrowser) {
        return null;
    }

    return createPortal(
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <div className="modal-body">
                  {children}
                </div>
                <div className="modal-actions">
                    <button onClick={handleCloseModal} className="cancel-btn">Vazgeç</button>
                    <button onClick={handleConfirmDelete} className="confirm-btn">Onayla ve Sil</button>
                </div>
            </div>
        </div>,
        modalRoot
    );
}

export default Modal;