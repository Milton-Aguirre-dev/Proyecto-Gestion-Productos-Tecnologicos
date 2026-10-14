import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-card">
      <h2>Mi Perfil</h2>
      {user ? (
        <div>
          <p>Correo: {user.email}</p>
          <p>Rol: {user.rol}</p>
          <p>ID de usuario: {user.id}</p>
        </div>
      ) : (
        <p>No hay información de usuario disponible.</p>
      )}
    </div>
  );
};

export default ProfilePage;
