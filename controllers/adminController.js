const Campaign = require('../models/Campaign');
const Announcement = require('../models/Announcement');
const Volunteer = require('../models/Volunteer');

const toMap = (rows) => rows.reduce((acc, r) => ({ ...acc, [r.status]: r.total }), {});

exports.dashboard = async (req, res) => {
  const [c, v, a] = await Promise.all([Campaign.countByStatus(), Volunteer.countByStatus(), Announcement.count()]);
  res.render('admin/dashboard', { title: 'Panel de administración', campaigns: toMap(c), volunteers: toMap(v), announcements: a });
};
