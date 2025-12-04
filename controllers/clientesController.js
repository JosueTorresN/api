const { getConnection, sql } = require('../config/database');

const clientesController = {
  getClientes: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { page = 1, pageSize = 50, filtroNombre, filtroCategoria, filtroMetodoEntrega } = req.query;

      const result = await pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize))
        .input('FiltroNombre', sql.NVarChar(100), filtroNombre || null)
        .input('FiltroCategoria', sql.NVarChar(100), filtroCategoria || null)
        .input('FiltroMetodoEntrega', sql.NVarChar(100), filtroMetodoEntrega || null)
        .execute('sp_GetClientes');

      // Obtener total
      const totalResult = await pool.request()
        .input('FiltroNombre', sql.NVarChar(100), filtroNombre || null)
        .input('FiltroCategoria', sql.NVarChar(100), filtroCategoria || null)
        .input('FiltroMetodoEntrega', sql.NVarChar(100), filtroMetodoEntrega || null)
        .execute('sp_GetTotalClientes');

      res.json({
        clientes: result.recordset,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: totalResult.recordset[0].Total
        }
      });
    } catch (error) {
      console.error('Error en getClientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getClienteDetalles: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { id } = req.params;

      const result = await pool.request()
        .input('CustomerID', sql.Int, parseInt(id))
        .execute('sp_GetClienteDetalles');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getClienteDetalles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = clientesController;