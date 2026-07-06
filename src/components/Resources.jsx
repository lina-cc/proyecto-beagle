import React from 'react';

export default function Resources() {
  return (
    <section id="recursos" className="content-section">
      <h2>Enlaces de Interés</h2>
      <div className="resources-grid">
        <div className="resource-card">
          <h3>Club Beagles Chile 🇨🇱</h3>
          <p>
            Sitio oficial de la comunidad del Club Beagles en Chile. 
            Encuentra eventos, consejos e información útil sobre la raza.
          </p>
          <a href="https://www.clubbeagleschile.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Visitar Club
          </a>
        </div>
        <div className="resource-card">
          <h3>Alimentación y Cuidados 🐾</h3>
          <p>
            Encuentra el mejor alimento y accesorios para mantener a tu Beagle saludable y feliz.
          </p>
          <a href="https://www.tusmascotas.cl/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Comprar Alimento
          </a>
        </div>
      </div>
    </section>
  );
}
