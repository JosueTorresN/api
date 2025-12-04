const sql = require('mssql');

// Configuración de bases de datos
const databases = [
  { name: 'WWISJ', server: '100.78.216.52' },
  { name: 'WWILM', server: '100.82.130.27' },
  { name: 'WWICorp', server: '100.82.130.27' }
];

async function testConnection(dbConfig) {
  const config = {
    server: dbConfig.server,
    database: dbConfig.name,
    user: 'sa',
    password: 'raspberry',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 5000,
      requestTimeout: 5000
    }
  };

  try {
    console.log(`\n🔍 Probando conexión a ${dbConfig.name} (${dbConfig.server})...`);
    
    const pool = await sql.connect(config);
    console.log(`✅ CONEXIÓN EXITOSA a ${dbConfig.name}`);
    
    // Probar una consulta simple
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log(`📊 Servidor respondió correctamente`);
    
    await pool.close();
    return true;
  } catch (error) {
    console.log(`❌ ERROR conectando a ${dbConfig.name}:`, error.message);
    return false;
  }
}

async function testAllConnections() {
  console.log('🧪 INICIANDO PRUEBAS DE CONEXIÓN...\n');
  
  let successCount = 0;
  
  for (const db of databases) {
    const success = await testConnection(db);
    if (success) successCount++;
  }
  
  console.log(`\n📈 RESULTADO: ${successCount}/${databases.length} conexiones exitosas`);
  
  if (successCount === databases.length) {
    console.log('🎉 ¡Todas las conexiones funcionan correctamente!');
  } else {
    console.log('⚠️  Algunas conexiones fallaron. Revisa la configuración.');
  }
}

testAllConnections();