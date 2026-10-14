import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import solicitudService from '../services/solicitudService';
import equipmentService from '../services/equipmentService';

const estados = ['', 'pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta'];

const RequestsPage = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', equipoId: '', categoria: '', fechaDesde: '', fechaHasta: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const categorias = useMemo(() => {
    return [...new Set(equipos.map((equipo) => equipo.categoria))];
  }, [equipos]);

  const loadRequests = async () => {
    try {
      setError('');
      const datos = await solicitudService.getRequests({
        estado: filtros.estado,
        equipoId: filtros.equipoId,
        categoria: filtros.categoria,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
      });
      setSolicitudes(datos);
    } catch (apiError) {
      setError(apiError.error || apiError.message || 'No se pudo cargar las solicitudes');
    }
  };

  const loadEquipment = async () => {
    try {
      const datos = await equipmentService.getAllEquipment();
      setEquipos(datos);
    } catch {
      // Silencio para que al menos se vean las solicitudes.
    }
  };

  useEffect(() => {
    loadEquipment();
    loadRequests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    loadRequests();
  };

  return (
    <div className="page-card">
      <h2>Solicitudes</h2>
      <div className="section-actions" style={{ justifyContent: 'space-between', display: 'flex', gap: '1rem' }}>
        <Link to="/solicitudes/new">Crear nueva solicitud</Link>
        {['admin', 'encargado'].includes(user?.rol) && (
          <Link to="/solicitudes/resumen">Ver resumen</Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="filter-form">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Estado
            <select name="estado" value={filtros.estado} onChange={handleChange}>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado || 'Todos'}
                </option>
              ))}
            </select>
          </label>

          <label>
            Equipo
            <select name="equipoId" value={filtros.equipoId} onChange={handleChange}>
              <option value="">Todos</option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Categoría
            <select name="categoria" value={filtros.categoria} onChange={handleChange}>
              <option value="">Todos</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha desde
            <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleChange} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label>
            Fecha hasta
            <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleChange} />
          </label>
          <div style={{ alignSelf: 'end' }}>
            <button type="submit">Aplicar filtros</button>
          </div>
        </div>
      </form>

      {error && <div style={{ color: '#a00' }}>{error}</div>}

      {solicitudes.length === 0 ? (
        <p>No se encontraron solicitudes.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipo</th>
              <th>Estado</th>
              <th>Fecha retiro</th>
              <th>Fecha devolución</th>
              <th>Solicitante</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{solicitud.id}</td>
                <td>{solicitud.equipo?.nombre || '—'}</td>
                <td>{solicitud.estado}</td>
                <td>{solicitud.fechaRetiro}</td>
                <td>{solicitud.fechaDevolucion}</td>
                <td>{solicitud.solicitante?.email || '—'}</td>
                <td>
                  <Link to={`/solicitudes/${solicitud.id}`}>Ver detalle</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RequestsPage;
