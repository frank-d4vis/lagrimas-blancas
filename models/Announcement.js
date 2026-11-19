const db = require('../config/db');

exports.findAll = async (category = null, limit = null) => {
  const params = [];
  let sql = 'SELECT * FROM announcements';
  if (category) { params.push(category); sql += ` WHERE category = $${params.length}`; }
  sql += ' ORDER BY published_at DESC';
  if (limit) { params.push(limit); sql += ` LIMIT $${params.length}`; }
  const r = await db.query(sql, params); // el SQL solo concatena marcadores $n, nunca datos del usuario
  return r.rows;
};

exports.findById = async (id) => {
  const r = await db.query('SELECT * FROM announcements WHERE id = $1', [id]);
  return r.rows[0] || null;
};

exports.create = async ({ title, content, category, user_id }) => {
  const r = await db.query(
    'INSERT INTO announcements (title, content, category, user_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [title, content, category, user_id]
  );
  return r.rows[0];
};

exports.update = async (id, { title, content, category }) =>
  (await db.query(
    'UPDATE announcements SET title = $1, content = $2, category = $3, updated_at = NOW() WHERE id = $4',
    [title, content, category, id]
  )).rowCount;

exports.remove = async (id) => (await db.query('DELETE FROM announcements WHERE id = $1', [id])).rowCount;

exports.count = async () => (await db.query('SELECT COUNT(*)::int AS total FROM announcements')).rows[0].total;
