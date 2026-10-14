import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import solicitudService from '../services/solicitudService';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState({ fechaRetiro: '', fechaDevolucion: '', motivo: '' });
  const [formErrors, setFormErrors] = useState({});
  const [actionError, setActionError] = useState('');

  const isOwner = solicitud?.usuarioId === user?.id;
  const canEdit = isOwner && solicitud?.estado === 'pendiente';
  const canCancel = isOwner && solicitud && solicitud.estado !== 'devuelta' && solicitud.estado !== 'cancelada';
  const canDecide = ['admin', 'encargado'].includes(user?.rol) && solicitud?.estado === 'pendiente';
  const canReturn = ['admin', 'encargado'].includes(user?.rol) && solicitud?.estado === 'aprobada';

  const loadSolicitud = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await solicitudService.getRequestById(id);
      setSolicitud(data);
      setFormValues({
        fechaRetiro: data.fechaRetiro,
        fechaDevolucion: data.fechaDevolucion,
        motivo: data.motivo,
      });
    } catch (apiError) {
      setError(apiError.error || apiError.message || 'No se pudo cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitud();
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!formValues.fechaRetiro) errors.fechaRetiro = 'La fecha de retiro es obligatoria';
    if (!formValues.fechaDevolucion) errors.fechaDevolucion = 'La fecha de devolución es obligatoria';
    if (formValues.fechaRetiro && formValues.fechaDevolucion && formValues.fechaRetiro >= formValues.fechaDevolucion) {
      errors.fechaDevolucion = 'La fecha de devolución debe ser posterior a la fecha de retiro';
    }
    if (!formValues.motivo.trim()) errors.motivo = 'El motivo es obligatorio';

    setFormErrors(errors);
    setActionError('');
    if (Object.keys(errors).length > 0) return;

    try {
      await solicitudService.updateRequest(id, formValues);
      await loadSolicitud();
    } catch (apiError) {
      setActionError(apiError.error || apiError.message || 'Error al actualizar la solicitud');
    }
  };

  const handleCancel = async () => {
    try {
      setActionError('');
      await solicitudService.cancelRequest(id);
      await loadSolicitud();
    } catch (apiError) {
      setActionError(apiError.error || apiError.message || 'Error al cancelar la solicitud');
    }
  };

  const handleDecision = async (action) => {
    try {
      setActionError('');
      await solicitudService.decideRequest(id, action);
      await loadSolicitud();
    } catch (apiError) {
      setActionError(apiError.error || apiError.message || 'Error al procesar la solicitud');
    }
  };

  const handleReturn = async () => {
    try {
      setActionError('');
      await solicitudService.returnRequest(id);
      await loadSolicitud();
    } catch (apiError) {
      setActionError(apiError.error || apiError.message || 'Error al devolver la solicitud');
    }
  };

  const actionLabels = {
    creacion: 'Creación',
    edicion: 'Edición',
    aprobacion: 'Aprobación',
    rechazo: 'Rechazo',
    cancelacion: 'Cancelación',
    devolucion: 'Devolución',
  };

  const parseValue = (value) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const formatDetailItem = (key, value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/fechaRetiro/, 'Fecha de retiro')
      .replace(/fechaDevolucion/, 'Fecha de devolución')
      .replace(/valorAnterior/, 'Valor anterior')
      .replace(/valorNuevo/, 'Valor nuevo')
      .replace(/motivo/, 'Motivo')
      .replace(/estado/, 'Estado')
      .replace(/razon/, 'Razón');

    return (
      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ color: '#555' }}>{label}:</span>
        <strong>{String(value)}</strong>
      </div>
    );
  };

  const renderEventDetails = (evento) => {
    const anterior = parseValue(evento.valorAnterior);
    const nuevo = parseValue(evento.valorNuevo);

    if (evento.accion === 'edicion' && anterior && nuevo && typeof anterior === 'object' && typeof nuevo === 'object') {
      const keys = Array.from(new Set([...Object.keys(anterior), ...Object.keys(nuevo)]));
      return keys.map((key) => {
        const oldValue = anterior[key];
        const newValue = nuevo[key];
        if (oldValue === newValue) {
          return null;
        }
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/fechaRetiro/, 'Fecha de retiro')
          .replace(/fechaDevolucion/, 'Fecha de devolución')
          .replace(/motivo/, 'Motivo')
          .replace(/estado/, 'Estado')
          .replace(/razon/, 'Razón');
        return (
          <div key={key} style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: '#555', marginBottom: '0.25rem' }}>{label}:</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#a00' }}>Antes: {oldValue ?? '—'}</span>
              <span style={{ color: '#080' }}>Ahora: {newValue ?? '—'}</span>
            </div>
          </div>
        );
      });
    }

    const items = [];
    if (anterior && typeof anterior === 'object') {
      items.push(
        <div key="old" style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Antes</div>
          {Object.entries(anterior).map(([key, value]) => formatDetailItem(key, value))}
        </div>
      );
    }
    if (nuevo && typeof nuevo === 'object') {
      items.push(
        <div key="new" style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Ahora</div>
          {Object.entries(nuevo).map(([key, value]) => formatDetailItem(key, value))}
        </div>
      );
    }

    if (items.length > 0) {
      return items;
    }

    if (anterior || nuevo) {
      return (
        <div style={{ marginBottom: '0.25rem' }}>
          <span>{String(nuevo || anterior)}</span>
        </div>
      );
    }

    return <span>Sin información adicional</span>;
  };

  if (loading) return <p>Cargando solicitud...</p>;
  if (error) return <div style={{ color: '#a00' }}>{error}</div>;
  if (!solicitud) return <p>Solicitud no encontrada.</p>;

  return (
    <div>
      <h2>Detalle de solicitud #{solicitud.id}</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
      <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '1rem' }}>
        <p><strong>Equipo:</strong> {solicitud.equipo?.nombre || '—'}</p>
        <p><strong>Categoría:</strong> {solicitud.equipo?.categoria || '—'}</p>
        <p><strong>Estado:</strong> {solicitud.estado}</p>
        <p><strong>Solicitante:</strong> {solicitud.solicitante?.email || '—'}</p>
        <p><strong>Autorizado por:</strong> {solicitud.autorizante?.email || '-'}</p>
      </div>

      {canEdit ? (
        <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem', maxWidth: '520px' }}>
          <h3>Editar solicitud pendiente</h3>
          <label>
            Fecha de retiro
            <input
              type="date"
              value={formValues.fechaRetiro}
              onChange={(e) => setFormValues((prev) => ({ ...prev, fechaRetiro: e.target.value }))}
            />
          </label>
          {formErrors.fechaRetiro && <p style={{ color: 'red' }}>{formErrors.fechaRetiro}</p>}

          <label>
            Fecha de devolución
            <input
              type="date"
              value={formValues.fechaDevolucion}
              onChange={(e) => setFormValues((prev) => ({ ...prev, fechaDevolucion: e.target.value }))}
            />
          </label>
          {formErrors.fechaDevolucion && <p style={{ color: 'red' }}>{formErrors.fechaDevolucion}</p>}

          <label>
            Motivo
            <textarea
              value={formValues.motivo}
              onChange={(e) => setFormValues((prev) => ({ ...prev, motivo: e.target.value }))}
              rows={4}
            />
          </label>
          {formErrors.motivo && <p style={{ color: 'red' }}>{formErrors.motivo}</p>}

          <button type="submit">Guardar cambios</button>
        </form>
      ) : (
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Fecha de retiro:</strong> {solicitud.fechaRetiro}</p>
          <p><strong>Fecha de devolución:</strong> {solicitud.fechaDevolucion}</p>
          <p><strong>Motivo:</strong> {solicitud.motivo}</p>
        </div>
      )}

      {canCancel && (
        <button onClick={handleCancel} style={{ marginRight: '1rem' }}>
          Cancelar solicitud
        </button>
      )}

      {canReturn && (
        <button onClick={handleReturn} style={{ marginRight: '1rem', background: '#00529b', color: '#fff' }}>
          Marcar como devuelta
        </button>
      )}

      {canDecide && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={() => handleDecision('aprobar')} style={{ background: '#2a7a2a', color: '#fff' }}>
            Aprobar solicitud
          </button>
          <button onClick={() => handleDecision('rechazar')} style={{ background: '#a00', color: '#fff' }}>
            Rechazar solicitud
          </button>
        </div>
      )}

      {solicitud.historial && solicitud.historial.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Historial</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {solicitud.historial
              .slice()
              .sort((a, b) => new Date(a.fechaHora || a.createdAt) - new Date(b.fechaHora || b.createdAt))
              .map((evento) => (
                <div
                  key={evento.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <strong>{actionLabels[evento.accion] || evento.accion}</strong>
                      <div style={{ color: '#555', fontSize: '0.95rem' }}>
                        {new Date(evento.fechaHora || evento.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ color: '#333', fontSize: '0.95rem' }}>
                      {evento.usuario?.nombre || evento.usuario?.email || 'Usuario desconocido'}
                    </div>
                  </div>
                  <div style={{ color: '#333', fontSize: '0.95rem' }}>{renderEventDetails(evento)}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {actionError && <div style={{ color: '#a00', marginTop: '1rem' }}>{actionError}</div>}
    </div>
  );
};

export default RequestDetailPage;
