import { useState } from 'react';
import { useFinans } from '../context/FinansContext';
import { FaTrash, FaGripVertical } from 'react-icons/fa'; // Taşıma ikonu eklendi

// DND Kit kütüphanesinden gerekli importlar
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Her bir sıralanabilir kategori elemanı için yeni bir bileşen
function SortableKategoriItem({ tip, kategori, handleSil }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: kategori });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} style={style} className="yonetim-listesi-item">
            <div className="kategori-sol-taraf-sirala">
                <span {...attributes} {...listeners} className="drag-handle">
                    <FaGripVertical />
                </span>
                <span>{kategori}</span>
            </div>
            {kategori !== 'Diğer' && (
                <button onClick={() => handleSil(tip, kategori)} className="icon-btn sil-btn" aria-label="Sil">
                    <FaTrash />
                </button>
            )}
        </li>
    );
}

function KategoriYonetimBolumu({ tip, baslik, kategoriler, handleEkle, handleSil, handleSirala }) {
    const [yeniKategori, setYeniKategori] = useState('');

    const onEkle = (e) => {
        e.preventDefault();
        if (!yeniKategori.trim()) return;
        handleEkle(tip, yeniKategori.trim());
        setYeniKategori('');
    };

    function handleDragEnd(event) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            handleSirala(tip, active.id, over.id);
        }
    }

    return (
        <div className="bolum">
            <h3>{baslik}</h3>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={kategoriler} strategy={verticalListSortingStrategy}>
                    <ul className="yonetim-listesi">
                        {kategoriler.map(kat => (
                           <SortableKategoriItem key={kat} tip={tip} kategori={kat} handleSil={handleSil} />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
            <form onSubmit={onEkle} className="form-modern">
                <div>
                    <label htmlFor={`yeni-kategori-${tip}`}>Yeni Kategori Ekle</label>
                    <input id={`yeni-kategori-${tip}`} type="text" value={yeniKategori} onChange={(e) => setYeniKategori(e.target.value)} placeholder="Yeni kategori adı..."/>
                </div>
                <button type="submit">Ekle</button>
            </form>
        </div>
    );
}

function Kategoriler() {
    const { giderKategorileri, gelirKategorileri, handleKategoriEkle, handleKategoriSil, handleKategoriSirala } = useFinans();

    if (!giderKategorileri || !gelirKategorileri) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="card">
            <h2>Kategorileri Yönet</h2>
            <div className="yonetim-sayfasi-layout">
                <KategoriYonetimBolumu
                    tip="gelir"
                    baslik="Gelir Kategorileri"
                    kategoriler={gelirKategorileri}
                    handleEkle={handleKategoriEkle}
                    handleSil={handleKategoriSil}
                    handleSirala={handleKategoriSirala}
                />
                <KategoriYonetimBolumu
                    tip="gider"
                    baslik="Gider Kategorileri"
                    kategoriler={giderKategorileri}
                    handleEkle={handleKategoriEkle}
                    handleSil={handleKategoriSil}
                    handleSirala={handleKategoriSirala}
                />
            </div>
        </div>
    );
}

export default Kategoriler;