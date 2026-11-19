const db = require('../config/db');

exports.create = async ({ full_name, email, phone, availability, skills }) => {
  const r = await db.query(
    `INSERT INTO volunteers (full_name, email, phone, availability, skills, status)
     VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
    [full_name, email, phone, availability, skills]
  );
  return r.rows[0];
};

exports.findAll = async (status = null) => {
  if (status) {
    return (await db.query('SELECT * FROM volunteers WHERE status = $1 ORDER BY created_at DESC', [status])).rows;
  }
  return (await db.query('SELECT * FROM volunteers ORDER BY created_at DESC')).rows;
};

exports.updateStatus = async (id, status) =>
  (await db.query('UPDATE volunteers SET status = $1, updated_at = NOW() WHERE id = $2', [status, id])).rowCount;

exports.remove = async (id) => (await db.query('DELETE FROM volunteers WHERE id = $1', [id])).rowCount;

exports.countByStatus = async () =>
  (await db.query('SELECT status, COUNT(*)::int AS total FROM volunteers GROUP BY status')).rows;
