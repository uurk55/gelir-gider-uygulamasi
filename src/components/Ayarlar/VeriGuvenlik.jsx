// src/components/Ayarlar/VeriGuvenlik.jsx (YENİ HALİ)

import { useState } from 'react'; // useState import edildi
import { useAuth } from '../../context/AuthContext';
import { useFinans } from '../../context/FinansContext'; // FinansContext import edildi
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx'; // <<--- PapaParse yerine XLSX import edildi
import AyarKarti from './AyarKarti';
import { FaExclamationTriangle, FaUpload, FaDownload } from 'react-icons/fa';

const VeriGuvenlik = () => {
    const { deleteAccount } = useAuth();
    const { handleVeriIçeAktar, handleDownloadExcelTemplate } = useFinans();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleHesapSil = () => {
        if(window.confirm("Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            deleteAccount().catch(err => toast.error(err.message));
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading('Excel dosyası okunuyor...');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' }); // Dosyayı oku
                const sheetName = workbook.SheetNames[0]; // İlk sayfayı al
                const worksheet = workbook.Sheets[sheetName];
                // Sayfadaki veriyi JSON formatına çevir (başlıkları otomatik alır)
                const jsonData = XLSX.utils.sheet_to_json(worksheet); 

                if (jsonData.length === 0) {
                    toast.error('Excel dosyasında içe aktarılacak veri bulunamadı.', { id: toastId });
                    setIsProcessing(false);
                    return;
                }

                // Verileri işlemeye gönder
                toast.loading('Veriler işleniyor, lütfen bekleyin...', { id: toastId });
                handleVeriIçeAktar(jsonData, toastId); // jsonData'yı gönderiyoruz
                setIsProcessing(false);

            } catch (error) {
                console.error("Excel okuma hatası:", error);
                toast.error('Excel dosyası okunurken bir hata oluştu. Dosya formatı bozuk olabilir.', { id: toastId });
                setIsProcessing(false);
            }
        };
        reader.onerror = (error) => {
            console.error("FileReader hatası:", error);
            toast.error('Dosya okunamadı.', { id: toastId });
            setIsProcessing(false);
        };
        // Dosyayı 'binary string' olarak oku (xlsx kütüphanesi için gerekli)
        reader.readAsBinaryString(file);

        event.target.value = null;
    };

    // Şablon indirme butonu artık handleDownloadExcelTemplate fonksiyonunu çağıracak
    // handleDownloadTemplate fonksiyonunu SİLİN.

    return (
        <>
            <AyarKarti
                title="Veri Yönetimi"
                description="Uygulama verilerinizi Excel (.xlsx) formatında içe aktarın."
            >
                <div className="ayar-bolumu">
                    <h4>Verileri İçe Aktar (.xlsx)</h4>
                    <p>
                        Banka ekstrelerinizden veya başka bir uygulamadan aldığınız verileri uygulamaya toplu olarak ekleyin.
                        Doğru format için örnek şablonu kullanabilirsiniz.
                    </p>
                    <div className="veri-yonetim-aksiyonlar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label htmlFor="excel-upload" className={`primary-btn ${isProcessing ? 'disabled' : ''}`}>
                            <FaUpload style={{ marginRight: '8px' }} />
                            {isProcessing ? 'İşleniyor...' : 'Excel Dosyası Yükle'}
                        </label>
                        <input
                            type="file"
                            id="excel-upload"
                            // Sadece Excel dosyalarını kabul et
                            accept=".xlsx, .xls" 
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            disabled={isProcessing}
                        />
                        {/* Buton artık handleDownloadExcelTemplate'i çağırıyor */}
                        <button onClick={handleDownloadExcelTemplate} className="secondary-btn-small">
                           <FaDownload style={{ marginRight: '8px' }} /> Şablonu İndir (.xlsx)
                        </button>
                    </div>
                </div>
            </AyarKarti>

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
        </>
    );
};

export default VeriGuvenlik;