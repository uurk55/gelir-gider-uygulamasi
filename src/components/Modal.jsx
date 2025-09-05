// src/components/Modal.jsx (PORTAL VE CONTEXT KULLANAN NİHAİ VERSİYON)

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFinans } from '../context/FinansContext';
import './Modal.css'; // Stil dosyasını import ediyoruz

// Portalın bağlanacağı DOM elemanını seçiyoruz
// Bu kod, dosya ilk okunduğunda sadece bir kez çalışır.
const modalRoot = document.getElementById('modal-portal');

function Modal({ title, children }) {
    // State ve fonksiyonları doğrudan Context'ten alıyoruz.
    // Bu yapı çok daha temiz, aynen koruyoruz.
    const { isModalOpen, handleCloseModal, handleConfirmDelete } = useFinans();
    
    // Portal'ın güvenli çalışması için bu state gerekli.
    const [isBrowser, setIsBrowser] = useState(false);

    useEffect(() => {
        setIsBrowser(true);
    }, []);

    // Eğer modal kapalıysa veya henüz tarayıcıda değilsek, hiçbir şey gösterme
    if (!isModalOpen || !isBrowser) {
        return null;
    }

    // createPortal ile modal içeriğini #modal-portal div'ine ışınlıyoruz.
    // CSS stillerimizle uyumlu olması için class isimlerini .modal-overlay, .confirm-btn vb. olarak güncelledim.
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