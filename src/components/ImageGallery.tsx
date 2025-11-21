import { useState } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: string[];
  onDelete?: (index: number) => Promise<void>;
  readOnly?: boolean;
}

export default function ImageGallery({ images, onDelete, readOnly = false }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery-empty">
        <p>No hay imágenes disponibles</p>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  const handleDelete = async (imageIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onDelete || readOnly) {
      return;
    }

    const imageLabel = images[imageIndex] || '';
    if (!confirm(`¿Eliminar esta imagen?\n${imageLabel}`)) {
      return;
    }

    try {
      setDeletingIndex(imageIndex);
      await onDelete(imageIndex);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedIndex(nextIndex);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedIndex(prevIndex);
  };

  const currentImageUrl =
    selectedIndex !== null ? getImageUrl(images[selectedIndex]) : null;

  return (
    <>
      <div className="image-gallery">
        {images.map((imagePath, index) => {
          const imageUrl = getImageUrl(imagePath);
          const isDeleting = deletingIndex === index;

          return (
            <div key={`${imagePath}-${index}`} className="gallery-item">
              <div
                className="gallery-image-container"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={imageUrl}
                  alt={`Imagen ${index + 1}`}
                  className="gallery-image"
                  loading="lazy"
                />
                {isDeleting && (
                  <div className="gallery-overlay deleting">
                    <div className="loading-spinner">Eliminando...</div>
                  </div>
                )}
                {!readOnly && onDelete && !isDeleting && (
                  <div className="gallery-overlay">
                    <button
                      className="btn-delete-image"
                      onClick={(e) => handleDelete(index, e)}
                      title="Eliminar imagen"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedIndex !== null && currentImageUrl && (
        <div className="lightbox" onClick={handleCloseLightbox}>
          <button className="lightbox-close" onClick={handleCloseLightbox}>
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button className="lightbox-nav lightbox-prev" onClick={handlePrev}>
                ‹
              </button>
              <button className="lightbox-nav lightbox-next" onClick={handleNext}>
                ›
              </button>
            </>
          )}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImageUrl}
              alt="Imagen ampliada"
              className="lightbox-image"
            />
            <div className="lightbox-info">
              <span>
                {selectedIndex + 1} de {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

