const { Equipo } = require('../models');

const getAllEquipment = async () => {
  return Equipo.findAll({ order: [['nombre', 'ASC']] });
};

const getEquipmentById = async (id) => {
  const equipo = await Equipo.findById(id);
  if (!equipo) {
    const error = new Error('Equipo no encontrado');
    error.status = 404;
    throw error;
  }
  return equipo;
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
};
