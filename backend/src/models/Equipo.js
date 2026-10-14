const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipo = sequelize.define('Equipo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codigoInventario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('disponible', 'prestado', 'mantenimiento', 'baja'),
    allowNull: false,
    defaultValue: 'disponible',
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requiereAutorizacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Equipo;
