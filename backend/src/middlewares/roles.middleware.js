const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos suficientes' });
  }

  next();
};

const soloAdminOEncargado = (req, res, next) => {
  if (!req.usuario || !['admin', 'encargado'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Sin permisos suficientes' });
  }

  next();
};

module.exports = {
  soloAdmin,
  soloAdminOEncargado,
};
