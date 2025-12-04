const { getConnection, sql } = require('../config/database');

const inventariosController = {
  getOpcionesCombobox: async (req, res) => {
    try {
      const pool = await getConnection(req.database);
      
      // Ejecutar todos los stored procedures para obtener las opciones
      const [proveedoresResult, coloresResult, tiposPaqueteResult, gruposStockResult] = await Promise.all([
        pool.request().execute('sp_GetProveedoresSeleccion'),
        pool.request().execute('sp_GetColores'),
        pool.request().execute('sp_GetTiposPaquete'),
        pool.request().execute('sp_GetGruposStock')
      ]);

      res.json({
        proveedores: proveedoresResult.recordset || [],
        colores: coloresResult.recordset || [],
        tiposPaquete: tiposPaqueteResult.recordset || [],
        gruposStock: gruposStockResult.recordset || []
      });
    } catch (error) {
      console.error('Error en getOpcionesCombobox:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getInventarios: async (req, res) => {
    try {
      const { filtroNombre, filtroGrupo, page = 1, pageSize = 50 } = req.query;
      const pool = await getConnection(req.database);
      
      const request = pool.request()
        .input('PageNumber', sql.Int, parseInt(page))
        .input('PageSize', sql.Int, parseInt(pageSize));
      
      if (filtroNombre) {
        request.input('FiltroNombre', sql.NVarChar, filtroNombre);
      }
      
      if (filtroGrupo && filtroGrupo !== 'all') {
        request.input('FiltroGrupo', sql.NVarChar, filtroGrupo);
      }
      
      // Ejecutar el stored procedure para obtener los productos
      const result = await request.execute('sp_GetInventarios');
      
      // Obtener el total de registros
      const totalRequest = pool.request();
      if (filtroNombre) {
        totalRequest.input('FiltroNombre', sql.NVarChar, filtroNombre);
      }
      if (filtroGrupo && filtroGrupo !== 'all') {
        totalRequest.input('FiltroGrupo', sql.NVarChar, filtroGrupo);
      }
      
      const totalResult = await totalRequest.execute('sp_GetTotalInventarios');
      const total = totalResult.recordset[0]?.Total || 0;
      
      res.json({
        inventarios: result.recordset || [],
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total
        }
      });
    } catch (error) {
      console.error('Error en getInventarios:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    }
  },

  getProductoDetalles: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('StockItemID', sql.Int, id)
        .execute('sp_GetProductoDetalles');
        
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getProductoDetalles:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getProductoEdicion: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('StockItemID', sql.Int, id)
        .execute('sp_GetProductoEdicion');
        
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(result.recordset[0]);
    } catch (error) {
      console.error('Error en getProductoEdicion:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  createProducto: async (req, res) => {
    try {
      const {
        StockItemName,
        SupplierName,
        ColorName,
        UnitPackageName,
        OuterPackageName,
        QuantityPerOuter,
        Brand,
        Size,
        TaxRate,
        UnitPrice,
        RecommendedRetailPrice,
        LeadTimeDays,
        Barcode,
        IsChillerStock,
        TypicalWeightPerUnit,
        MarketingComments,
        InternalComments,
        StockGroupNames
      } = req.body;

      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('StockItemName', sql.NVarChar, StockItemName)
        .input('SupplierName', sql.NVarChar, SupplierName)
        .input('ColorName', sql.NVarChar, ColorName || '')
        .input('UnitPackageName', sql.NVarChar, UnitPackageName)
        .input('OuterPackageName', sql.NVarChar, OuterPackageName)
        .input('QuantityPerOuter', sql.Int, QuantityPerOuter)
        .input('Brand', sql.NVarChar, Brand || '')
        .input('Size', sql.NVarChar, Size || '')
        .input('TaxRate', sql.Decimal(18,3), TaxRate)
        .input('UnitPrice', sql.Decimal(18,2), UnitPrice)
        .input('RecommendedRetailPrice', sql.Decimal(18,2), RecommendedRetailPrice || null)
        .input('LeadTimeDays', sql.Int, LeadTimeDays)
        .input('Barcode', sql.NVarChar, Barcode || '')
        .input('IsChillerStock', sql.Bit, IsChillerStock || false)
        .input('TypicalWeightPerUnit', sql.Decimal(18,3), TypicalWeightPerUnit || 1.0)
        .input('MarketingComments', sql.NVarChar, MarketingComments || '')
        .input('InternalComments', sql.NVarChar, InternalComments || '')
        .input('StockGroupNames', sql.NVarChar, StockGroupNames || '')
        .execute('sp_CreateProductoCompleto');

      res.status(201).json({ 
        message: 'Producto creado exitosamente', 
        id: result.recordset[0]?.NewStockItemID 
      });
    } catch (error) {
      console.error('Error en createProducto:', error);
      
      let errorMessage = 'Error interno del servidor';
      if (error.message.includes('Proveedor no encontrado')) {
        errorMessage = 'El proveedor seleccionado no existe';
      } else if (error.message.includes('Tipo de paquete')) {
        errorMessage = 'El tipo de paquete seleccionado no existe';
      } else if (error.message.includes('Ya existe un producto')) {
        errorMessage = 'Ya existe un producto con ese nombre';
      }
      
      res.status(500).json({ error: errorMessage, details: error.message });
    }
  },

  updateProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        StockItemName,
        SupplierName,
        ColorName,
        UnitPackageName,
        OuterPackageName,
        QuantityPerOuter,
        Brand,
        Size,
        TaxRate,
        UnitPrice,
        RecommendedRetailPrice,
        LeadTimeDays,
        Barcode,
        IsChillerStock,
        TypicalWeightPerUnit,
        MarketingComments,
        InternalComments,
        StockGroupNames
      } = req.body;

      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('StockItemID', sql.Int, id)
        .input('StockItemName', sql.NVarChar, StockItemName)
        .input('SupplierName', sql.NVarChar, SupplierName)
        .input('ColorName', sql.NVarChar, ColorName || '')
        .input('UnitPackageName', sql.NVarChar, UnitPackageName)
        .input('OuterPackageName', sql.NVarChar, OuterPackageName)
        .input('QuantityPerOuter', sql.Int, QuantityPerOuter)
        .input('Brand', sql.NVarChar, Brand || '')
        .input('Size', sql.NVarChar, Size || '')
        .input('TaxRate', sql.Decimal(18,3), TaxRate)
        .input('UnitPrice', sql.Decimal(18,2), UnitPrice)
        .input('RecommendedRetailPrice', sql.Decimal(18,2), RecommendedRetailPrice || null)
        .input('LeadTimeDays', sql.Int, LeadTimeDays)
        .input('Barcode', sql.NVarChar, Barcode || '')
        .input('IsChillerStock', sql.Bit, IsChillerStock || false)
        .input('TypicalWeightPerUnit', sql.Decimal(18,3), TypicalWeightPerUnit || 1.0)
        .input('MarketingComments', sql.NVarChar, MarketingComments || '')
        .input('InternalComments', sql.NVarChar, InternalComments || '')
        .input('StockGroupNames', sql.NVarChar, StockGroupNames || '')
        .execute('sp_UpdateProductoCompleto');

      res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
      console.error('Error en updateProducto:', error);
      
      let errorMessage = 'Error interno del servidor';
      if (error.message.includes('Producto no encontrado')) {
        errorMessage = 'El producto que intenta modificar no existe';
      } else if (error.message.includes('Ya existe un producto')) {
        errorMessage = 'Ya existe un producto con ese nombre';
      } else if (error.message.includes('Proveedor no encontrado') || error.message.includes('Tipo de paquete')) {
        errorMessage = 'Los datos de referencia no existen';
      }
      
      res.status(500).json({ error: errorMessage, details: error.message });
    }
  },

  deleteProducto: async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getConnection(req.database);
      const result = await pool.request()
        .input('StockItemID', sql.Int, id)
        .execute('sp_DeleteProducto');

      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      console.error('Error en deleteProducto:', error);
      
      let errorMessage = 'Error interno del servidor';
      if (error.message.includes('No se puede eliminar')) {
        errorMessage = 'El producto tiene registros relacionados y no se puede eliminar';
      } else if (error.message.includes('no existe')) {
        errorMessage = 'El producto no existe';
      }
      
      res.status(500).json({ error: errorMessage, details: error.message });
    }
  }
};

module.exports = inventariosController;