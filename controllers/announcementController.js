const { validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { CATEGORIES } = require('../middlewares/validators');

const blank = { title: '', content: '', category: 'Noticia' };
const view = (extra) => ({ categories: CATEGORIES, ...extra });

exports.index = async (req, res) => {
  res.render('admin/announcements/index', { title: 'Gestión de comunicados', items: await Announcement.findAll() });
};

exports.newForm = (req, res) =>
  res.render('admin/announcements/form', view({ title: 'Nuevo comunicado', item: blank, errors: [], action: '/admin/comunicados' }));

exports.create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('admin/announcements/form', view({ title: 'Nuevo comunicado', item: req.body, errors: errs.array(), action: '/admin/comunicados' }));
  }
  await Announcement.create({ ...req.body, user_id: req.session.user.id });
  req.session.flash = { type: 'success', msg: 'Comunicado publicado.' };
  req.session.save(() => res.redirect('/admin/comunicados'));
};

exports.editForm = async (req, res, next) => {
  const item = await Announcement.findById(req.params.id);
  if (!item) return next();
  res.render('admin/announcements/form', view({ title: 'Editar comunicado', item, errors: [], action: `/admin/comunicados/${item.id}` }));
};

exports.update = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('admin/announcements/form', view({
      title: 'Editar comunicado', item: { ...req.body, id: req.params.id }, errors: errs.array(), action: `/admin/comunicados/${req.params.id}`,
    }));
  }
  const n = await Announcement.update(req.params.id, req.body);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Comunicado actualizado.' };
  req.session.save(() => res.redirect('/admin/comunicados'));
};

exports.destroy = async (req, res, next) => {
  const n = await Announcement.remove(req.params.id);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Comunicado eliminado.' };
  req.session.save(() => res.redirect('/admin/comunicados'));
};
