const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validateBody } = require('../middlewares/validation.middleware');

const router = express.Router();

router.post('/register', validateBody(['nombre', 'email', 'password']), register);
router.post('/login', validateBody(['email', 'password']), login);

module.exports = router;
