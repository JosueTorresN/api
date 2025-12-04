const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login
router.post('/login', authController.login);

// Obtener usuario actual
router.get('/me', authController.getCurrentUser);

module.exports = router;