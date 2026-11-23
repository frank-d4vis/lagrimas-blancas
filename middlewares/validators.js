// VALIDACIÓN Y SANITIZACIÓN EN SERVIDOR con express-validator.
// - trim()/stripLow(): limpian espacios y caracteres de control.
// - isIn(): lista blanca para enumerados (evita valores inesperados).
// - El ESCAPE HTML se hace en la salida con <%= %> de EJS (evita doble escape en la BD).
const { body } = require('express-validator');

const CATEGORIES = ['Noticia', 'Evento', 'Urgente'];
const CAMPAIGN_STATUS = ['active', 'completed'];
const VOLUNTEER_STATUS = ['pending', 'contacted', 'approved'];

const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Ingresa un correo válido.'),
  body('password').isString().isLength({ min: 1, max: 100 }).withMessage('Ingresa tu contraseña.'),
];

const campaignRules = [
  body('title').trim().stripLow().isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres.'),
  body('description').trim().stripLow(true).isLength({ min: 10, max: 3000 }).withMessage('La descripción debe tener entre 10 y 3000 caracteres.'),
  body('goal_amount').trim().isFloat({ min: 1, max: 99999999 }).withMessage('La meta debe ser un monto entre 1 y 99,999,999.').toFloat(),
  body('current_amount').trim().isFloat({ min: 0, max: 99999999 }).withMessage('El monto recaudado debe ser un número mayor o igual a 0.').toFloat(),
  body('image_url').optional({ values: 'falsy' }).trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('La imagen debe ser una URL http(s) válida.').isLength({ max: 500 }),
  body('status').isIn(CAMPAIGN_STATUS).withMessage('Estado de campaña no válido.'),
];

const announcementRules = [
  body('title').trim().stripLow().isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres.'),
  body('content').trim().stripLow(true).isLength({ min: 10, max: 5000 }).withMessage('El contenido debe tener entre 10 y 5000 caracteres.'),
  body('category').isIn(CATEGORIES).withMessage('Categoría no válida.'),
];

const volunteerRules = [
  body('full_name').trim().stripLow().isLength({ min: 3, max: 120 }).withMessage('Ingresa tu nombre completo (3 a 120 caracteres).'),
  body('email').trim().toLowerCase().isEmail().withMessage('Ingresa un correo válido.').isLength({ max: 150 }),
  body('phone').trim().matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Ingresa un teléfono válido (solo números, +, -, espacios).'),
  body('availability').trim().stripLow().isLength({ min: 3, max: 200 }).withMessage('Cuéntanos tu disponibilidad (ej.: sábados por la mañana).'),
  body('skills').trim().stripLow(true).isLength({ min: 3, max: 500 }).withMessage('Describe brevemente tus habilidades (3 a 500 caracteres).'),
  body('consent').equals('on').withMessage('Debes aceptar el tratamiento de tus datos personales (Ley N.° 29733).'),
];

const volunteerStatusRules = [body('status').isIn(VOLUNTEER_STATUS).withMessage('Estado no válido.')];

const passwordRules = [
  body('current_password').isString().isLength({ min: 1, max: 100 }).withMessage('Ingresa tu contraseña actual.'),
  body('new_password').isString().isLength({ min: 12 }).withMessage('La nueva contraseña debe tener al menos 12 caracteres.')
    .custom((v) => Buffer.byteLength(v, 'utf8') <= 72).withMessage('La nueva contraseña es demasiado larga (máximo 72 bytes).')
    .matches(/[a-z]/).withMessage('Debe incluir al menos una minúscula.')
    .matches(/[A-Z]/).withMessage('Debe incluir al menos una mayúscula.')
    .matches(/\d/).withMessage('Debe incluir al menos un número.')
    .matches(/[^A-Za-z0-9]/).withMessage('Debe incluir al menos un símbolo (ej.: ! # $ %).')
    .custom((v, { req }) => v !== req.body.current_password).withMessage('La nueva contraseña debe ser distinta de la actual.'),
  body('confirm_password').custom((v, { req }) => v === req.body.new_password).withMessage('La confirmación no coincide con la nueva contraseña.'),
];

module.exports = {
  passwordRules,
  CATEGORIES, CAMPAIGN_STATUS, VOLUNTEER_STATUS,
  loginRules, campaignRules, announcementRules, volunteerRules, volunteerStatusRules,
};
