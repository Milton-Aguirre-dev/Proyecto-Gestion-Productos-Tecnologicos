require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Equipo, Solicitud } = require('./src/models');

const buildDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const seed = async () => {
  try {
    await sequelize.sync({ force: true });

    // Seed usa bcrypt para simular contraseñas seguras.
    // Todos los usuarios creados con este seed tienen la misma contraseña: Password123
    const passwordHash = await bcrypt.hash('Password123', 10);

    const usuarios = await Usuario.bulkCreate([
      { nombre: 'Laura Pérez', email: 'laura.perez@example.com', passwordHash, rol: 'usuario' },
      { nombre: 'Diego Gómez', email: 'diego.gomez@example.com', passwordHash, rol: 'usuario' },
      { nombre: 'María López', email: 'maria.lopez@example.com', passwordHash, rol: 'encargado' },
      { nombre: 'Admin Central', email: 'admin@example.com', passwordHash, rol: 'admin' },
    ]);

    const equipos = await Equipo.bulkCreate([
      { codigoInventario: 'NBK-001', nombre: 'Notebook Dell', categoria: 'notebook', estado: 'disponible', ubicacion: 'Aula 1', requiereAutorizacion: false },
      { codigoInventario: 'NBK-002', nombre: 'Notebook HP', categoria: 'notebook', estado: 'prestado', ubicacion: 'Aula 2', requiereAutorizacion: false },
      { codigoInventario: 'PRY-001', nombre: 'Proyector Epson', categoria: 'proyector', estado: 'mantenimiento', ubicacion: 'Sala de reuniones', requiereAutorizacion: true },
      { codigoInventario: 'PRY-002', nombre: 'Proyector BenQ', categoria: 'proyector', estado: 'disponible', ubicacion: 'Aula 3', requiereAutorizacion: true },
      { codigoInventario: 'CAM-001', nombre: 'Cámara Canon', categoria: 'cámara', estado: 'disponible', ubicacion: 'Depósito', requiereAutorizacion: false },
      { codigoInventario: 'CAM-002', nombre: 'Cámara Sony', categoria: 'cámara', estado: 'baja', ubicacion: 'Depósito', requiereAutorizacion: false },
      { codigoInventario: 'KIT-001', nombre: 'Kit de red básico', categoria: 'kit de red', estado: 'disponible', ubicacion: 'Laboratorio', requiereAutorizacion: true },
      { codigoInventario: 'KIT-002', nombre: 'Kit de red avanzado', categoria: 'kit de red', estado: 'prestado', ubicacion: 'Laboratorio', requiereAutorizacion: true },
    ]);

    const [usuario1, usuario2, encargado, admin] = usuarios;
    const [notebook1, notebook2, proyector1, proyector2, camara1, camara2, kit1, kit2] = equipos;

    await Solicitud.bulkCreate([
      { equipoId: notebook1.id, usuarioId: usuario1.id, fechaRetiro: buildDate(-3), fechaDevolucion: buildDate(4), motivo: 'Trabajo de tesis', estado: 'pendiente' },
      { equipoId: proyector1.id, usuarioId: usuario2.id, fechaRetiro: buildDate(0), fechaDevolucion: buildDate(2), motivo: 'Presentación de proyecto', estado: 'aprobada', autorizadoPor: encargado.id },
      { equipoId: camara1.id, usuarioId: usuario1.id, fechaRetiro: buildDate(-10), fechaDevolucion: buildDate(-2), motivo: 'Registro de evento', estado: 'devuelta', autorizadoPor: encargado.id },
      { equipoId: kit1.id, usuarioId: usuario2.id, fechaRetiro: buildDate(-5), fechaDevolucion: buildDate(1), motivo: 'Instalación de red', estado: 'aprobada', autorizadoPor: admin.id },
      { equipoId: notebook2.id, usuarioId: usuario1.id, fechaRetiro: buildDate(-15), fechaDevolucion: buildDate(-1), motivo: 'Examen práctico', estado: 'rechazada' },
      { equipoId: proyector2.id, usuarioId: usuario2.id, fechaRetiro: buildDate(3), fechaDevolucion: buildDate(5), motivo: 'Clase especial', estado: 'pendiente' },
      { equipoId: camara2.id, usuarioId: usuario1.id, fechaRetiro: buildDate(2), fechaDevolucion: buildDate(7), motivo: 'Grabación de contenido', estado: 'pendiente' },
      { equipoId: kit2.id, usuarioId: usuario2.id, fechaRetiro: buildDate(-20), fechaDevolucion: buildDate(-10), motivo: 'Prueba de red', estado: 'cancelada' },
      { equipoId: notebook1.id, usuarioId: usuario1.id, fechaRetiro: buildDate(-8), fechaDevolucion: buildDate(-3), motivo: 'Capacitación', estado: 'aprobada', autorizadoPor: encargado.id },
      { equipoId: proyector1.id, usuarioId: usuario2.id, fechaRetiro: buildDate(-9), fechaDevolucion: buildDate(-4), motivo: 'Reunión con docente', estado: 'devuelta', autorizadoPor: admin.id },
      { equipoId: camara1.id, usuarioId: usuario1.id, fechaRetiro: buildDate(-1), fechaDevolucion: buildDate(6), motivo: 'Proyecto audiovisual', estado: 'aprobada', autorizadoPor: encargado.id },
      { equipoId: kit1.id, usuarioId: usuario2.id, fechaRetiro: buildDate(1), fechaDevolucion: buildDate(8), motivo: 'Instalación temporal', estado: 'pendiente' },
    ]);

    console.log('Seed ejecutado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  }
};

seed();
