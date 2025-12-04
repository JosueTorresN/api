const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

// Todas las rutas requieren autenticación y determinación de base de datos
router.get('/', clientesController.getClientes);
router.get('/:id', clientesController.getClienteDetalles);

module.exports = router;