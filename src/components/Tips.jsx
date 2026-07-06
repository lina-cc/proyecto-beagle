import React, { useState } from 'react';

const BEAGLE_TIPS = [
  {
    id: 1,
    title: "Ejercicio diario e instinto de rastro",
    category: "salud",
    text: "Los Beagles tienen un olfato extraordinario y mucha energía. Necesitan al menos 1 hora de paseo al día donde puedan olfatear de forma segura. Llévalo siempre con correa, ya que si capta un rastro puede escapar de tu vista rápidamente.",
    icon: "🏃‍♂️"
  },
  {
    id: 2,
    title: "Higiene y cuidado de sus orejas",
    category: "higiene",
    text: "Debido a que sus orejas son largas y caídas, tienen poca ventilación y acumulan humedad. Limpia sus orejas semanalmente con un producto recomendado por tu veterinario para prevenir infecciones de oído (otitis).",
    icon: "👂"
  },
  {
    id: 3,
    title: "Motivación por la comida en el entrenamiento",
    category: "educacion",
    text: "Los Beagles son glotones por naturaleza. Utiliza esto a tu favor usando pequeños trozos de comida saludable como premios de refuerzo positivo. Ten paciencia, ya que pueden ser un poco obstinados al principio.",
    icon: "🍖"
  },
  {
    id: 4,
    title: "Control de porciones de alimento",
    category: "salud",
    text: "Esta raza tiene una fuerte tendencia a la obesidad porque no tienen fondo para comer. Pesa su porción de alimento diaria estrictamente y evita darles comida de consumo humano para mantenerlos en su peso ideal.",
    icon: "⚖️"
  },
  {
    id: 5,
    title: "Cepillado regular y caída de pelo",
    category: "higiene",
    text: "Tienen pelo corto pero espeso, y mudan de pelo constantemente. Un cepillado de 2 a 3 veces por semana con un guante de goma o cepillo de cerdas duras ayudará a retirar el pelo muerto y mantener su brillo.",
    icon: "🧹"
  },
  {
    id: 6,
    title: "Socialización temprana y convivencia",
    category: "educacion",
    text: "Son perros de jauría, lo que los hace muy sociables y dependientes de compañía. Acostúmbralo desde cachorro a ver diferentes personas, ruidos y otros perros para evitar la ansiedad por separación o comportamientos destructivos.",
    icon: "🐾"
  }
];

export default function Tips() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredTips = BEAGLE_TIPS.filter(tip => {
    const matchesCategory = activeCategory === 'todos' || tip.category === activeCategory;
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      tip.title.toLowerCase().includes(cleanQuery) ||
      tip.text.toLowerCase().includes(cleanQuery) ||
      tip.category.toLowerCase().includes(cleanQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="consejos" className="content-section">
      <h2>Consejos de Cuidado</h2>
      <p className="section-subtitle" style={{ textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem', color: '#665b54' }}>
        Filtra y busca recomendaciones de expertos para mantener a tu Beagle feliz.
      </p>
      
      <div className="tips-controls">
        <div className="tips-filters">
          {['todos', 'salud', 'higiene', 'educacion'].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="tips-search-container">
          <input 
            type="text" 
            id="tips-search" 
            placeholder="🔍 Buscar consejo..." 
            aria-label="Buscar consejo"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div id="tips-grid" className="tips-grid">
        {filteredTips.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#888' }}>
            <p style={{ fontSize: '1.2rem' }}>🔍 No se encontraron consejos.</p>
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div key={tip.id} className={`tip-card ${tip.category}`}>
              <div className="tip-icon">{tip.icon}</div>
              <span className="tip-category">{tip.category}</span>
              <h3>{tip.title}</h3>
              <p>{tip.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
