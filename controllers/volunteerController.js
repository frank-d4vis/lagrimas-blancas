const { validationResult } = require('express-validator');
const Volunteer = require('../models/Volunteer');
const { VOLUNTEER_STATUS } = require('../middlewares/validators');

exports.index = async (req, res) => {
  // Lista blanca del filtro de estado
  const status = VOLUNTEER_STATUS.includes(req.query.status) ? req.query.status : null;
  const volunteers = await Volunteer.findAll(status);
  res.render('admin/volunteers/index', { title: 'Gestión de voluntariado', volunteers, status, statuses: VOLUNTEER_STATUS });
};

exports.updateStatus = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    req.session.flash = { type: 'danger', msg: errs.array()[0].msg };
    return req.session.save(() => res.redirect('/admin/voluntarios'));
  }
  const n = await Volunteer.updateStatus(req.params.id, req.body.status);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Estado de la postulación actualizado.' };
  req.session.save(() => res.redirect('/admin/voluntarios'));
};

exports.destroy = async (req, res, next) => {
  const n = await Volunteer.remove(req.params.id);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Registro eliminado.' };
  req.session.save(() => res.redirect('/admin/voluntarios'));
};
