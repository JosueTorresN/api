const { getConnection, sql } = require('../config/database');

const authController = {
  login: async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      res.json({
        success: true,
        user: {
          id: req.user.iduser,
          username: req.user.username,
          fullname: req.user.fullname,
          email: req.user.email,
          rol: req.user.rol,
          branch: req.user.branch,
          active: req.user.active,
          hiredate: req.user.hiredate
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getCurrentUser: (req, res) => {
    if (req.user) {
      res.json({
        user: {
          id: req.user.iduser,
          username: req.user.username,
          fullname: req.user.fullname,
          email: req.user.email,
          rol: req.user.rol,
          branch: req.user.branch,
          active: req.user.active,
          hiredate: req.user.hiredate
        }
      });
    } else {
      res.status(401).json({ error: 'No autenticado' });
    }
  }
};

module.exports = authController;