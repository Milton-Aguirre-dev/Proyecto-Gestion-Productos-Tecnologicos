const express = require('express');
const { getEquipmentById, getAllEquipment } = require('../controllers/equipo.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verificarToken, getAllEquipment);
router.get('/:id', verificarToken, getEquipmentById);

module.exports = router;
