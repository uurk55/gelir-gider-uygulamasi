import { useFinans } from '../context/FinansContext'; // YENİ: Context Hook'u içe aktar

function Modal({ title, children }) {
  // YENİ: Prop'lar yerine, ihtiyacımız olan state ve fonksiyonları Context'ten alıyoruz.
  const { isModalOpen, handleCloseModal, handleConfirmDelete } = useFinans();

  if (!isModalOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={handleCloseModal} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={handleCloseModal} className="modal-cancel-btn">Vazgeç</button>
          <button onClick={handleConfirmDelete} className="modal-confirm-btn">Onayla ve Sil</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;