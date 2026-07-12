import React, { useState, useEffect } from 'react';
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
import ContactForm from './components/ContactForm';
import CommunityBoard from './components/CommunityBoard';
import { supabase } from './supabaseClient';

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
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

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

  // Fetch messages from Supabase or localStorage
  useEffect(() => {
    const loadMessages = async () => {
      setLoadingMessages(true);
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('beagle_messages')
            .select('*')
            .order('id', { ascending: false });
          if (error) throw error;
          setMessages(data || []);
        } catch (err) {
          console.warn('Error fetching messages from Supabase, falling back to localStorage:', err);
          const localMsgs = localStorage.getItem('beagle_messages');
          setMessages(localMsgs ? JSON.parse(localMsgs) : []);
        }
      } else {
        const localMsgs = localStorage.getItem('beagle_messages');
        setMessages(localMsgs ? JSON.parse(localMsgs) : []);
      }
      setLoadingMessages(false);
    };

    if (currentTab === 'tablon' || currentTab === 'inicio') {
      loadMessages();
    }
  }, [currentTab]);

  // Join community from Hero
  const handleJoinCommunity = () => {
    setCurrentTab('tablon');
    setTimeout(() => {
      const element = document.getElementById('contact-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // CRUD handlers for community board
  const handleAddMessage = async (newMessage) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('beagle_messages')
          .insert([{
            id: newMessage.id,
            name: newMessage.name,
            date: newMessage.date,
            text: newMessage.text
          }]);
        if (error) throw error;
        setMessages((prev) => [newMessage, ...prev]);
        showToast("¡Mensaje publicado! 💬", "success");
      } catch (err) {
        console.error('Error insertando en Supabase, guardando local:', err);
        const updated = [newMessage, ...messages];
        setMessages(updated);
        localStorage.setItem('beagle_messages', JSON.stringify(updated));
        showToast("Mensaje guardado localmente.", "warning");
      }
    } else {
      const updated = [newMessage, ...messages];
      setMessages(updated);
      localStorage.setItem('beagle_messages', JSON.stringify(updated));
      showToast("¡Mensaje publicado! 🐾", "success");
    }
  };

  const handleUpdateMessage = async (id, newText) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('beagle_messages')
          .update({ text: newText })
          .eq('id', id);
        if (error) throw error;
        setMessages((prev) => prev.map((m) => m.id === id ? { ...m, text: newText } : m));
        showToast("¡Mensaje editado! ✏️", "success");
      } catch (err) {
        console.error('Error editando en Supabase:', err);
        const updated = messages.map((m) => m.id === id ? { ...m, text: newText } : m);
        setMessages(updated);
        localStorage.setItem('beagle_messages', JSON.stringify(updated));
        showToast("Mensaje editado localmente.", "warning");
      }
    } else {
      const updated = messages.map((m) => m.id === id ? { ...m, text: newText } : m);
      setMessages(updated);
      localStorage.setItem('beagle_messages', JSON.stringify(updated));
      showToast("¡Mensaje editado! ✏️", "success");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('beagle_messages')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setMessages((prev) => prev.filter((m) => m.id !== id));
        showToast("¡Mensaje eliminado! 🗑️", "success");
      } catch (err) {
        console.error('Error eliminando de Supabase:', err);
        const updated = messages.filter((m) => m.id !== id);
        setMessages(updated);
        localStorage.setItem('beagle_messages', JSON.stringify(updated));
        showToast("Mensaje eliminado localmente.", "warning");
      }
    } else {
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      localStorage.setItem('beagle_messages', JSON.stringify(updated));
      showToast("¡Mensaje eliminado! 🗑️", "success");
    }
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
            <Hero onJoinCommunity={handleJoinCommunity} />
            
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

        {currentTab === 'tablon' && (
          <div className="fade-in">
            <section className="content-section tablon-section">
              <div className="section-header-container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2>Tablón de la Comunidad 💬</h2>
                <p className="section-subtitle">
                  Deja un mensaje para saludar, compartir anécdotas de tus sabuesos o hacer consultas a otros dueños.
                </p>
                <div className="status-badge-wrapper" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  {supabase ? (
                    <span className="status-badge live">
                      <span className="pulse-dot"></span> En línea ☁️
                    </span>
                  ) : (
                    <span className="status-badge local">
                      <span className="static-dot" style={{ backgroundColor: '#7f8c8d' }}></span> Modo Local 📱
                    </span>
                  )}
                </div>
              </div>
              
              <div className="tablon-content-wrapper">
                <ContactForm onAddMessage={handleAddMessage} onShowToast={showToast} />
                <CommunityBoard 
                  messages={messages} 
                  onDeleteMessage={handleDeleteMessage} 
                  onUpdateMessage={handleUpdateMessage} 
                />
              </div>
            </section>
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
            <MascotasPanel onShowToast={showToast} />
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
