import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import equipmentService from '../services/equipmentService';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        setLoading(true);
        const data = await equipmentService.getEquipmentById(id);
        setEquipment(data);
      } catch (apiError) {
        setError(apiError.error || apiError.message || 'No se pudo cargar el equipo');
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, [id]);

  return (
    <div>
      <h2>Detalle de Equipo</h2>
      <p>ID leído de la URL: {id}</p>

      {loading && <p>Cargando información del equipo...</p>}

      {error && (
        <div style={{ padding: '1rem', background: '#ffe6e6', color: '#a00', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {equipment && (
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
          <p><strong>Código:</strong> {equipment.codigoInventario}</p>
          <p><strong>Nombre:</strong> {equipment.nombre}</p>
          <p><strong>Categoría:</strong> {equipment.categoria}</p>
          <p><strong>Estado:</strong> {equipment.estado}</p>
          <p><strong>Ubicación:</strong> {equipment.ubicacion}</p>
          <p><strong>Requiere autorización:</strong> {equipment.requiereAutorizacion ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetailPage;
