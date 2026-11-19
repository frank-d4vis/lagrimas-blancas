// Conexión a PostgreSQL (Supabase) mediante un pool de `pg`.
const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';
const isLocal = /localhost|127\.0\.0\.1/.test(url);

const pool = new Pool({
  connectionString: url,
  // Supabase exige SSL. rejectUnauthorized:false evita errores de cadena de certificados en Render/Vercel.
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: process.env.VERCEL ? 2 : 10, // en serverless se mantienen pocas conexiones
});

pool.on('error', (err) => console.error('Error inesperado en el pool de PostgreSQL:', err.message));

module.exports = {
  pool,
  // SEGURIDAD (SQLi): todas las consultas del proyecto pasan por aquí con parámetros ($1, $2...).
  query: (text, params) => pool.query(text, params),
};
