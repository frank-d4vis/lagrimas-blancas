const Campaign = require('../models/Campaign');
const Announcement = require('../models/Announcement');
const Volunteer = require('../models/Volunteer');
const donation = require('../config/donation');
const { validationResult } = require('express-validator');
const { CATEGORIES } = require('../middlewares/validators');

exports.home = async (req, res) => {
  const [campaigns, announcements] = await Promise.all([Campaign.findActive(3), Announcement.findAll(null, 3)]);
  res.render('home', { title: 'Inicio', campaigns, announcements });
};

exports.campaigns = async (req, res) => {
  res.render('campaigns', { title: 'Campañas activas', campaigns: await Campaign.findActive(), archive: false });
};

exports.campaignsArchive = async (req, res) => {
  res.render('campaigns', { title: 'Archivo de campañas completadas', campaigns: await Campaign.findAll('completed'), archive: true });
};

exports.announcements = async (req, res) => {
  // Lista blanca: cualquier valor distinto de las categorías permitidas se ignora.
  const category = CATEGORIES.includes(req.query.category) ? req.query.category : null;
  const items = await Announcement.findAll(category);
  res.render('announcements', { title: 'Comunicados', items, category, categories: CATEGORIES });
};

exports.donate = (req, res) => res.render('donate', { title: 'Donar', donation });

exports.showVolunteerForm = (req, res) =>
  res.render('volunteer', { title: 'Ser voluntario', errors: [], old: {} });

exports.createVolunteer = async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('volunteer', { title: 'Ser voluntario', errors: errs.array(), old: req.body });
  }
  await Volunteer.create(req.body);
  req.session.flash = { type: 'success', msg: '¡Gracias por postular! Hemos recibido tu solicitud y el equipo de la ONG te contactará pronto.' };
  req.session.save(() => res.redirect('/voluntariado'));
};
