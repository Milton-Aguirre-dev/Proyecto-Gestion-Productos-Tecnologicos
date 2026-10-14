import api from './api';

const register = async ({ nombre, email, password, rol }) => {
  const response = await api.post('/auth/register', { nombre, email, password, rol });
  return response.data;
};

const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export default {
  register,
  login,
};
