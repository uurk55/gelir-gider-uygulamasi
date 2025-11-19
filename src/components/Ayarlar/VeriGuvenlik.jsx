// src/components/Ayarlar/VeriGuvenlik.jsx

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinans } from '../../context/FinansContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import AyarKarti from './AyarKarti';
import { FaExclamationTriangle, FaUpload, FaDownload } from 'react-icons/fa';

const VeriGuvenlik = () => {
  const { deleteAccount } = useAuth();
  const { handleVeriIçeAktar, handleDownloadExcelTemplate } = useFinans();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleHesapSil = () => {
    if (
      window.confirm(
        'Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    ) {
      deleteAccount().catch((err) => toast.error(err.message));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const toastId = toast.loading('Excel dosyası okunuyor...');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;

        // Excel dosyasını oku
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Sayfayı JSON’a çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('Excel dosyasında içe aktarılacak veri bulunamadı.', {
            id: toastId,
          });
          setIsProcessing(false);
          return;
        }

        // Verileri FinansContext’e gönder
        toast.loading('Veriler işleniyor, lütfen bekleyin...', { id: toastId });
        handleVeriIçeAktar(jsonData, toastId);
        setIsProcessing(false);
      } catch (error) {
        console.error('Excel okuma hatası:', error);
        toast.error(
          'Excel dosyası okunurken bir hata oluştu. Dosya formatı bozuk olabilir.',
          { id: toastId }
        );
        setIsProcessing(false);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader hatası:', error);
      toast.error('Dosya okunamadı.', { id: toastId });
      setIsProcessing(false);
    };

    // XLSX için binary string okuma
    reader.readAsBinaryString(file);
    event.target.value = null;
  };

  return (
    <>
      {/* VERİ YÖNETİMİ KARTI */}
      <AyarKarti
        title="Veri Yönetimi"
        description="Uygulama verilerinizi Excel (.xlsx) formatında içe aktarabilir, şablon dosyayı indirebilirsiniz."
      >
        <div className="ayar-bolumu">
          <h4>Verileri İçe Aktar (.xlsx)</h4>
          <p>
            Banka ekstrelerinizden veya başka bir uygulamadan aldığınız
            verileri toplu şekilde ekleyin. Doğru format için örnek şablonu
            kullanmanız önerilir.
          </p>

          <div className="veri-yonetim-aksiyonlar">
            {/* ✅ ARTIK GÖRÜNEN EXCEL YÜKLE BUTONU */}
            <label
              htmlFor="excel-upload"
              className={`primary-btn excel-upload-btn ${
                isProcessing ? 'disabled' : ''
              }`}
            >
              <FaUpload />
              <span>{isProcessing ? 'İşleniyor...' : 'Excel Dosyası Yükle'}</span>
            </label>

            {/* Gizli input */}
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            {/* Şablon indir butonu */}
            <button
              type="button"
              onClick={handleDownloadExcelTemplate}
              className="secondary-btn-small"
            >
              <FaDownload style={{ marginRight: 8 }} />
              Şablonu İndir (.xlsx)
            </button>
          </div>
        </div>
      </AyarKarti>

      {/* HESAP SİLME KARTI */}
      <AyarKarti title="Veri & Güvenlik">
        <div className="ayar-bolumu tehlikeli-bolge">
          <div className="tehlike-baslik">
            <FaExclamationTriangle />
            <h4>Hesabı Kalıcı Olarak Sil</h4>
          </div>
          <p>
            Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm verileriniz
            kalıcı olarak yok edilir.
          </p>
          <button onClick={handleHesapSil} className="danger-btn">
            Hesabımı Sil
          </button>
        </div>
      </AyarKarti>
    </>
  );
};

export default VeriGuvenlik;
