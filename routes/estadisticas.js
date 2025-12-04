const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

router.get('/compras-proveedores', estadisticasController.getEstadisticasComprasProveedores);
router.get('/ventas-clientes', estadisticasController.getEstadisticasVentasClientes);
router.get('/top5-productos-ganancia', estadisticasController.getTop5ProductosGanancia);
router.get('/top5-clientes-facturas', estadisticasController.getTop5ClientesFacturas);
router.get('/top5-proveedores-ordenes', estadisticasController.getTop5ProveedoresOrdenes);

module.exports = router;