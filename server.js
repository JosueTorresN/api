const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

const { detectBranch, determineDatabase, initializeServer } = require('./config/database');

app.use(cors());
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
    
    if (!address) {
      return res.status(400).json({ error: 'Dirección requerida' });
    }

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