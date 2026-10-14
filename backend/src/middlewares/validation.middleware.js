const validateBody = (requiredFields) => (req, res, next) => {
  const errors = [];

  requiredFields.forEach((field) => {
    const value = req.body[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`El campo '${field}' es requerido`);
    }
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

module.exports = {
  validateBody,
};
