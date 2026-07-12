import React from 'react';

export default function Header({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'inicio', name: 'Inicio', emoji: '🏠' },
    { id: 'sobre', name: 'Sobre Beagles', emoji: '📖' },
    { id: 'cazadores', name: 'Sabuesos', emoji: '🐾' },
    { id: 'tablon', name: 'Tablón', emoji: '💬' },
    { id: 'recursos', name: 'Recursos', emoji: '💡' },
    { id: 'mascotas', name: 'Mis Mascotas', emoji: '🐕' }
  ];

  return (
    <header>
      <div className="header-container">
        <h1 className="logo" onClick={() => setCurrentTab('inicio')} style={{ cursor: 'pointer' }}>
          Comunidad Beagle 🐶
        </h1>
        <nav>
          <ul className="nav-links">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setCurrentTab(tab.id)}
                  className={`nav-tab-btn ${currentTab === tab.id ? 'active' : ''}`}
                >
                  {tab.emoji} {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
