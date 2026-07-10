import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Tips from './components/Tips';
import Cazadores from './components/Cazadores';
import Resources from './components/Resources';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import MascotasPanel from './components/MascotasPanel';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

const IMAGES = [
  { src: "img/2.jpg", alt: "Beagle jugando al aire libre", caption: "Feliz en el parque" },
  { src: "img/3.jpg", alt: "Cachorro beagle descansando", caption: "Hora de la siesta" },
  { src: "img/4.jpg", alt: "Beagle explorando la naturaleza", caption: "Día de exploración" },
  { src: "img/5.jpg", alt: "Beagle posando alegremente", caption: "Mirada curiosa" },
  { src: "img/6.jpg", alt: "Beagle divirtiéndose", caption: "Jugando feliz" },
  { src: "img/7.jpg", alt: "Beagle orejas largas", caption: "Compañero leal" }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('inicio');
  const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0 });
  const [toasts, setToasts] = useState([]);

  // Toast notifications trigger function
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, removing: false }]);

    // Fade out after 4 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
      );
    }, 4000);

    // Completely remove from state after transition is done (4.3s total)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4300);
  };

  // Lightbox controllers
  const handleOpenLightbox = (index) => {
    setLightbox({ isOpen: true, currentIndex: index });
  };

  const handleCloseLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const handlePrevImage = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + IMAGES.length) % IMAGES.length,
    }));
  };

  const handleNextImage = () => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % IMAGES.length,
    }));
  };

  return (
    <>
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main>
        {currentTab === 'inicio' && (
          <div className="fade-in">
            <Hero />
            
            <section className="content-section dashboard-intro">
              <h2>Comunidad Beagle & Sabuesos 🐾</h2>
              <p className="dashboard-lead">
                Bienvenido al rincón oficial para entusiastas de los Beagles y los mejores perros de rastro del mundo. 
                Navega a través de nuestras pestañas superiores para descubrir datos educativos, explorar razas cazadoras 
                conectadas a nuestra API en tiempo real o administrar tus propias mascotas.
              </p>
              
              <div className="features-dashboard-grid">
                <div className="feature-card-dash" onClick={() => setCurrentTab('sobre')}>
                  <div className="dash-icon-circle">📖</div>
                  <h3>Guía del Beagle</h3>
                  <p>Descubre el origen, comportamiento y los mejores consejos de alimentación y salud para tu compañero.</p>
                  <span className="dash-card-link">Leer guía →</span>
                </div>
                
                <div className="feature-card-dash" onClick={() => setCurrentTab('cazadores')}>
                  <div className="dash-icon-circle">🐕</div>
                  <h3>Razas Sabuesas</h3>
                  <p>Explora un listado interactivo de razas de sabueso recuperado dinámicamente desde nuestra API en la nube.</p>
                  <span className="dash-card-link">Ver catálogo →</span>
                </div>
                
                <div className="feature-card-dash" onClick={() => setCurrentTab('mascotas')}>
                  <div className="dash-icon-circle">🩺</div>
                  <h3>Expediente Canino</h3>
                  <p>Lleva un registro clínico completo de tus perros. Registra vacunas, desparasitaciones y consultas médicas.</p>
                  <span className="dash-card-link">Administrar mascotas →</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'sobre' && (
          <div className="fade-in">
            <About />
            <Tips />
          </div>
        )}

        {currentTab === 'cazadores' && (
          <div className="fade-in">
            <Cazadores />
          </div>
        )}

        {currentTab === 'recursos' && (
          <div className="fade-in">
            <Resources />
            <Gallery images={IMAGES} onImageClick={handleOpenLightbox} />
          </div>
        )}

        {currentTab === 'mascotas' && (
          <div className="fade-in">
            <MascotasPanel />
          </div>
        )}
      </main>

      <Footer />

      <Lightbox 
        isOpen={lightbox.isOpen}
        images={IMAGES}
        currentIndex={lightbox.currentIndex}
        onClose={handleCloseLightbox}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}
