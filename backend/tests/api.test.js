const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../app');
const { sequelize, Usuario, Equipo, Solicitud } = require('../src/models');

const PASSWORD = 'Password123';
let userToken;
let adminToken;
let encargadoToken;
let approvedSolicitudId;
let cancelledSolicitudId;
let pendingSolicitudId;

const buildDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const login = async (email) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: PASSWORD });
  return response.body.token;
};

const setupDatabase = async () => {
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const usuario = await Usuario.create({ nombre: 'Laura Pérez', email: 'laura.perez@example.com', passwordHash, rol: 'usuario' });
  const usuario2 = await Usuario.create({ nombre: 'Diego Gómez', email: 'diego.gomez@example.com', passwordHash, rol: 'usuario' });
  const encargado = await Usuario.create({ nombre: 'María López', email: 'maria.lopez@example.com', passwordHash, rol: 'encargado' });
  const admin = await Usuario.create({ nombre: 'Admin Central', email: 'admin@example.com', passwordHash, rol: 'admin' });

  const disponibleEquipo = await Equipo.create({
    codigoInventario: 'EQ-001',
    nombre: 'Equipo Disponible',
    categoria: 'notebook',
    estado: 'disponible',
    ubicacion: 'Aula 1',
    requiereAutorizacion: false,
  });
  const prestadoEquipo = await Equipo.create({
    codigoInventario: 'EQ-002',
    nombre: 'Equipo Prestado',
    categoria: 'notebook',
    estado: 'prestado',
    ubicacion: 'Aula 2',
    requiereAutorizacion: false,
  });
  const prestamoEquipo = await Equipo.create({
    codigoInventario: 'EQ-003',
    nombre: 'Equipo Para Prueba',
    categoria: 'proyector',
    estado: 'disponible',
    ubicacion: 'Sala 3',
    requiereAutorizacion: true,
  });

  const approvedSolicitud = await Solicitud.create({
    equipoId: prestamoEquipo.id,
    usuarioId: usuario.id,
    fechaRetiro: buildDate(-3),
    fechaDevolucion: buildDate(3),
    motivo: 'Solicitud aprobada existente',
    estado: 'aprobada',
    autorizadoPor: encargado.id,
  });

  const cancelledSolicitud = await Solicitud.create({
    equipoId: disponibleEquipo.id,
    usuarioId: usuario.id,
    fechaRetiro: buildDate(5),
    fechaDevolucion: buildDate(10),
    motivo: 'Solicitud cancelada',
    estado: 'cancelada',
  });

  const pendingSolicitud = await Solicitud.create({
    equipoId: disponibleEquipo.id,
    usuarioId: usuario.id,
    fechaRetiro: buildDate(7),
    fechaDevolucion: buildDate(12),
    motivo: 'Solicitud pendiente existente',
    estado: 'pendiente',
  });

  approvedSolicitudId = approvedSolicitud.id;
  cancelledSolicitudId = cancelledSolicitud.id;
  pendingSolicitudId = pendingSolicitud.id;

  userToken = await login('laura.perez@example.com');
  adminToken = await login('admin@example.com');
  encargadoToken = await login('maria.lopez@example.com');
};

beforeEach(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Backend API tests', () => {
  test('Login correcto retorna token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'laura.perez@example.com', password: PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  test('Login inválido retorna 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'laura.perez@example.com', password: 'wrongpass' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('Listado de solicitudes sin filtros', async () => {
    const response = await request(app)
      .get('/api/solicitudes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
  });

  test('Listado de solicitudes con filtro por estado', async () => {
    const response = await request(app)
      .get('/api/solicitudes')
      .query({ estado: 'pendiente' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.every((item) => item.estado === 'pendiente')).toBe(true);
  });

  test('Detalle de solicitud existente', async () => {
    const response = await request(app)
      .get(`/api/solicitudes/${approvedSolicitudId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', approvedSolicitudId);
    expect(response.body).toHaveProperty('estado', 'aprobada');
  });

  test('Detalle de solicitud inexistente retorna 404', async () => {
    const response = await request(app)
      .get('/api/solicitudes/99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  test('Creación válida de una solicitud retorna 201', async () => {
    const response = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        equipoId: 1,
        fechaRetiro: buildDate(15),
        fechaDevolucion: buildDate(18),
        motivo: 'Nueva solicitud válida',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('estado', 'pendiente');
  });

  test('Creación inválida por fechas inconsistentes retorna 400', async () => {
    const response = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        equipoId: 1,
        fechaRetiro: buildDate(10),
        fechaDevolucion: buildDate(5),
        motivo: 'Fechas inválidas',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Creación inválida por equipo no disponible o superposición retorna 400', async () => {
    const response = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        equipoId: 2,
        fechaRetiro: buildDate(5),
        fechaDevolucion: buildDate(8),
        motivo: 'Equipo no disponible',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Acceso sin JWT a ruta protegida retorna 401', async () => {
    const response = await request(app).get('/api/solicitudes');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  test('Acceso con usuario a acción admin/encargado retorna 403', async () => {
    const response = await request(app)
      .post(`/api/solicitudes/${approvedSolicitudId}/devolver`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  });

  test('Devolución inválida de solicitud no aprobada retorna 400', async () => {
    const response = await request(app)
      .post(`/api/solicitudes/${pendingSolicitudId}/devolver`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Aprobar solicitud cancelada no permitido retorna 400', async () => {
    const response = await request(app)
      .post(`/api/solicitudes/${cancelledSolicitudId}/decision`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'aprobar' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
