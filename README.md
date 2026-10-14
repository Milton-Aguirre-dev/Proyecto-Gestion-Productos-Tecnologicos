# Control de Equipos

## Descripción

Aplicación de control de solicitudes de equipamiento con backend en Node.js + Express y frontend en React.

## Cómo ejecutar

### Backend

1. Abrir terminal en `backend/`
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Cargar datos de prueba:
   ```bash
   node seed.js
   ```
4. Ejecutar el backend:
   ```bash
   npm start
   ```

### Frontend

1. Abrir terminal en `frontend/`
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar el frontend:
   ```bash
   npm start
   ```

## Usuarios de prueba

- Admin
  - Email: `admin@example.com`
  - Contraseña: `Password123`
  - Rol: `admin`
- Encargado
  - Email: `maria.lopez@example.com`
  - Contraseña: `Password123`
  - Rol: `encargado`
- Usuario
  - Email: `laura.perez@example.com`
  - Contraseña: `Password123`
  - Rol: `usuario`

## Endpoints principales del backend

- `POST /api/auth/register` — registro de usuario.
- `POST /api/auth/login` — inicio de sesión y emisión de JWT.
- `GET /api/equipos` — listado de equipos.
- `GET /api/equipos/:id` — detalle de equipo.
- `GET /api/solicitudes` — listado de solicitudes (filtrable).
- `POST /api/solicitudes` — crear nueva solicitud.
- `GET /api/solicitudes/:id` — obtener detalle de solicitud.
- `PUT /api/solicitudes/:id` — editar solicitud pendiente.
- `POST /api/solicitudes/:id/cancel` — cancelar solicitud.
- `POST /api/solicitudes/:id/decision` — aprobar/rechazar solicitud.
- `POST /api/solicitudes/:id/devolver` — marcar solicitud aprobada como devuelta.
- `GET /api/solicitudes/resumen` — obtener resumen administrativo.

## Rutas principales del frontend

- `/` — página de inicio.
- `/login` — iniciar sesión.
- `/register` — registro de usuario.
- `/profile` — perfil del usuario autenticado.
- `/solicitudes` — listado de solicitudes.
- `/solicitudes/new` — formulario de creación de solicitud.
- `/solicitudes/:id` — detalle y acciones sobre solicitud.
- `/equipos/:id` — detalle de equipo.
- `/solicitudes/resumen` — resumen administrativo (solo `admin`/`encargado`).

## Disponibilidad de equipo y autorización de préstamos

- Un equipo puede estar en estados como `disponible`, `prestado`, `mantenimiento`, o `baja`.
- Solo los equipos con `estado: 'disponible'` pueden solicitarse.
- Antes de crear una solicitud se valida que no exista otra solicitud aprobada con fechas superpuestas para el mismo equipo.
- Al aprobar una solicitud, el equipo cambia a `prestado`.
- Al devolver una solicitud aprobada, el equipo vuelve a `disponible`.
- El campo `requiereAutorizacion` está disponible en el modelo de equipo, y la aplicación exige que solo `admin` o `encargado` aprueben/rechacen solicitudes.

## Autenticación, JWT, roles y permisos

- El backend utiliza JWT con el secreto definido en `process.env.JWT_SECRET` o `clave_secreta` por defecto.
- El token incluye únicamente `id`, `email` y `rol`.
- El middleware `verificarToken` valida el JWT y adjunta `req.usuario`.
- El middleware `soloAdminOEncargado` restringe acciones administrativas como decidir y devolver solicitudes.
- En el frontend, `AuthContext` conserva el token y el usuario autenticado en `localStorage`.
- `ProtectedRoute` bloquea rutas según autenticación y roles.
- Las verificaciones de seguridad se aplican en frontend y se refuerzan en backend.

## Pruebas

Ejecutar las pruebas del backend:

```bash
cd backend
npm test -- --runInBand
```

## Limitaciones conocidas

- El seed de prueba usa la misma contraseña `Password123` para todos los usuarios.
- La lógica de autorización se basa en roles y en el estado del equipo, pero no implementa flujos avanzados de autorización por equipo.
- No hay integración de correo electrónico ni recuperación de contraseña.
- JWT no tiene refresh token, es válido por 24 horas.
- SQLite es adecuado para desarrollo; para producción se recomienda un motor más robusto.

## Estructura de carpetas

- `backend/`
  - `app.js`: servidor Express principal y configuración de middleware.
  - `server.js`: arranca el servidor.
  - `src/models/`: modelos Sequelize y asociaciones.
  - `src/controllers/`: lógica de HTTP y controladores.
  - `src/services/`: reglas de negocio y operaciones con datos.
  - `src/routes/`: definición de rutas y protecciones.
  - `src/middlewares/`: autenticación, autorización, validación y manejo de errores.
  - `seed.js`: datos iniciales de prueba.

- `frontend/`
  - `src/context/AuthContext.js`: estado global de autenticación, token y rol.
  - `src/routes/ProtectedRoute.js`: rutas protegidas por autenticación y roles.
  - `src/services/`: servicios Axios separados por recurso (`api`, `authService`, `equipmentService`, `solicitudService`).
  - `src/pages/`: pantallas con formularios y validaciones de UX.
