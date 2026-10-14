import api from './api';

const getAllEquipment = async () => {
  const response = await api.get('/equipos');
  return response.data;
};

const getEquipmentById = async (id) => {
  const response = await api.get(`/equipos/${id}`);
  return response.data;
};

export default {
  getAllEquipment,
  getEquipmentById,
};
