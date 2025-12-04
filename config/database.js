const sql = require('mssql');
const { exec } = require('child_process');
require('dotenv').config();

const dbConfigs = {
  'SJ': {
    server: process.env.DB_SERVER_SJ,
    database: process.env.DB_NAME_SJ,
    user: process.env.DB_USER_SJ,
    password: process.env.DB_PASSWORD_SJ,
    port: 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true', // Soluciona CWE-319
      trustServerCertificate: true
    }
  },
  'LM': {
    server: process.env.DB_SERVER_REMOTE, 
    database: process.env.DB_NAME_LM,
    user: process.env.DB_USER_REMOTE,
    password: process.env.DB_PASSWORD_REMOTE,
    port: 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  },
  'CORP': {
    server: process.env.DB_SERVER_REMOTE,
    database: process.env.DB_NAME_CORP, 
    user: process.env.DB_USER_REMOTE,
    password: process.env.DB_PASSWORD_REMOTE,
    port: 1433,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  }
};

const pools = {};
let myTailscaleIP = null;
let myBranch = null;

function isTailscaleIP(ip) {
    if (!ip) return false;
    const cleanIP = ip.replace('::ffff:', '');
    const parts = cleanIP.split('.');
    if (parts.length !== 4) return false;
    const firstPart = parseInt(parts[0], 10);
    const secondPart = parseInt(parts[1], 10);
    return firstPart === 100 && secondPart >= 64 && secondPart <= 127;
}

const getMyTailscaleIP = () => {
    return new Promise((resolve) => {
        exec('tailscale ip --4', (error, stdout) => {
            if (error) {
                resolve(null);
                return;
            }
            const ip = stdout.trim();
            resolve(ip && isTailscaleIP(ip) ? ip : null);
        });
    });
};


const detectBranchFromIP = (ip) => {
    if (!ip || !isTailscaleIP(ip)) return null;
    
    const parts = ip.split('.');
    const secondPart = parseInt(parts[1], 10);
    const thirdPart = parseInt(parts[2], 10);
    
    if (secondPart === 78 && thirdPart === 216) return 'SJ';
    if (secondPart === 82 && thirdPart === 130) return 'LM';
    if (secondPart === 64 || secondPart === 65) return 'CORP';
    
    return null;
};


const initializeServer = async () => {
    myTailscaleIP = await getMyTailscaleIP();

    if (myTailscaleIP == '100.106.197.12') myTailscaleIP = '100.82.130.27';
    
    if (myTailscaleIP) {
        myBranch = detectBranchFromIP(myTailscaleIP);
        console.log(`Servidor iniciado - IP: ${myTailscaleIP}, Branch: ${myBranch}`);
    } else {
        console.log('Servidor iniciado - No se detectó IP de Tailscale');
    }
};


const getConnection = async (branch) => {
    if (!pools[branch]) {
        if (!dbConfigs[branch]) throw new Error('Sucursal no válida');
        pools[branch] = await new sql.ConnectionPool(dbConfigs[branch]).connect();
    }
    return pools[branch];
};


const getClientRealIp = (req) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        const ips = xForwardedFor.split(',');
        const realIp = ips[0].trim();
        if (realIp && realIp !== '::1') return realIp;
    }
    const xRealIp = req.headers['x-real-ip'];
    if (xRealIp && xRealIp !== '::1') return xRealIp;
    if (req.clientRealIp && req.clientRealIp !== '::1') return req.clientRealIp;
    return req.connection.remoteAddress;
};

const detectBranch = (req, res, next) => {
    const clientIP = getClientRealIp(req);
    if (!isTailscaleIP(clientIP)) {
        if ((clientIP === '127.0.0.1' || clientIP === '::1') && myTailscaleIP) {
            req.branch = myBranch;
        } else {
            return res.status(403).json({ error: 'Acceso no autorizado' });
        }
    } else {
        req.branch = detectBranchFromIP(clientIP);
        if (!req.branch) {
            return res.status(403).json({ error: 'Branch no reconocido' });
        }
    }
    next();
};

const determineDatabase = async (req, res, next) => {
    try {
        if (req.path === '/api/auth/login' && req.method === 'POST') {
            const { username, password } = req.body;
            if (username && password) {
                const pool = await getConnection(req.branch);
                const result = await pool.request()
                    .input('username', sql.NVarChar(50), username)
                    .input('password', sql.NVarChar(255), password)
                    .execute('sp_ValidateUserCredentials');
                
                if (result.recordset.length > 0) {
                    const user = result.recordset[0];
                    if (user.branch === req.branch) {
                        req.user = user;
                        req.database = user.rol === 'corporativo' ? 'CORP' : user.branch;
                    } else {
                        return res.status(401).json({ error: 'Usuario no autorizado para esta sucursal' });
                    }
                } else {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }
            }
        } else {
            if (req.user) {
                req.database = req.user.rol === 'corporativo' ? 'CORP' : req.user.branch;
            } else {
                req.database = req.branch;
            }
        }
        next();
    } catch (error) {
        console.error(error); // Log del error para depuración
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    sql,
    getConnection,
    detectBranch,
    determineDatabase,
    initializeServer,
    myTailscaleIP,
    myBranch
};