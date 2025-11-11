import { useState } from 'react';
import { getImageUrl, getFilenameFromPath } from '../utils/imageUtils';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: string[];
  onDelete?: (filename: string) => Promise<void>;
  readOnly?: boolean;
}

export default function ImageGallery({ images, onDelete, readOnly = false }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery-empty">
        <p>No hay imágenes disponibles</p>
      </div>
    );
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseLightbox = () => {
    setSelectedImage(null);
  };

  const handleDelete = async (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onDelete || readOnly) {
      return;
    }

    const filename = getFilenameFromPath(imagePath);
    if (!confirm(`¿Estás seguro de que deseas eliminar esta imagen?`)) {
      return;
    }

    try {
      setDeleting(imagePath);
      await onDelete(filename);
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      alert('Error al eliminar la imagen');
    } finally {
      setDeleting(null);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = images.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = images.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  return (
    <>
      <div className="image-gallery">
        {images.map((imagePath, index) => {
          const imageUrl = getImageUrl(imagePath);
          const filename = getFilenameFromPath(imagePath);
          const isDeleting = deleting === imagePath;

          return (
            <div key={`${imagePath}-${index}`} className="gallery-item">
              <div
                className="gallery-image-container"
                onClick={() => handleImageClick(imagePath)}
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
                      onClick={(e) => handleDelete(imagePath, e)}
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

      {selectedImage && (
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
              src={getImageUrl(selectedImage)}
              alt="Imagen ampliada"
              className="lightbox-image"
            />
            <div className="lightbox-info">
              <span>
                {images.indexOf(selectedImage) + 1} de {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

