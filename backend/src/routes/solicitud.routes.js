const express = require('express');
const { verificarToken } = require('../middlewares/auth.middleware');
const { soloAdminOEncargado } = require('../middlewares/roles.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const solicitudController = require('../controllers/solicitud.controller');

const router = express.Router();

router.get('/', verificarToken, solicitudController.listSolicitudes);
router.get('/resumen', verificarToken, soloAdminOEncargado, solicitudController.getResumen);
router.post('/', verificarToken, validateBody(['equipoId', 'fechaRetiro', 'fechaDevolucion', 'motivo']), solicitudController.createSolicitud);
router.post('/:id/devolver', verificarToken, soloAdminOEncargado, solicitudController.returnSolicitud);
router.get('/:id', verificarToken, solicitudController.getSolicitudById);
router.put('/:id', verificarToken, validateBody(['fechaRetiro', 'fechaDevolucion', 'motivo']), solicitudController.updateSolicitud);
router.post('/:id/cancel', verificarToken, solicitudController.cancelSolicitud);
router.post('/:id/decision', verificarToken, soloAdminOEncargado, validateBody(['action']), solicitudController.decideSolicitud);

module.exports = router;
