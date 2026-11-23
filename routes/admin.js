// Todas estas rutas cuelgan de /admin y se montan DETRÁS de isAuthenticated + isAdmin (ver app.js).
const router = require('express').Router();
const wrap = require('../middlewares/asyncHandler');
const admin = require('../controllers/adminController');
const campaigns = require('../controllers/campaignController');
const announcements = require('../controllers/announcementController');
const volunteers = require('../controllers/volunteerController');
const account = require('../controllers/accountController');
const { campaignRules, announcementRules, volunteerStatusRules, passwordRules } = require('../middlewares/validators');

// Valida que :id sea un entero positivo (si no, 404) antes de tocar la BD.
router.param('id', (req, res, next, id) => (/^\d{1,9}$/.test(id) && Number(id) > 0 ? next() : next('route')));

router.get('/', wrap(admin.dashboard));

// Cuenta propia: cambio de contraseña
router.get('/cuenta', account.showForm);
router.post('/cuenta', passwordRules, wrap(account.changePassword));

// CRUD 1: Campañas
router.get('/campanas', wrap(campaigns.index));
router.get('/campanas/nueva', campaigns.newForm);
router.post('/campanas', campaignRules, wrap(campaigns.create));
router.get('/campanas/:id/editar', wrap(campaigns.editForm));
router.put('/campanas/:id', campaignRules, wrap(campaigns.update));
router.delete('/campanas/:id', wrap(campaigns.destroy));

// CRUD 2: Comunicados
router.get('/comunicados', wrap(announcements.index));
router.get('/comunicados/nuevo', announcements.newForm);
router.post('/comunicados', announcementRules, wrap(announcements.create));
router.get('/comunicados/:id/editar', wrap(announcements.editForm));
router.put('/comunicados/:id', announcementRules, wrap(announcements.update));
router.delete('/comunicados/:id', wrap(announcements.destroy));

// CRUD 3: Voluntarios
router.get('/voluntarios', wrap(volunteers.index));
router.put('/voluntarios/:id/estado', volunteerStatusRules, wrap(volunteers.updateStatus));
router.delete('/voluntarios/:id', wrap(volunteers.destroy));

module.exports = router;
