const { Solicitud, Equipo, Usuario, HistorialSolicitud, sequelize } = require('../models');

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const isFechaInvalida = (fechaRetiro, fechaDevolucion) => {
  return !fechaRetiro || !fechaDevolucion || fechaRetiro >= fechaDevolucion;
};

const buildSolicitudInclude = () => [
  {
    model: Equipo,
    as: 'equipo',
  },
  {
    model: Usuario,
    as: 'solicitante',
    attributes: ['id', 'nombre', 'email', 'rol'],
  },
  {
    model: Usuario,
    as: 'autorizante',
    attributes: ['id', 'nombre', 'email', 'rol'],
  },
  {
    model: HistorialSolicitud,
    as: 'historial',
    include: [
      {
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email', 'rol'],
      },
    ],
  },
];

const findOverlappingApproved = async (equipoId, fechaRetiro, fechaDevolucion, excludeId) => {
  const where = {
    equipoId,
    estado: 'aprobada',
    fechaRetiro: { $lte: fechaDevolucion },
    fechaDevolucion: { $gte: fechaRetiro },
  };

  if (excludeId) {
    where.id = { $ne: excludeId };
  }

  return Solicitud.findOne({ where });
};

const appendHistorial = async ({ solicitudId, usuarioId, accion, valorAnterior, valorNuevo }, transaction) => {
  await HistorialSolicitud.create(
    {
      solicitudId,
      usuarioId,
      accion,
      valorAnterior: valorAnterior ? JSON.stringify(valorAnterior) : null,
      valorNuevo: valorNuevo ? JSON.stringify(valorNuevo) : null,
    },
    { transaction }
  );
};

const listSolicitudes = async (filtros, usuario, options = {}) => {
  const where = {};
  const include = buildSolicitudInclude();
  const sortableFields = ['createdAt', 'fechaRetiro', 'fechaDevolucion', 'estado'];
  const sortBy = sortableFields.includes(options.sortBy) ? options.sortBy : 'createdAt';
  const order = options.order === 'desc' ? 'DESC' : 'ASC';

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.equipoId) {
    where.equipoId = filtros.equipoId;
  }

  if (filtros.fechaDesde) {
    where.fechaRetiro = { ...(where.fechaRetiro || {}), $gte: filtros.fechaDesde };
  }

  if (filtros.fechaHasta) {
    where.fechaDevolucion = { ...(where.fechaDevolucion || {}), $lte: filtros.fechaHasta };
  }

  if (filtros.categoria) {
    include[0].where = { categoria: filtros.categoria };
  }

  if (!['admin', 'encargado'].includes(usuario.rol)) {
    where.usuarioId = usuario.id;
  }

  const queryOptions = {
    where,
    include,
    order: [[sortBy, order]],
  };

  if (options.page || options.limit) {
    const page = Number(options.page) >= 1 ? Number(options.page) : 1;
    const limit = Number(options.limit) >= 1 ? Number(options.limit) : 10;
    queryOptions.limit = limit;
    queryOptions.offset = (page - 1) * limit;

    const total = await Solicitud.count({ where, include });
    const solicitudes = await Solicitud.findAll(queryOptions);

    return { rows: solicitudes, total, page, limit, sortBy, order };
  }

  const solicitudes = await Solicitud.findAll(queryOptions);
  return { rows: solicitudes, total: null, sortBy, order };
};

const getSolicitudById = async (id, usuario) => {
  const solicitud = await Solicitud.findById(id, { include: buildSolicitudInclude() });
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (!['admin', 'encargado'].includes(usuario.rol) && solicitud.usuarioId !== usuario.id) {
    throw createError('No autorizado para ver esta solicitud', 403);
  }

  return solicitud;
};

const getSolicitudHistorial = async (id, usuario) => {
  const solicitud = await Solicitud.findById(id, { include: buildSolicitudInclude() });
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (!['admin', 'encargado'].includes(usuario.rol) && solicitud.usuarioId !== usuario.id) {
    throw createError('No autorizado para ver el historial de esta solicitud', 403);
  }

  return solicitud.historial || [];
};

