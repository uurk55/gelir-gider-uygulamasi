// src/components/Ozellestir/KategorilerYonetimi.jsx

import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useFinans } from '../../context/FinansContext';
import { FaPlus, FaSave, FaTimes, FaTrash, FaEdit, FaBars } from 'react-icons/fa';

// Tek bir kategori satırı için "Sıralanabilir" bileşen
function SortableKategoriItem({ id, onSil, onGuncelle }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [isEditing, setIsEditing] = useState(false);
    const [kategoriAdi, setKategoriAdi] = useState(id);

    const handleGuncelle = () => {
        if (kategoriAdi.trim() !== id && kategoriAdi.trim() !== '') {
            onGuncelle(id, kategoriAdi);
        }
        setIsEditing(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="ozellestir-liste-item">
            <button {...attributes} {...listeners} className="drag-handle-btn"><FaBars /></button>
            {isEditing ? (
                 <input type="text" value={kategoriAdi} onChange={(e) => setKategoriAdi(e.target.value)} className="liste-item-input"/>
            ) : (
                <span>{id}</span>
            )}
            <div className="liste-item-aksiyonlar">
                {isEditing ? (
                    <>
                        <button onClick={handleGuncelle} className="icon-btn"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="icon-btn"><FaTimes /></button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="icon-btn"><FaEdit /></button>
                        <button onClick={() => onSil(id)} className="icon-btn danger"><FaTrash /></button>
                    </>
                )}
            </div>
        </div>
    );
}

// Tek bir kategori listesini (Gelir veya Gider) yöneten bileşen
function KategoriListesi({ tip, baslik, kategoriler, onEkle, onSil, onGuncelle, onSirala }) {
    const [yeniKategori, setYeniKategori] = useState('');

    const handleEkle = () => {
        if (yeniKategori.trim()) {
            onEkle(tip, yeniKategori);
            setYeniKategori('');
        }
    };
    
    const handleDragEnd = (event) => {
        const {active, over} = event;
        if (over && active.id !== over.id) {
            onSirala(tip, active.id, over.id);
        }
    }

    return (
        <div className="kategori-listesi-alani">
            <h3>{baslik}</h3>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={kategoriler} strategy={verticalListSortingStrategy}>
                    <div className="ozellestir-liste">
                        {kategoriler.map(kategori => (
                            <SortableKategoriItem 
                                key={kategori} 
                                id={kategori} 
                                onSil={(ad) => onSil(tip, ad)} 
                                onGuncelle={(eskiAd, yeniAd) => onGuncelle(tip, eskiAd, yeniAd)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="ozellestir-liste-item ekleme-formu">
                <input 
                    type="text" 
                    value={yeniKategori} 
                    onChange={(e) => setYeniKategori(e.target.value)} 
                    placeholder="Yeni kategori adı..."
                    className="liste-item-input"
                />
                <button onClick={handleEkle} className="ekle-btn-small"><FaPlus /> Ekle</button>
            </div>
        </div>
    );
}


// Ana Kategori Yönetim Bileşeni
function KategorilerYonetimi() {
    const { 
        gelirKategorileri, giderKategorileri, handleKategoriEkle, 
        handleKategoriSil, handleKategoriGuncelle, handleKategoriSirala 
    } = useFinans();

    return (
        <div className="yonetim-bolumu-grid kategori-yonetimi">
            <KategoriListesi 
                tip="gelir"
                baslik="Gelir Kategorileri"
                kategoriler={gelirKategorileri}
                onEkle={handleKategoriEkle}
                onSil={handleKategoriSil}
                onGuncelle={handleKategoriGuncelle}
                onSirala={handleKategoriSirala}
            />
            <KategoriListesi 
                tip="gider"
                baslik="Gider Kategorileri"
                kategoriler={giderKategorileri}
                onEkle={handleKategoriEkle}
                onSil={handleKategoriSil}
                onGuncelle={handleKategoriGuncelle}
                onSirala={handleKategoriSirala}
            />
        </div>
    );
}

export default KategorilerYonetimi;