const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const helmet = require('helmet'); // <--- 1. Importar Helmet

const app = express();
const PORT = process.env.PORT || 3000;

// <--- 2. Implementar correcciones de seguridad aquí --->
app.disable('x-powered-by'); // Deshabilita explícitamente la cabecera (CWE-200)
app.use(helmet());           // Cabeceras de seguridad HTTP (HSTS, XSS Filter, etc.)

app.set('trust proxy', true);

const { detectBranch, determineDatabase, initializeServer } = require('./config/database');

// Configuración de CORS segura (Mejora recomendada para CWE-942)
// En lugar de app.use(cors()); usa una configuración restrictiva:
const corsOptions = {
  origin: 'http://localhost:3000', // O el dominio de tu frontend real
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(requestIp.mw({
  attributeName: 'clientRealIp'
}));

app.use(detectBranch);
app.use(determineDatabase);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/inventarios', require('./routes/inventarios'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/filtros', require('./routes/filtros'));

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        branch: req.branch,
        database: req.database || 'No determinado'
    });
});

app.get('/api/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    // Validación básica de entrada (Mitigación CWE-20)
    if (!address || typeof address !== 'string' || address.length > 100) {
      return res.status(400).json({ error: 'Dirección inválida o requerida' });
    }

    // Se mantiene la funcionalidad original
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return res.json({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        });
      }
    }
    
    res.status(404).json({ error: 'No se encontraron resultados' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

initializeServer().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
  });
});