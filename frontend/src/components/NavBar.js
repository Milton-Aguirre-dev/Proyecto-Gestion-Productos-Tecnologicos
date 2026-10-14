import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-link navbar-logo">
        ControlEquipos
      </Link>
      {isAuthenticated ? <Link to="/profile" className="navbar-link">Perfil</Link> : <Link to="/login" className="navbar-link">Iniciar sesión</Link>}
      {isAuthenticated && <Link to="/solicitudes" className="navbar-link">Solicitudes</Link>}
      {isAuthenticated && ['admin', 'encargado'].includes(user?.rol) && (
        <Link to="/solicitudes/resumen" className="navbar-link">Resumen</Link>
      )}
      {!isAuthenticated && <Link to="/register" className="navbar-link">Registrarse</Link>}
      {isAuthenticated && (
        <button onClick={handleLogout} className="navbar-button">
          Cerrar sesión
        </button>
      )}
      {user && <span className="navbar-user">Usuario: {user.email}</span>}
    </nav>
  );
};

export default NavBar;
