const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Equipo = require('./Equipo');
const Solicitud = require('./Solicitud');
const HistorialSolicitud = require('./HistorialSolicitud');

Usuario.hasMany(Solicitud, {
  foreignKey: 'usuarioId',
  as: 'solicitudes',
});

Usuario.hasMany(Solicitud, {
  foreignKey: 'autorizadoPor',
  as: 'autorizaciones',
});

Equipo.hasMany(Solicitud, {
  foreignKey: 'equipoId',
  as: 'solicitudes',
});

Solicitud.belongsTo(Equipo, {
  foreignKey: 'equipoId',
  as: 'equipo',
});

Solicitud.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'solicitante',
});

Solicitud.belongsTo(Usuario, {
  foreignKey: 'autorizadoPor',
  as: 'autorizante',
});

Solicitud.hasMany(HistorialSolicitud, {
  foreignKey: 'solicitudId',
  as: 'historial',
});

HistorialSolicitud.belongsTo(Solicitud, {
  foreignKey: 'solicitudId',
  as: 'solicitud',
});

HistorialSolicitud.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario',
});

const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
};

syncDatabase();

module.exports = {
  sequelize,
  syncDatabase,
  Usuario,
  Equipo,
  Solicitud,
  HistorialSolicitud,
};
