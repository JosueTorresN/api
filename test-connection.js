require('dotenv').config(); // 1. Cargar variables de entorno
const sql = require('mssql');

// 2. Configuración dinámica usando las variables del .env
// Esto corrige CWE-798 al no tener IPs ni credenciales visibles
const databases = [
  { 
    name: 'WWISJ', 
    server: process.env.DB_SERVER_SJ,
    user: process.env.DB_USER_SJ,
    password: process.env.DB_PASSWORD_SJ
  },
  { 
    name: 'WWILM', 
    server: process.env.DB_SERVER_REMOTE,
    user: process.env.DB_USER_REMOTE,      // Usa las credenciales correctas para remotos
    password: process.env.DB_PASSWORD_REMOTE
  },
  { 
    name: 'WWICorp', 
    server: process.env.DB_SERVER_REMOTE,
    user: process.env.DB_USER_REMOTE,
    password: process.env.DB_PASSWORD_REMOTE
  }
];

async function testConnection(dbConfig) {
  // 3. Construir configuración usando los datos pasados (sin hardcodear 'sa')
  const config = {
    server: dbConfig.server,
    database: dbConfig.name,
    user: dbConfig.user,          // Dinámico
    password: dbConfig.password,  // Seguro y dinámico
    port: 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true', // Configuración consistente
      trustServerCertificate: true,
      connectTimeout: 5000,
      requestTimeout: 5000
    }
  };

  try {
    console.log(`\n🔍 Probando conexión a ${dbConfig.name} en ${dbConfig.server}...`);
    
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
  console.log('🧪 INICIANDO PRUEBAS DE CONEXIÓN (Modo Seguro)...\n');
  
  let successCount = 0;
  
  for (const db of databases) {
    // Validar que las variables de entorno existan antes de probar
    if (!db.server || !db.user || !db.password) {
        console.log(`⚠️  Saltando ${db.name}: Faltan variables de entorno.`);
        continue;
    }
    const success = await testConnection(db);
    if (success) successCount++;
  }
  
  console.log(`\n📈 RESULTADO: ${successCount}/${databases.length} conexiones exitosas`);
  
  if (successCount === databases.length) {
    console.log('🎉 ¡Todas las conexiones funcionan correctamente!');
  } else {
    console.log('⚠️  Algunas conexiones fallaron. Revisa tu archivo .env');
  }
}

testAllConnections();