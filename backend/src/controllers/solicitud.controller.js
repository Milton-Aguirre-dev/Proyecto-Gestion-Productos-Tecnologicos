const solicitudService = require('../services/solicitud.service');

const listSolicitudes = async (req, res, next) => {
  try {
    const filtros = {
      estado: req.query.estado,
      equipoId: req.query.equipoId ? Number(req.query.equipoId) : undefined,
      categoria: req.query.categoria,
      fechaDesde: req.query.desde || req.query.fechaDesde,
      fechaHasta: req.query.hasta || req.query.fechaHasta,
    };
    let page = req.query.page ? Number(req.query.page) : undefined;
    let limit = req.query.limit ? Number(req.query.limit) : undefined;
    if (page && !limit) {
      limit = 10;
    }
    if (limit && !page) {
      page = 1;
    }

    const pagination = {
      page,
      limit,
      sortBy: req.query.sortBy,
      order: req.query.order,
    };

    const result = await solicitudService.listSolicitudes(filtros, req.usuario, pagination);

    if (pagination.page || pagination.limit) {
      return res.status(200).json({
        data: result.rows,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          sortBy: result.sortBy,
          order: result.order,
        },
      });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getSolicitudById = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.getSolicitudById(Number(req.params.id), req.usuario);
    res.json(solicitud);
  } catch (error) {
    next(error);
  }
};

const createSolicitud = async (req, res, next) => {
  try {
    const { equipoId, fechaRetiro, fechaDevolucion, motivo } = req.body;
    const solicitud = await solicitudService.createSolicitud({ equipoId, fechaRetiro, fechaDevolucion, motivo }, req.usuario);
    res.status(201).json(solicitud);
  } catch (error) {
    next(error);
  }
};

const updateSolicitud = async (req, res, next) => {
  try {
    const { fechaRetiro, fechaDevolucion, motivo } = req.body;
    const solicitud = await solicitudService.updateSolicitud(Number(req.params.id), { fechaRetiro, fechaDevolucion, motivo }, req.usuario);
    res.json(solicitud);
  } catch (error) {
    next(error);
  }
};

const cancelSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.cancelSolicitud(Number(req.params.id), req.usuario);
    res.status(200).json(solicitud);
  } catch (error) {
    next(error);
  }
};

const decideSolicitud = async (req, res, next) => {
  try {
    const { action } = req.body;
    const solicitud = await solicitudService.decideSolicitud(Number(req.params.id), action, req.usuario);
    res.status(200).json(solicitud);
  } catch (error) {
    next(error);
  }
};

const returnSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.returnSolicitud(Number(req.params.id), req.usuario);
    res.status(200).json(solicitud);
  } catch (error) {
    next(error);
  }
};

const getSolicitudHistorial = async (req, res, next) => {
  try {
    const historial = await solicitudService.getSolicitudHistorial(Number(req.params.id), req.usuario);
    res.status(200).json(historial);
  } catch (error) {
    next(error);
  }
};

const getResumen = async (req, res, next) => {
  try {
    const resumen = await solicitudService.getResumen();
    res.status(200).json(resumen);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listSolicitudes,
  getSolicitudById,
  createSolicitud,
  updateSolicitud,
  cancelSolicitud,
  decideSolicitud,
  returnSolicitud,
  getSolicitudHistorial,
  getResumen,
};
