import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('usuario');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    if (!email.trim()) {
      errors.email = 'El email es obligatorio';
    }
    if (!password || password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFieldErrors(errors);
    setError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await register(nombre, email, password, rol);
      navigate('/profile');
    } catch (apiError) {
      setError(apiError.error || apiError.message || 'Error inesperado al registrarse');
    }
  };

  return (
    <div className="page-card">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        {fieldErrors.nombre && <p className="error-text">{fieldErrors.nombre}</p>}

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {fieldErrors.email && <p className="error-text">{fieldErrors.email}</p>}

        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {fieldErrors.password && <p className="error-text">{fieldErrors.password}</p>}

        <label>
          Rol
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="usuario">Usuario</option>
            <option value="encargado">Encargado</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit">Registrarse</button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default RegisterPage;
