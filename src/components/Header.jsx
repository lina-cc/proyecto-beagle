import React from 'react';

export default function Header() {
  return (
    <header>
      <div className="header-container">
        <h1 className="logo">Comunidad Beagle 🐶</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#sobre">Sobre los Beagles</a></li>
            <li><a href="#recursos">Enlaces</a></li>
            <li><a href="#galeria">Galería</a></li>
            <li><a href="#contacto">Contacto</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
