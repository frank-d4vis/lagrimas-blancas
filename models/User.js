const db = require('../config/db');

// SQLi: consulta parametrizada ($1)
exports.findByEmail = async (email) => {
  const r = await db.query('SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1', [email]);
  return r.rows[0] || null;
};

exports.findById = async (id) => {
  const r = await db.query('SELECT id, name, email, password, role FROM users WHERE id = $1', [id]);
  return r.rows[0] || null;
};

exports.updatePassword = async (id, hash) =>
  (await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, id])).rowCount;

// Al cambiar la contraseña se cierran TODAS las demás sesiones abiertas de ese usuario.
exports.destroyOtherSessions = async (userId, currentSid) =>
  db.query(`DELETE FROM "session" WHERE (sess::jsonb -> 'user' ->> 'id') = $1 AND sid <> $2`, [String(userId), currentSid]);