const createSolicitud = async ({ equipoId, fechaRetiro, fechaDevolucion, motivo }, usuario) => {
  if (!equipoId || !motivo) {
    throw createError('Equipo, fecha y motivo son requeridos');
  }

  if (isFechaInvalida(fechaRetiro, fechaDevolucion)) {
    throw createError('La fecha de retiro debe ser anterior a la fecha de devolución');
  }

  const equipo = await Equipo.findById(equipoId);
  if (!equipo) {
    throw createError('Equipo no encontrado', 404);
  }

  if (equipo.estado !== 'disponible') {
    throw createError('Equipo no disponible para solicitud');
  }

  const overlapping = await findOverlappingApproved(equipoId, fechaRetiro, fechaDevolucion);
  if (overlapping) {
    throw createError('Ya existe una solicitud aprobada para ese equipo en las fechas indicadas');
  }

  return sequelize.transaction(async (transaction) => {
    const solicitud = await Solicitud.create(
      {
        equipoId,
        usuarioId: usuario.id,
        fechaRetiro,
        fechaDevolucion,
        motivo,
        estado: 'pendiente',
      },
      { transaction }
    );

    await appendHistorial(
      {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        accion: 'creacion',
        valorAnterior: null,
        valorNuevo: { fechaRetiro, fechaDevolucion, motivo, estado: solicitud.estado },
      },
      transaction
    );

    return solicitud;
  });
};

const updateSolicitud = async (id, cambios, usuario) => {
  const solicitud = await Solicitud.findById(id);
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (solicitud.usuarioId !== usuario.id) {
    throw createError('No autorizado para editar esta solicitud', 403);
  }

  if (solicitud.estado !== 'pendiente') {
    throw createError('Solo se pueden editar solicitudes pendientes');
  }

  if (isFechaInvalida(cambios.fechaRetiro, cambios.fechaDevolucion)) {
    throw createError('La fecha de retiro debe ser anterior a la fecha de devolución');
  }

  const equipo = await Equipo.findById(solicitud.equipoId);
  if (!equipo) {
    throw createError('Equipo no encontrado', 404);
  }

  if (equipo.estado !== 'disponible') {
    throw createError('Equipo no disponible para solicitud');
  }

  const overlapping = await findOverlappingApproved(solicitud.equipoId, cambios.fechaRetiro, cambios.fechaDevolucion, solicitud.id);
  if (overlapping) {
    throw createError('Ya existe una solicitud aprobada para ese equipo en las fechas indicadas');
  }

  const valorAnterior = {
    fechaRetiro: solicitud.fechaRetiro,
    fechaDevolucion: solicitud.fechaDevolucion,
    motivo: solicitud.motivo,
  };

  solicitud.fechaRetiro = cambios.fechaRetiro;
  solicitud.fechaDevolucion = cambios.fechaDevolucion;
  solicitud.motivo = cambios.motivo;

  return sequelize.transaction(async (transaction) => {
    await solicitud.save({ transaction });
    await appendHistorial(
      {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        accion: 'edicion',
        valorAnterior,
        valorNuevo: { fechaRetiro: solicitud.fechaRetiro, fechaDevolucion: solicitud.fechaDevolucion, motivo: solicitud.motivo },
      },
      transaction
    );
    return solicitud;
  });
};

const cancelSolicitud = async (id, usuario) => {
  const solicitud = await Solicitud.findById(id);
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (solicitud.usuarioId !== usuario.id) {
    throw createError('No autorizado para cancelar esta solicitud', 403);
  }

  if (solicitud.estado === 'devuelta') {
    throw createError('No se puede cancelar una solicitud devuelta');
  }

  if (solicitud.estado === 'cancelada') {
    throw createError('La solicitud ya fue cancelada');
  }

  const equipo = await Equipo.findById(solicitud.equipoId);
  if (!equipo) {
    throw createError('Equipo no encontrado', 404);
  }

  const valorAnterior = { estado: solicitud.estado };
  const estadoAnterior = solicitud.estado;
  solicitud.estado = 'cancelada';

  return sequelize.transaction(async (transaction) => {
    await solicitud.save({ transaction });

    if (estadoAnterior === 'aprobada') {
      equipo.estado = 'disponible';
      await equipo.save({ transaction });
    }

    await appendHistorial(
      {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        accion: 'cancelacion',
        valorAnterior,
        valorNuevo: { estado: solicitud.estado },
      },
      transaction
    );
    return solicitud;
  });
};

const returnSolicitud = async (id, usuario) => {
  const solicitud = await Solicitud.findById(id, { include: [{ model: Equipo, as: 'equipo' }] });
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (solicitud.estado !== 'aprobada') {
    throw createError('Solo se pueden devolver solicitudes aprobadas');
  }

  if (!['admin', 'encargado'].includes(usuario.rol)) {
    throw createError('No autorizado para devolver esta solicitud', 403);
  }

  const equipo = solicitud.equipo || (await Equipo.findById(solicitud.equipoId));
  if (!equipo) {
    throw createError('Equipo no encontrado', 404);
  }

  solicitud.estado = 'devuelta';

  return sequelize.transaction(async (transaction) => {
    await solicitud.save({ transaction });
    equipo.estado = 'disponible';
    await equipo.save({ transaction });

    await appendHistorial(
      {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        accion: 'devolucion',
        valorAnterior: { estado: 'aprobada' },
        valorNuevo: { estado: 'devuelta' },
      },
      transaction
    );

    return solicitud;
  });
};

