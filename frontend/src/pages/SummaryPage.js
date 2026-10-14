import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudService from '../services/solicitudService';

const SummaryPage = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumen = async () => {
      try {
        setError('');
        setLoading(true);
        const data = await solicitudService.getResumen();
        setResumen(data);
      } catch (apiError) {
        setError(apiError.error || apiError.message || 'No se pudo cargar el resumen');
      } finally {
        setLoading(false);
      }
    };

    loadResumen();
  }, []);

  return (
    <div className="page-card">
      <div className="section-actions" style={{ justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)}>Volver</button>
        <button onClick={() => navigate('/solicitudes')}>Ver solicitudes</button>
      </div>

      <h2>Resumen del sistema</h2>

      {loading ? (
        <p>Cargando resumen...</p>
      ) : error ? (
        <div style={{ color: '#a00' }}>{error}</div>
      ) : (
        resumen && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="summary-card">
                <h3>Solicitudes pendientes</h3>
                <p>{resumen.solicitudesPendientesAprobacion}</p>
              </div>
              <div className="summary-card">
                <h3>Equipos prestados</h3>
                <p>{resumen.equiposPrestados}</p>
              </div>
            </div>

            <div className="summary-card">
              <h3>Equipos disponibles por categoría</h3>
              {resumen.equiposDisponiblesPorCategoria.length === 0 ? (
                <p>No hay equipos disponibles</p>
              ) : (
                <ul>
                  {resumen.equiposDisponiblesPorCategoria.map((item) => (
                    <li key={item.categoria}>
                      {item.categoria}: {item.cantidad}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="summary-card">
              <h3>Préstamos vencidos</h3>
              <p>{resumen.prestamosVencidos}</p>
            </div>

            {resumen.prestamosVencidosDetalle && resumen.prestamosVencidosDetalle.length > 0 && (
              <div className="summary-card">
                <h3>Detalle de préstamos vencidos</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Equipo</th>
                      <th>Solicitante</th>
                      <th>Fecha devolución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.prestamosVencidosDetalle.map((solicitud) => (
                      <tr key={solicitud.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td>{solicitud.equipo?.nombre || '—'}</td>
                        <td>{solicitud.solicitante?.email || '—'}</td>
                        <td>{solicitud.fechaDevolucion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default SummaryPage;
