const express = require('express');
const router = express.Router();
const filtrosController = require('../controllers/filtrosController');

router.get('/clientes', filtrosController.getFiltrosClientes);
router.get('/proveedores', filtrosController.getFiltrosProveedores);
router.get('/inventarios', filtrosController.getFiltrosInventarios);
router.get('/ventas', filtrosController.getFiltrosVentas);
router.get('/estadisticas', filtrosController.getFiltrosEstadisticas);
router.get('/anios', filtrosController.getAniosDisponibles);
router.get('/ciudades', filtrosController.getCiudades);
router.get('/metodos-entrega', filtrosController.getMetodosEntrega);

module.exports = router;