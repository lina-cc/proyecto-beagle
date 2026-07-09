import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Tips from './components/Tips';
import Cazadores from './components/Cazadores';
import Resources from './components/Resources';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';
import ContactForm from './components/ContactForm';
import CommunityBoard from './components/CommunityBoard';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';

const INITIAL_MESSAGES = [
  {
    id: 1,
    name: "Carlos Mendoza",
    date: "21/06/2026",
    text: "¡Mi Beagle Toby es tremendo! Se robó unos calcetines ayer pero es tan cariñoso que no me puedo enojar con él. Saludos a todos en la comunidad."
  },
  {
    id: 2,
    name: "Andrea Riquelme",
    date: "20/06/2026",
    text: "Recomiendo mucho limpiarles las orejas seguido. Cooper sufría de otitis hasta que empezamos a limpiárselas cada semana como aconsejan los tips de salud."
  }
];

const IMAGES = [
  { src: "img/2.jpg", alt: "Beagle jugando al aire libre", caption: "Feliz en el parque" },
  { src: "img/3.jpg", alt: "Cachorro beagle descansando", caption: "Hora de la siesta" },
  { src: "img/4.jpg", alt: "Beagle explorando la naturaleza", caption: "Día de exploración" },
  { src: "img/5.jpg", alt: "Beagle posando alegremente", caption: "Mirada curiosa" },
  { src: "img/6.jpg", alt: "Beagle divirtiéndose", caption: "Jugando feliz" },
  { src: "img/7.jpg", alt: "Beagle orejas largas", caption: "Compañero leal" }
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0 });
  const [toasts, setToasts] = useState([]);

  // Carga inicial de comentarios desde Supabase (Read) con Async/Await
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase no está configurado o las credenciales son inválidas.');
        }
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.warn('Fallo al conectar con Supabase, usando mensajes estáticos:', err.message);
        // Fallback a los datos estáticos de respaldo
        setMessages(INITIAL_MESSAGES);
      }
    };
    loadMessages();
  }, []);

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

  // Crear comentario (Create)
  const handleAddMessage = async (newMessage) => {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado.');
      }
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            id: newMessage.id,
            name: newMessage.name,
            date: newMessage.date,
            text: newMessage.text
          }
        ]);

      if (error) throw error;
      setMessages((prev) => [newMessage, ...prev]);
    } catch (err) {
      console.error('Error al guardar comentario en Supabase:', err.message);
      showToast('Error al persistir en la nube. Guardado temporalmente en local.', 'error');
      // Guardado local de respaldo (memoria)
      setMessages((prev) => [newMessage, ...prev]);
    }
  };

  // Eliminar comentario (Delete)
  const handleDeleteMessage = async (id) => {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado.');
      }
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      showToast('Comentario eliminado con éxito. 🐾', 'success');
    } catch (err) {
      console.error('Error al borrar comentario en Supabase:', err.message);
      showToast('Error al eliminar en la nube. Borrado localmente.', 'error');
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }
  };

  // Actualizar comentario (Update)
  const handleUpdateMessage = async (id, updatedText) => {
    try {
      if (!supabase) {
        throw new Error('Supabase no está configurado.');
      }
      const { error } = await supabase
        .from('comments')
        .update({ text: updatedText })
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, text: updatedText } : msg))
      );
      showToast('Comentario editado con éxito. ✏️', 'success');
    } catch (err) {
      console.error('Error al actualizar comentario en Supabase:', err.message);
      showToast('Error al guardar cambios. Editado localmente.', 'error');
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, text: updatedText } : msg))
      );
    }
  };

  return (
    <>
      <Header />
      
      <main>
        <Hero />
        <About />
        <Cazadores />
        <Tips />
        <Resources />
        <Gallery images={IMAGES} onImageClick={handleOpenLightbox} />
        
        <section id="contacto" className="content-section">
          <h2>Contacto</h2>
          <ContactForm onAddMessage={handleAddMessage} onShowToast={showToast} />
          <CommunityBoard 
            messages={messages} 
            onDeleteMessage={handleDeleteMessage}
            onUpdateMessage={handleUpdateMessage}
          />
        </section>
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
