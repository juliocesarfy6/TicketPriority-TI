const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/evaluate.controller');

router.post('/', ctrl.evaluateAll); // calcula SAW para todos los tickets y guarda resultados
router.get('/matrix', ctrl.getMatrixPreview); // (opcional) devuelve matriz de valores para debug

module.exports = router;
