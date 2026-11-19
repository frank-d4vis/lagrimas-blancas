const { validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');

const blank = { title: '', description: '', goal_amount: '', current_amount: 0, image_url: '', status: 'active' };

exports.index = async (req, res) => {
  res.render('admin/campaigns/index', { title: 'Gestión de campañas', campaigns: await Campaign.findAll() });
};

exports.newForm = (req, res) =>
  res.render('admin/campaigns/form', { title: 'Nueva campaña', campaign: blank, errors: [], action: '/admin/campanas' });

exports.create = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('admin/campaigns/form', { title: 'Nueva campaña', campaign: req.body, errors: errs.array(), action: '/admin/campanas' });
  }
  await Campaign.create({ ...req.body, user_id: req.session.user.id });
  req.session.flash = { type: 'success', msg: 'Campaña creada correctamente.' };
  req.session.save(() => res.redirect('/admin/campanas'));
};

exports.editForm = async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return next();
  res.render('admin/campaigns/form', { title: 'Editar campaña', campaign, errors: [], action: `/admin/campanas/${campaign.id}` });
};

exports.update = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('admin/campaigns/form', {
      title: 'Editar campaña', campaign: { ...req.body, id: req.params.id }, errors: errs.array(), action: `/admin/campanas/${req.params.id}`,
    });
  }
  const n = await Campaign.update(req.params.id, req.body);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Campaña actualizada.' };
  req.session.save(() => res.redirect('/admin/campanas'));
};

exports.destroy = async (req, res, next) => {
  const n = await Campaign.remove(req.params.id);
  if (!n) return next();
  req.session.flash = { type: 'success', msg: 'Campaña eliminada.' };
  req.session.save(() => res.redirect('/admin/campanas'));
};
