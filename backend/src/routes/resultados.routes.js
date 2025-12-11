const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/resultados.controller');

router.get('/', ctrl.getAll);

module.exports = router;
