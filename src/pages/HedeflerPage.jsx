// src/pages/HedeflerPage.jsx (ÖZET PANOSU EKLENMİŞ NİHAİ VERSİYON)

import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaPlus, FaBullseye } from 'react-icons/fa';
import HedefEkleFormu from '../components/Hedefler/HedefEkleFormu'; 
import HedefKarti from '../components/Hedefler/HedefKarti';
import HedeflerOzetPanosu from '../components/Hedefler/HedeflerOzetPanosu'; // Yeni import
import { AnimatePresence } from 'framer-motion';

function HedeflerPage() {
    const { hedefler } = useFinans();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const devamEdenHedefler = hedefler ? hedefler.filter(h => h.mevcutTutar < h.hedefTutar) : [];
    const tamamlananHedefler = hedefler ? hedefler.filter(h => h.mevcutTutar >= h.hedefTutar) : [];

    return (
        <div className="hedefler-sayfasi-container"> 
            <div className="sayfa-baslik">
                <h1>Tasarruf Hedefleri</h1>
                <p>Hayallerinize ulaşmak için birikim hedefleri oluşturun ve ilerlemenizi takip edin.</p>
                <button onClick={() => setIsFormOpen(true)} className="primary-btn">
                    <FaPlus style={{ marginRight: '8px' }} /> Yeni Hedef Oluştur
                </button>
            </div>

            <AnimatePresence>
                {isFormOpen && <HedefEkleFormu onClose={() => setIsFormOpen(false)} />}
            </AnimatePresence>

            <HedeflerOzetPanosu /> 

            <div className="hedefler-icerik-alani">
                {(!hedefler || hedefler.length === 0) ? (
                    <div className="empty-state-container card">
                        <div className="empty-state-ikon"><FaBullseye /></div>
                        <h2>Henüz Bir Hedefiniz Yok</h2>
                        <p>İlk hedefinizi oluşturarak birikim yapmaya başlayın.</p>
                    </div>
                ) : (
                    <>
                        {devamEdenHedefler.length > 0 && (
                            <div className="hedef-bolumu">
                                <h2>Devam Eden Hedefler</h2>
                                <div className="hedefler-grid">
                                    {devamEdenHedefler.map(hedef => (
                                        <HedefKarti key={hedef.id} hedef={hedef} />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {tamamlananHedefler.length > 0 && (
                            <div className="hedef-bolumu">
                                <h2>Ulaşılan Hedefler</h2>
                                <div className="hedefler-grid">
                                    {tamamlananHedefler.map(hedef => (
                                        <HedefKarti key={hedef.id} hedef={hedef} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default HedeflerPage;