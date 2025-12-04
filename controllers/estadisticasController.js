const { getConnection, sql } = require('../config/database');

const estadisticasController = {
  getEstadisticasComprasProveedores: async (req, res) => {
    try {
      // Estadísticas siempre se consultan desde corporativo
      const pool = await getConnection('CORP');
      const { page = 1, pageSize = 50, filtro } = req.query;

      const result = await pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize))
        .input('Filtro', sql.NVarChar(100), filtro || null)
        .execute('sp_EstadisticasComprasProveedores');

      res.json({
        estadisticas: result.recordset,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('Error en getEstadisticasComprasProveedores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getEstadisticasVentasClientes: async (req, res) => {
    try {
      const pool = await getConnection('CORP');
      const { page = 1, pageSize = 50, filtro } = req.query;

      const result = await pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize))
        .input('Filtro', sql.NVarChar(100), filtro || null)
        .execute('sp_EstadisticasVentasClientes');

      res.json({
        estadisticas: result.recordset,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      console.error('Error en getEstadisticasVentasClientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getTop5ProductosGanancia: async (req, res) => {
    try {
      const pool = await getConnection('CORP');
      const { anio } = req.query;

      if (!anio) {
        return res.status(400).json({ error: 'El parámetro año es requerido' });
      }

      const result = await pool.request()
        .input('Anio', sql.Int, parseInt(anio))
        .execute('sp_Top5ProductosGanancia');

      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getTop5ProductosGanancia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getTop5ClientesFacturas: async (req, res) => {
    try {
      const pool = await getConnection('CORP');
      const { anioInicio, anioFin } = req.query;

      if (!anioInicio || !anioFin) {
        return res.status(400).json({ error: 'Los parámetros anioInicio y anioFin son requeridos' });
      }

      const result = await pool.request()
        .input('AnioInicio', sql.Int, parseInt(anioInicio))
        .input('AnioFin', sql.Int, parseInt(anioFin))
        .execute('sp_Top5ClientesFacturas');

      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getTop5ClientesFacturas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getTop5ProveedoresOrdenes: async (req, res) => {
    try {
      const pool = await getConnection('CORP');
      const { anioInicio, anioFin } = req.query;

      if (!anioInicio || !anioFin) {
        return res.status(400).json({ error: 'Los parámetros anioInicio y anioFin son requeridos' });
      }

      const result = await pool.request()
        .input('AnioInicio', sql.Int, parseInt(anioInicio))
        .input('AnioFin', sql.Int, parseInt(anioFin))
        .execute('sp_Top5ProveedoresOrdenes');

      res.json(result.recordset);
    } catch (error) {
      console.error('Error en getTop5ProveedoresOrdenes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = estadisticasController;