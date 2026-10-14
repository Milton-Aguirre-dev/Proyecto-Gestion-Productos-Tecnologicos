const cors = require('cors');
const express = require('express');
const { errorHandler } = require('./src/middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const authRoutes = require('./src/routes/auth.routes');
const equipoRoutes = require('./src/routes/equipo.routes');
const solicitudRoutes = require('./src/routes/solicitud.routes');

app.use('/api/auth', authRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/solicitudes', solicitudRoutes);

app.use(errorHandler);

module.exports = app;