const decideSolicitud = async (id, action, usuario) => {
  const solicitud = await Solicitud.findById(id, { include: [{ model: Equipo, as: 'equipo' }] });
  if (!solicitud) {
    throw createError('Solicitud no encontrada', 404);
  }

  if (solicitud.estado !== 'pendiente') {
    throw createError('Solo se pueden decidir solicitudes pendientes');
  }

  if (!['aprobar', 'rechazar'].includes(action)) {
    throw createError('Acción inválida');
  }

  if (isFechaInvalida(solicitud.fechaRetiro, solicitud.fechaDevolucion)) {
    solicitud.estado = 'rechazada';
    solicitud.autorizadoPor = usuario.id;
    await solicitud.save();
    await appendHistorial({
      solicitudId: solicitud.id,
      usuarioId: usuario.id,
      accion: 'rechazo',
      valorAnterior: { estado: 'pendiente' },
      valorNuevo: { estado: 'rechazada', razon: 'Fechas inválidas' },
    });
    return solicitud;
  }

  const equipo = solicitud.equipo;

  if (!equipo) {
    throw createError('Equipo asociado no encontrado', 404);
  }

  const overlap = await findOverlappingApproved(solicitud.equipoId, solicitud.fechaRetiro, solicitud.fechaDevolucion, solicitud.id);
  const equipoNoDisponible = equipo.estado !== 'disponible';

  if (action === 'rechazar' || equipoNoDisponible || overlap) {
    solicitud.estado = 'rechazada';
    solicitud.autorizadoPor = usuario.id;
    await solicitud.save();
    await appendHistorial({
      solicitudId: solicitud.id,
      usuarioId: usuario.id,
      accion: 'rechazo',
      valorAnterior: { estado: 'pendiente' },
      valorNuevo: {
        estado: 'rechazada',
        razon: action === 'rechazar' ? 'Rechazo manual' : equipoNoDisponible ? 'Equipo no disponible' : 'Fechas superpuestas con otra solicitud aprobada',
      },
    });
    return solicitud;
  }

  solicitud.estado = 'aprobada';
  solicitud.autorizadoPor = usuario.id;

  return sequelize.transaction(async (transaction) => {
    await solicitud.save({ transaction });
    await appendHistorial(
      {
        solicitudId: solicitud.id,
        usuarioId: usuario.id,
        accion: 'aprobacion',
        valorAnterior: { estado: 'pendiente' },
        valorNuevo: { estado: 'aprobada' },
      },
      transaction
    );

    equipo.estado = 'prestado';
    await equipo.save({ transaction });

    return solicitud;
  });
};

const getResumen = async () => {
  const equiposDisponibles = await Equipo.findAll({ where: { estado: 'disponible' } });
  const equiposDisponiblesPorCategoria = equiposDisponibles.reduce((acc, equipo) => {
    acc[equipo.categoria] = (acc[equipo.categoria] || 0) + 1;
    return acc;
  }, {});

  const solicitudesPendientesAprobacion = await Solicitud.count({ where: { estado: 'pendiente' } });
  const equiposPrestados = await Equipo.count({ where: { estado: 'prestado' } });

  const fechaHoy = new Date().toISOString().split('T')[0];
  const prestamosVencidos = await Solicitud.findAll({
    where: {
      estado: 'aprobada',
      fechaDevolucion: { $lt: fechaHoy },
    },
    include: [
      {
        model: Equipo,
        as: 'equipo',
      },
      {
        model: Usuario,
        as: 'solicitante',
        attributes: ['id', 'nombre', 'email', 'rol'],
      },
    ],
  });

  return {
    equiposDisponiblesPorCategoria: Object.entries(equiposDisponiblesPorCategoria).map(([categoria, cantidad]) => ({ categoria, cantidad })),
    solicitudesPendientesAprobacion,
    equiposPrestados,
    prestamosVencidos: prestamosVencidos.length,
    prestamosVencidosDetalle: prestamosVencidos,
  };
};

module.exports = {
  listSolicitudes,
  getSolicitudById,
  getSolicitudHistorial,
  createSolicitud,
  updateSolicitud,
  cancelSolicitud,
  returnSolicitud,
  decideSolicitud,
  getResumen,
};
