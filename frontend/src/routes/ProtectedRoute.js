import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.rol)) {
    return <div style={{ color: '#c00' }}><h2>Acceso denegado</h2><p>No tienes permisos para ver esta página.</p></div>;
  }

  return children;
};

export default ProtectedRoute;
