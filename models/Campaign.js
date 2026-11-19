const db = require('../config/db');

exports.findAll = async (status = null) => {
  if (status) {
    const r = await db.query('SELECT * FROM campaigns WHERE status = $1 ORDER BY created_at DESC', [status]);
    return r.rows;
  }
  const r = await db.query('SELECT * FROM campaigns ORDER BY created_at DESC');
  return r.rows;
};

exports.findActive = async (limit = null) => {
  if (limit) {
    const r = await db.query("SELECT * FROM campaigns WHERE status = 'active' ORDER BY created_at DESC LIMIT $1", [limit]);
    return r.rows;
  }
  return exports.findAll('active');
};

exports.findById = async (id) => {
  const r = await db.query('SELECT * FROM campaigns WHERE id = $1', [id]);
  return r.rows[0] || null;
};

exports.create = async ({ title, description, goal_amount, current_amount, image_url, status, user_id }) => {
  const r = await db.query(
    `INSERT INTO campaigns (title, description, goal_amount, current_amount, image_url, status, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [title, description, goal_amount, current_amount, image_url || null, status, user_id]
  );
  return r.rows[0];
};

exports.update = async (id, { title, description, goal_amount, current_amount, image_url, status }) => {
  const r = await db.query(
    `UPDATE campaigns
        SET title = $1, description = $2, goal_amount = $3, current_amount = $4,
            image_url = $5, status = $6, updated_at = NOW()
      WHERE id = $7`,
    [title, description, goal_amount, current_amount, image_url || null, status, id]
  );
  return r.rowCount;
};

exports.remove = async (id) => (await db.query('DELETE FROM campaigns WHERE id = $1', [id])).rowCount;

exports.countByStatus = async () => {
  const r = await db.query('SELECT status, COUNT(*)::int AS total FROM campaigns GROUP BY status');
  return r.rows;
};
