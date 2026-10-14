const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const jwtSecret = process.env.JWT_SECRET || 'clave_secreta';

const buildPayload = (user) => ({
  id: user.id,
  email: user.email,
  rol: user.rol,
});

const generateToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
};

const registerUser = async ({ nombre, email, password, rol }) => {
  const existingUser = await Usuario.findOne({ where: { email } });

  if (existingUser) {
    const error = new Error('Email ya registrado');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await Usuario.create({
    nombre,
    email,
    passwordHash,
    rol: rol || 'usuario',
  });

  const payload = buildPayload(user);
  return generateToken(payload);
};

const loginUser = async ({ email, password }) => {
  const user = await Usuario.findOne({ where: { email } });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const payload = buildPayload(user);
  return generateToken(payload);
};

module.exports = {
  registerUser,
  loginUser,
};
