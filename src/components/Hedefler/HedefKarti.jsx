// src/components/Hedefler/HedefKarti.jsx (AKILLI BİLGİLER EKLENMİŞ HALİ)

import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPiggyBank, FaTrash, FaEdit, FaCalendarAlt, FaFlag } from 'react-icons/fa';
import HedefDuzenleFormu from './HedefDuzenleFormu';

// Para Ekleme Modal'ını da bu dosya içinde küçük bir bileşen olarak tanımlayabiliriz
function ParaEkleModal({ hedef, onClose }) {
    const { hesaplar, handleHedefeParaEkle } = useFinans();
    const [tutar, setTutar] = useState('');
    const [kaynakHesapId, setKaynakHesapId] = useState(hesaplar[0]?.id || '');
    const [hata, setHata] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const eklenecekTutar = parseFloat(tutar);
        if (!eklenecekTutar || eklenecekTutar <= 0 || !kaynakHesapId) {
            setHata("Lütfen geçerli bir tutar girin ve bir kaynak hesap seçin.");
            return;
        }
        handleHedefeParaEkle(hedef.id, kaynakHesapId, eklenecekTutar);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="modal-header">
                    <h2>{hedef.ad}</h2>
                    <p style={{ margin: 0 }}>Hedefinize Para Ekleyin</p>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    {hata && <p className="form-hata">{hata}</p>}
                    <div className="form-grup">
                        <label htmlFor="tutar">Eklenecek Tutar (₺)</label>
                        <input
                            type="number"
                            id="tutar"
                            value={tutar}
                            onChange={(e) => setTutar(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="form-grup">
                        <label htmlFor="kaynakHesap">Kaynak Hesap</label>
                        <select
                            id="kaynakHesap"
                            value={kaynakHesapId}
                            onChange={(e) => setKaynakHesapId(e.target.value)}
                            required
                        >
                            {hesaplar.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.ad}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-aksiyonlar">
                        <button type="button" onClick={onClose} className="secondary-btn">
                            İptal
                        </button>
                        <button type="submit" className="primary-btn">
                            Ekle
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function HedefKarti({ hedef }) {
    const { handleHedefSil } = useFinans();
    const [isParaEkleModalOpen, setIsParaEkleModalOpen] = useState(false);
    const [isDuzenleFormOpen, setIsDuzenleFormOpen] = useState(false);

    // oncelik alanını da aldım (isteğe bağlı)
    const { ad, hedefTutar, mevcutTutar = 0, hedefTarih, oncelik } = hedef;

    const ilerlemeYuzdesi = hedefTutar > 0 ? (mevcutTutar / hedefTutar) * 100 : 0;
    const tamamlandiMi = mevcutTutar >= hedefTutar;
    const kalanTutar = Math.max(hedefTutar - mevcutTutar, 0);

    // ✅ Kalan gün hesabı
    let kalanGun = null;
    if (hedefTarih) {
        const bugun = new Date();
        const hedefDate = new Date(hedefTarih);

        const msFark =
            hedefDate.setHours(0, 0, 0, 0) -
            bugun.setHours(0, 0, 0, 0);

        kalanGun = Math.ceil(msFark / (1000 * 60 * 60 * 24));
    }

    // ✅ Öncelik rozetinde kullanmak için normalleştirme
    const oncelikKey = oncelik ? oncelik.toString().toLowerCase() : null;

    const onSil = () => {
        if (window.confirm(`'${ad}' hedefini silmek istediğinizden emin misiniz?`)) {
            handleHedefSil(hedef.id);
        }
    };

    return (
        <>
            <motion.div
                className={`card hedef-karti ${tamamlandiMi ? 'tamamlandi' : ''}`}
                layout
            >
                <div className="hedef-karti-ust">
                    <h3 className="hedef-adi">{ad}</h3>
                    <div className="hedef-aksiyon-butonlari">
                        {!tamamlandiMi && (
                            <button
                                onClick={() => setIsDuzenleFormOpen(true)}
                                className="icon-btn"
                                aria-label="Hedefi Düzenle"
                            >
                                <FaEdit />
                            </button>
                        )}
                        <button
                            onClick={onSil}
                            className="icon-btn"
                            aria-label="Hedefi Sil"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>

                {tamamlandiMi ? (
                    <div className="hedef-tamamlandi-mesaji">
                        <FaPiggyBank />
                        <h4>Tebrikler, hedefinize ulaştınız!</h4>
                    </div>
                ) : (
                    <>
                        <div className="hedef-karti-icerik">
                            <div className="hedef-tutar-bilgisi">
                                <span className="mevcut">{formatCurrency(mevcutTutar)}</span>
                                <span className="hedef">
                                    / {formatCurrency(hedefTutar)}
                                </span>
                            </div>

                            <div className="progress-bar-container">
                                <motion.div
                                    className="progress-bar-dolu"
                                    initial={{ width: '0%' }}
                                    animate={{
                                        width: `${Math.min(ilerlemeYuzdesi, 100)}%`,
                                    }}
                                />
                            </div>

                            <div className="hedef-karti-alt-bilgi">
                                <span>%{ilerlemeYuzdesi.toFixed(1)}</span>
                                <span className="hedef-kalan-bilgi">
                                    Kalan: {formatCurrency(kalanTutar)}
                                </span>
                            </div>
                        </div>

                        {/* ✅ Ek akıllı bilgiler – rozet satırı */}
                        <div className="hedef-ek-bilgiler">
                            {kalanGun !== null && (
                                <span
                                    className={
                                        'hedef-etiket gun ' +
                                        (kalanGun < 0
                                            ? 'gecikmis'
                                            : kalanGun <= 7
                                            ? 'kritik'
                                            : '')
                                    }
                                >
                                    <FaCalendarAlt />
                                    {kalanGun < 0
                                        ? `${Math.abs(kalanGun)} gün gecikti`
                                        : kalanGun === 0
                                        ? 'Son gün!'
                                        : `${kalanGun} gün kaldı`}
                                </span>
                            )}

                            {oncelik && (
                                <span
                                    className={
                                        'hedef-etiket oncelik ' +
                                        (oncelikKey === 'yüksek' ||
                                        oncelikKey === 'yuksek'
                                            ? 'oncelik-yuksek'
                                            : oncelikKey === 'orta'
                                            ? 'oncelik-orta'
                                            : oncelikKey === 'düşük' ||
                                              oncelikKey === 'dusuk'
                                            ? 'oncelik-dusuk'
                                            : '')
                                    }
                                >
                                    <FaFlag />
                                    {oncelik}
                                </span>
                            )}

                            <span className="hedef-etiket kalan-tutar-etiket">
                                Kalan Tutar:{' '}
                                <strong>{formatCurrency(kalanTutar)}</strong>
                            </span>
                        </div>
                    </>
                )}

                {!tamamlandiMi && (
                    <div className="hedef-karti-aksiyonlar">
                        <button
                            onClick={() => setIsParaEkleModalOpen(true)}
                            className="primary-btn-small"
                        >
                            Para Ekle
                        </button>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {isParaEkleModalOpen && (
                    <ParaEkleModal
                        hedef={hedef}
                        onClose={() => setIsParaEkleModalOpen(false)}
                    />
                )}
                {isDuzenleFormOpen && (
                    <HedefDuzenleFormu
                        hedef={hedef}
                        onClose={() => setIsDuzenleFormOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default HedefKarti;
