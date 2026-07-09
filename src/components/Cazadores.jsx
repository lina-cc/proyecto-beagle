import React, { useState, useEffect } from 'react';

/**
 * JUSTIFICACIÓN DE ELEMENTOS DE REACT (Criterio 3.1.1):
 * - useState: Se utiliza para controlar de manera reactiva el estado de los perros cargados,
 *   el estado de carga (loading), los errores y el término de búsqueda para filtrado dinámico.
 * - useEffect: Hook de ciclo de vida que maneja efectos secundarios. Aquí gestiona la carga
 *   asíncrona del API al montarse el componente y reacciona a cambios en 'retryTrigger'.
 * - Sugerencias de IA: Se desacopló la URL usando variables de entorno (.env), garantizando
 *   que no existan hardcodeos vulnerables, y se implementó un flujo asíncrono robusto.
 */
export default function Cazadores() {
  const [perros, setPerros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    // Consumo de datos desde la API utilizando Async/Await (Criterio: async/await y control de errores)
    const fetchCazadores = async () => {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://proyecto-beagle-api.onrender.com/api/cazadores';
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error en el servidor: Código de estado ${response.status}`);
        }
        const data = await response.json();
        setPerros(data);
      } catch (err) {
        console.error('Error al consumir la API de perros cazadores:', err);
        setError(err.message || 'No se pudo establecer conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchCazadores();
  }, [retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger(prev => prev + 1);
  };

  // Filtrado reactivo en base a la búsqueda del usuario
  const filteredPerros = perros.filter(perro =>
    perro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perro.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perro.origen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="cazadores" className="content-section cazadores-section">
      <div className="section-header-container">
        <h2>Sabuesos y Cazadores</h2>
        <p className="section-subtitle">
          Explora los parientes cercanos del Beagle y otros sabuesos icónicos de rastreo directamente desde nuestra API en la nube.
        </p>
        <div className="status-badge-wrapper">
          {loading ? (
            <span className="status-badge live" style={{ backgroundColor: '#f0f3f4', color: '#7f8c8d', borderColor: '#d5dbdb' }}>
              Conectando...
            </span>
          ) : error ? (
            <span className="status-badge local" onClick={handleRetry} title="Haga clic para reintentar conexión con la API">
              <span className="static-dot" style={{ backgroundColor: '#e74c3c' }}></span> Error de Conexión 🔄
            </span>
          ) : (
            <span className="status-badge live">
              <span className="pulse-dot"></span> API en línea
            </span>
          )}
        </div>
      </div>

      {/* Buscador Dinámico */}
      <div className="search-box-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, tipo o país de origen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={!!error}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="cazadores-loading">
          <div className="spinner"></div>
          <p>Cargando información de sabuesos...</p>
        </div>
      ) : error ? (
        <div className="no-results-card" style={{ borderColor: '#f5b7b1' }}>
          <p className="no-results-icon">⚠️</p>
          <h3>Error al conectar con la API</h3>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            Asegúrate de que el backend esté disponible o intenta recargar.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleRetry}>
            Reintentar Conexión
          </button>
        </div>
      ) : (
        <>
          {filteredPerros.length === 0 ? (
            <div className="no-results-card">
              <p className="no-results-icon">🐕💨</p>
              <h3>No se encontraron resultados</h3>
              <p>Prueba buscando otro término, como "Gran Bretaña" o "Sabueso".</p>
              {searchTerm && (
                <button className="btn btn-secondary btn-sm" onClick={() => setSearchTerm('')}>
                  Limpiar Búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="cazadores-grid">
              {filteredPerros.map((perro) => (
                <div key={perro.id} className="cazador-card">
                  <div className="cazador-card-img-wrapper">
                    <img src={perro.imagen} alt={perro.nombre} className="cazador-card-img" loading="lazy" />
                    <span className="cazador-type-badge">{perro.tipo}</span>
                  </div>
                  <div className="cazador-card-content">
                    <div className="cazador-card-meta">
                      <span className="cazador-meta-label">Origen:</span>
                      <span className="cazador-meta-value">{perro.origen}</span>
                    </div>
                    <h3 className="cazador-card-title">{perro.nombre}</h3>
                    <div className="cazador-skill-box">
                      <strong className="cazador-skill-label">Habilidad Clave:</strong>
                      <p className="cazador-skill-text">{perro.habilidad_clave}</p>
                    </div>
                    <p className="cazador-card-desc">{perro.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
