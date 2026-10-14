const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fechaRetiro: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fechaDevolucion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  autorizadoPor: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Solicitud;
