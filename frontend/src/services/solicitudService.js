import api from './api';

const getRequests = async (filters = {}) => {
  const params = {};
  if (filters.estado) params.estado = filters.estado;
  if (filters.equipoId) params.equipoId = filters.equipoId;
  if (filters.categoria) params.categoria = filters.categoria;
  if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
  if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
  const response = await api.get('/solicitudes', { params });
  return response.data;
};

const getRequestById = async (id) => {
  const response = await api.get(`/solicitudes/${id}`);
  return response.data;
};

const createRequest = async (payload) => {
  const response = await api.post('/solicitudes', payload);
  return response.data;
};

const updateRequest = async (id, payload) => {
  const response = await api.put(`/solicitudes/${id}`, payload);
  return response.data;
};

const cancelRequest = async (id) => {
  const response = await api.post(`/solicitudes/${id}/cancel`);
  return response.data;
};

const decideRequest = async (id, action) => {
  const response = await api.post(`/solicitudes/${id}/decision`, { action });
  return response.data;
};

const returnRequest = async (id) => {
  const response = await api.post(`/solicitudes/${id}/devolver`);
  return response.data;
};

const getResumen = async () => {
  const response = await api.get('/solicitudes/resumen');
  return response.data;
};

export default {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  cancelRequest,
  decideRequest,
  returnRequest,
  getResumen,
};
