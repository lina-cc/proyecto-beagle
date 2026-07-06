import React from 'react';

export default function Gallery({ images, onImageClick }) {
  return (
    <section id="galeria" className="content-section">
      <h2>Galería</h2>
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div key={index} className="gallery-item">
            <img 
              src={img.src} 
              alt={img.alt} 
              className="lightbox-trigger" 
              onClick={() => onImageClick(index)}
              style={{ cursor: 'pointer' }}
            />
            <p className="img-caption">{img.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
