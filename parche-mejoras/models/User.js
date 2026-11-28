const db = require('../config/db');

// SQLi: todas las consultas son parametrizadas ($1, $2...)
exports.findByEmail = async (email) => {
  const r = await db.query('SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1', [email]);
  return r.rows[0] || null;
};

exports.findById = async (id) => {
  const r = await db.query('SELECT id, name, email, password, role FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
};

// Lista de cuentas (sin exponer el hash de contraseña)
exports.findAll = async () => {
  const r = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY role DESC, created_at ASC');
  return r.rows;
};

exports.create = async ({ name, email, password, role }) => {
  const r = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, password, role]
  );
  return r.rows[0];
};

exports.updatePassword = async (id, hash) =>
  (await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, id])).rowCount;

// Al cambiar la contraseña se cierran TODAS las demás sesiones abiertas de ese usuario.
exports.destroyOtherSessions = async (userId, currentSid) =>
  db.query(`DELETE FROM "session" WHERE (sess::jsonb -> 'user' ->> 'id') = $1 AND sid <> $2`, [String(userId), currentSid]);
