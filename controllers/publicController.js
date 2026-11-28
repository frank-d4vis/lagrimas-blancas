const Campaign = require('../models/Campaign');
const Announcement = require('../models/Announcement');
const Volunteer = require('../models/Volunteer');
const donation = require('../config/donation');
const { validationResult } = require('express-validator');
const { CATEGORIES } = require('../middlewares/validators');

const compact = (s) => String(s || '').replace(/\s+/g, ' ').trim();

exports.home = async (req, res) => {
  const [campaigns, completed, announcements] = await Promise.all([
    Campaign.findActive(3),
    Campaign.findCompleted(3),
    Announcement.findAll(null, 3),
  ]);
  res.render('home', { title: 'Inicio', campaigns, completed, announcements });
};

// /campanas: activas + sección "Campañas culminadas / Evidencias de entregas"
exports.campaigns = async (req, res) => {
  const [active, completed] = await Promise.all([Campaign.findActive(), Campaign.findCompleted()]);
  res.render('campaigns', { title: 'Campañas', active, completed, archive: false });
};

// /campanas/archivo: solo evidencias de campañas completadas
exports.campaignsArchive = async (req, res) => {
  res.render('campaigns', { title: 'Evidencias de entregas', active: [], completed: await Campaign.findCompleted(), archive: true });
};

exports.announcements = async (req, res) => {
  // Lista blanca: cualquier valor distinto de las categorías permitidas se ignora.
  const category = CATEGORIES.includes(req.query.category) ? req.query.category : null;
  const items = await Announcement.findAll(category);
  res.render('announcements', { title: 'Comunicados', items, category, categories: CATEGORIES });
};

exports.donate = (req, res) => res.render('donate', { title: 'Donar', donation });

// Formulario de voluntariado. Si la postulación se acaba de enviar, muestra la confirmación (una sola vez).
exports.showVolunteerForm = (req, res) => {
  const submitted = !!(req.session && req.session.volunteerSubmitted);
  if (submitted) delete req.session.volunteerSubmitted;
  res.render('volunteer', { title: 'Ser voluntario', errors: [], old: {}, submitted });
};

exports.createVolunteer = async (req, res) => {
  const markSubmitted = () => {
    req.session.volunteerSubmitted = true;
    req.session.save(() => res.redirect('/voluntariado'));
  };

  // Honeypot anti-bots: el campo "website" está oculto; si viene con datos, es un bot. Se descarta en silencio.
  if (req.body.website) return markSubmitted();

  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    return res.status(422).render('volunteer', { title: 'Ser voluntario', errors: errs.array(), old: req.body, submitted: false });
  }

  // El distrito se guarda dentro de `availability` para NO modificar la tabla `volunteers` en Supabase.
  const district = compact(req.body.district);
  const availability = compact(req.body.availability);
  await Volunteer.create({
    full_name: req.body.full_name,
    email: req.body.email,
    phone: req.body.phone,
    skills: req.body.skills,
    availability: `Distrito: ${district} | Disponibilidad: ${availability}`.slice(0, 200), // límite VARCHAR(200)
  });

  return markSubmitted();
};
