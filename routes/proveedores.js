const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/', proveedoresController.getProveedores);
router.get('/:id', proveedoresController.getProveedorDetalles);

module.exports = router;