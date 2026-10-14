const equipoService = require('../services/equipo.service');

const getAllEquipment = async (req, res, next) => {
  try {
    const equipos = await equipoService.getAllEquipment();
    res.json(equipos);
  } catch (error) {
    next(error);
  }
};

const getEquipmentById = async (req, res, next) => {
  try {
    const equipo = await equipoService.getEquipmentById(Number(req.params.id));
    res.json(equipo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipmentById,
  getAllEquipment,
};
