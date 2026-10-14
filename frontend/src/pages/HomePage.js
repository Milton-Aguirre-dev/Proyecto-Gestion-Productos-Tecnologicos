import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page-card">
      <h1>Control de Equipamiento</h1>
      <p>Bienvenido al sistema de solicitudes de equipamiento. Inicia sesión o regístrate para continuar.</p>
      <ul className="hero-links">
        <li>
          <Link to="/login">Iniciar sesión</Link>
        </li>
        <li>
          <Link to="/register">Registrarse</Link>
        </li>
        <li>
          <Link to="/solicitudes">Ver solicitudes</Link>
        </li>
        <li>
          <Link to="/equipos/1">Ejemplo de detalle de equipo</Link>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
