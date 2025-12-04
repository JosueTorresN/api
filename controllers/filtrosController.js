const { getConnection, sql } = require('../config/database');

const filtrosController = {
  getFiltrosClientes: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetFiltrosClientes');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getFiltrosClientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getFiltrosProveedores: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetFiltrosProveedores');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getFiltrosProveedores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getFiltrosInventarios: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetFiltrosInventarios');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getFiltrosInventarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getFiltrosVentas: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetFiltrosVentas');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getFiltrosVentas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getFiltrosEstadisticas: async (req, res) => {
    try {
      const pool = await getConnection('CORP');
      const result = await pool.request().execute('sp_GetFiltrosEstadisticas');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getFiltrosEstadisticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getAniosDisponibles: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { modulo } = req.query;
      
      const result = await pool.request()
        .input('Modulo', sql.NVarChar(50), modulo || null)
        .execute('sp_GetAniosDisponibles');

      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getAniosDisponibles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getCiudades: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetCiudades');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getCiudades:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getMetodosEntrega: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const result = await pool.request().execute('sp_GetMetodosEntrega');
      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getMetodosEntrega:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = filtrosController;