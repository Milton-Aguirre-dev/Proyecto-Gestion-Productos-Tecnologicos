const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialSolicitud = sequelize.define('HistorialSolicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  solicitudId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  accion: {
    type: DataTypes.ENUM('creacion', 'edicion', 'aprobacion', 'rechazo', 'cancelacion', 'devolucion'),
    allowNull: false,
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  valorAnterior: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  valorNuevo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = HistorialSolicitud;
