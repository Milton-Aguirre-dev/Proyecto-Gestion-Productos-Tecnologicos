import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h2>Página no encontrada</h2>
      <p>La ruta a la que intentas acceder no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default NotFoundPage;
