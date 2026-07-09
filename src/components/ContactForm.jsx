import React, { useState } from 'react';

// HTML Sanitization to prevent XSS (faithful to the original code)
function sanitizeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#96;'
  };
  const reg = /[&<>"'`\/]/g;
  return text.replace(reg, (match) => map[match]);
}

export default function ContactForm({ onAddMessage, onShowToast }) {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [errors, setErrors] = useState({ nombre: '', email: '', mensaje: '' });
  const [validity, setValidity] = useState({ nombre: null, email: null, mensaje: null }); // null, 'valid', 'invalid'

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'nombre') {
      const val = value.trim();
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (val.length === 0) {
        error = "El nombre es obligatorio.";
      } else if (val.length < 3) {
        error = "El nombre debe tener al menos 3 caracteres.";
      } else if (!regex.test(val)) {
        error = "El nombre solo debe contener letras.";
      }
    } 
    
    else if (name === 'email') {
      const val = value.trim();
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (val.length === 0) {
        error = "El correo es obligatorio.";
      } else if (!regex.test(val)) {
        error = "Ingresa un correo electrónico válido.";
      }
    } 
    
    else if (name === 'mensaje') {
      const val = value.trim();
      if (val.length === 0) {
        error = "El mensaje no puede estar vacío.";
      } else if (val.length < 10) {
        error = `Mínimo 10 caracteres (llevas ${val.length}).`;
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setValidity(prev => ({ ...prev, [name]: error ? 'invalid' : 'valid' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    setValidity(prev => ({ ...prev, [name]: error ? 'invalid' : 'valid' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const nombreError = validateField('nombre', formData.nombre);
    const emailError = validateField('email', formData.email);
    const mensajeError = validateField('mensaje', formData.mensaje);

    const newErrors = { nombre: nombreError, email: emailError, mensaje: mensajeError };
    const newValidity = {
      nombre: nombreError ? 'invalid' : 'valid',
      email: emailError ? 'invalid' : 'valid',
      mensaje: mensajeError ? 'invalid' : 'valid'
    };

    setErrors(newErrors);
    setValidity(newValidity);

    const isValid = !nombreError && !emailError && !mensajeError;

    if (isValid) {
      const cleanNombre = formData.nombre.trim();
      const cleanMensaje = formData.mensaje.trim();

      const newMessage = {
        id: Date.now(),
        name: cleanNombre,
        date: new Date().toLocaleDateString('es-ES'),
        text: cleanMensaje
      };

      onAddMessage(newMessage);
      onShowToast("¡Mensaje publicado con éxito! 🐶🐾", "success");

      // Reset Form State
      setFormData({ nombre: '', email: '', mensaje: '' });
      setErrors({ nombre: '', email: '', mensaje: '' });
      setValidity({ nombre: null, email: null, mensaje: null });
    } else {
      onShowToast("Por favor, corrige los errores del formulario.", "error");
    }
  };

  const getInputClass = (fieldName) => {
    if (validity[fieldName] === 'valid') return 'is-valid';
    if (validity[fieldName] === 'invalid') return 'is-invalid';
    return '';
  };

  return (
    <div className="contact-container">
      <form className="contact-form" id="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input 
            type="text" 
            id="nombre" 
            name="nombre" 
            placeholder="Tu nombre" 
            required
            value={formData.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('nombre')}
          />
          <span 
            className="error-msg" 
            id="error-nombre" 
            style={{ opacity: validity.nombre === 'invalid' ? 1 : 0 }}
            aria-live="polite"
          >
            {errors.nombre}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="tu@email.com" 
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('email')}
          />
          <span 
            className="error-msg" 
            id="error-email" 
            style={{ opacity: validity.email === 'invalid' ? 1 : 0 }}
            aria-live="polite"
          >
            {errors.email}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="mensaje">Mensaje:</label>
          <textarea 
            id="mensaje" 
            name="mensaje" 
            placeholder="Escribe tu mensaje aquí..." 
            rows="5" 
            required
            value={formData.mensaje}
            onChange={handleChange}
            onBlur={handleBlur}
            className={getInputClass('mensaje')}
          ></textarea>
          <span 
            className="error-msg" 
            id="error-mensaje" 
            style={{ opacity: validity.mensaje === 'invalid' ? 1 : 0 }}
            aria-live="polite"
          >
            {errors.mensaje}
          </span>
        </div>

        <button type="submit" className="btn btn-submit">Enviar Mensaje</button>
      </form>
    </div>
  );
}
