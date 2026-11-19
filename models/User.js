const db = require('../config/db');

// SQLi: consulta parametrizada ($1)
exports.findByEmail = async (email) => {
  const r = await db.query('SELECT id, name, email, password, role FROM users WHERE email = $1 LIMIT 1', [email]);
  return r.rows[0] || null;
};
