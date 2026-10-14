import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import equipmentService from '../services/equipmentService';
import solicitudService from '../services/solicitudService';

const RequestFormPage = () => {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [equipoId, setEquipoId] = useState('');
  const [fechaRetiro, setFechaRetiro] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [motivo, setMotivo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await equipmentService.getAllEquipment();
        setEquipos(data);
      } catch {
        setApiError('No se pudieron cargar los equipos');
      }
    };
    loadEquipment();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!equipoId) errors.equipoId = 'Debes seleccionar un equipo';
    if (!fechaRetiro) errors.fechaRetiro = 'La fecha de retiro es obligatoria';
    if (!fechaDevolucion) errors.fechaDevolucion = 'La fecha de devolución es obligatoria';
    if (fechaRetiro && fechaDevolucion && fechaRetiro >= fechaDevolucion) {
      errors.fechaDevolucion = 'La fecha de devolución debe ser posterior a la fecha de retiro';
    }
    if (!motivo.trim()) errors.motivo = 'El motivo es obligatorio';

    setFieldErrors(errors);
    setApiError('');

    if (Object.keys(errors).length > 0) return;

    try {
      const solicitud = await solicitudService.createRequest({ equipoId: Number(equipoId), fechaRetiro, fechaDevolucion, motivo });
      navigate(`/solicitudes/${solicitud.id}`);
    } catch (apiErr) {
      setApiError(apiErr.error || apiErr.message || 'Error al crear la solicitud');
    }
  };

  return (
    <div>
      <h2>Crear solicitud</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '520px' }}>
        <label>
          Equipo
          <select value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
            <option value="">Selecciona un equipo disponible</option>
            {equipos
              .filter((equipo) => equipo.estado === 'disponible')
              .map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre} ({equipo.categoria}) - {equipo.estado}
                </option>
              ))}
          </select>
        </label>
        {fieldErrors.equipoId && <p style={{ color: 'red' }}>{fieldErrors.equipoId}</p>}

        <label>
          Fecha de retiro
          <input type="date" value={fechaRetiro} onChange={(e) => setFechaRetiro(e.target.value)} />
        </label>
        {fieldErrors.fechaRetiro && <p style={{ color: 'red' }}>{fieldErrors.fechaRetiro}</p>}

        <label>
          Fecha de devolución
          <input type="date" value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} />
        </label>
        {fieldErrors.fechaDevolucion && <p style={{ color: 'red' }}>{fieldErrors.fechaDevolucion}</p>}

        <label>
          Motivo
          <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} />
        </label>
        {fieldErrors.motivo && <p style={{ color: 'red' }}>{fieldErrors.motivo}</p>}

        <button type="submit">Crear solicitud</button>

        {apiError && <div style={{ color: '#a00' }}>{apiError}</div>}
      </form>
    </div>
  );
};

export default RequestFormPage;
