const express = require('express');
const router = express.Router();
const inventariosController = require('../controllers/inventariosController');

router.get('/opciones', inventariosController.getOpcionesCombobox);
router.get('/', inventariosController.getInventarios);
router.get('/:id', inventariosController.getProductoDetalles);
router.get('/:id/editar', inventariosController.getProductoEdicion);
router.post('/', inventariosController.createProducto);
router.put('/:id', inventariosController.updateProducto);
router.delete('/:id', inventariosController.deleteProducto);

module.exports = router;