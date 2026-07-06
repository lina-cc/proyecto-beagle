import React from 'react';

export default function Hero() {
  const handleScrollToContact = () => {
    const contactSection = document.getElementById('contacto');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="hero-section">
      <div className="hero-content">
        <h2>Bienvenidos</h2>
        <p>Un lugar para amantes de los Beagles. Descubre información, comparte fotos y conecta con otros dueños.</p>
        <button onClick={handleScrollToContact} className="btn">
          Únete a la comunidad
        </button>
      </div>
    </section>
  );
}
