import React, { useEffect } from 'react';

export default function Lightbox({ isOpen, images, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scrolling when lightbox is open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  const currentImage = images[currentIndex] || { src: '', alt: '', caption: '' };

  const handleBackgroundClick = (e) => {
    // Check if the user clicked directly on the lightbox backdrop, not on its contents
    if (e.target.id === 'lightbox') {
      onClose();
    }
  };

  return (
    <div 
      id="lightbox" 
      className={`lightbox ${isOpen ? 'active' : ''}`} 
      role="dialog" 
      aria-modal="true"
      aria-hidden={!isOpen}
      onClick={handleBackgroundClick}
    >
      <button 
        className="lightbox-close" 
        onClick={onClose} 
        aria-label="Cerrar modal"
      >
        &times;
      </button>
      <button 
        className="lightbox-prev" 
        onClick={onPrev} 
        aria-label="Imagen anterior"
      >
        &#10094;
      </button>
      
      <div className="lightbox-content">
        <img 
          id="lightbox-img" 
          src={currentImage.src} 
          alt={currentImage.alt} 
        />
        <p className="lightbox-caption">{currentImage.caption}</p>
      </div>
      
      <button 
        className="lightbox-next" 
        onClick={onNext} 
        aria-label="Siguiente imagen"
      >
        &#10095;
      </button>
    </div>
  );
}
