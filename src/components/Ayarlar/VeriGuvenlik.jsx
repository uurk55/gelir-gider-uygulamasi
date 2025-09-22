import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AyarKarti from './AyarKarti';
import { FaExclamationTriangle } from 'react-icons/fa';

const VeriGuvenlik = () => {
    const { deleteAccount } = useAuth();
    const handleHesapSil = () => {
        if(window.confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            deleteAccount().catch(err => toast.error(err.message));
        }
    };
    return (
        <AyarKarti title="Veri & Güvenlik">
            <div className="ayar-bolumu tehlikeli-bolge">
                <div className='tehlike-baslik'>
                    <FaExclamationTriangle />
                    <h4>Hesabı Kalıcı Olarak Sil</h4>
                </div>
                <p>Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak yok edilir.</p>
                <button onClick={handleHesapSil} className="danger-btn">Hesabımı Sil</button>
            </div>
        </AyarKarti>
    );
};

export default VeriGuvenlik;