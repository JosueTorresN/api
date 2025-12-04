const { getConnection, sql } = require('../config/database');

const ventasController = {
  getVentas: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { 
        page = 1, 
        pageSize = 50, 
        filtroCliente, 
        fechaInicio, 
        fechaFin, 
        metodoEntrega,
        montoMin,
        montoMax
      } = req.query;

      const result = await pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize))
        .input('FiltroCliente', sql.NVarChar(100), filtroCliente || null)
        .input('FechaInicio', sql.Date, fechaInicio || null)
        .input('FechaFin', sql.Date, fechaFin || null)
        .input('MetodoEntrega', sql.NVarChar(100), metodoEntrega || null)
        .input('MontoMin', sql.Decimal(18, 2), montoMin ? parseFloat(montoMin) : null)
        .input('MontoMax', sql.Decimal(18, 2), montoMax ? parseFloat(montoMax) : null)
        .execute('sp_GetVentas');

      // Obtener total
      const totalResult = await pool.request()
        .input('FiltroCliente', sql.NVarChar(100), filtroCliente || null)
        .input('FechaInicio', sql.Date, fechaInicio || null)
        .input('FechaFin', sql.Date, fechaFin || null)
        .input('MetodoEntrega', sql.NVarChar(100), metodoEntrega || null)
        .input('MontoMin', sql.Decimal(18, 2), montoMin ? parseFloat(montoMin) : null)
        .input('MontoMax', sql.Decimal(18, 2), montoMax ? parseFloat(montoMax) : null)
        .execute('sp_GetTotalVentas');

      res.json({
        ventas: result.recordset,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: totalResult.recordset[0].Total
        }
      });
    } catch (error) {
      console.error('Error en getVentas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getVentaDetalles: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      const { id } = req.params;

      const result = await pool.request()
        .input('InvoiceID', sql.Int, parseInt(id))
        .execute('sp_GetVentaDetalles');

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Venta no encontrada' });
      }

      // El procedimiento devuelve múltiples resultsets
      const encabezado = result.recordset[0];
      
      // Avanzar al siguiente resultset para los detalles
      const nextResult = await result.nextResult();
      const detalles = nextResult.recordset;

      res.json({
        encabezado,
        detalles
      });
    } catch (error) {
      console.error('Error en getVentaDetalles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = ventasController;