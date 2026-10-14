import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!email.trim()) {
      errors.email = 'El email es obligatorio';
    }
    if (!password.trim()) {
      errors.password = 'La contraseña es obligatoria';
    }

    setFieldErrors(errors);
    setError('');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login(email, password);
      navigate('/profile');
    } catch (apiError) {
      setError(apiError.error || apiError.message || 'Error inesperado al iniciar sesión');
    }
  };

  return (
    <div className="page-card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="auth-form">
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

        <button type="submit">Ingresar</button>

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
