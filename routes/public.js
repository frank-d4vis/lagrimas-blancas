const router = require('express').Router();
const wrap = require('../middlewares/asyncHandler');
const ctrl = require('../controllers/publicController');
const auth = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middlewares/auth');
const { loginLimiter, volunteerLimiter } = require('../middlewares/security');
const { loginRules, volunteerRules } = require('../middlewares/validators');

router.get('/', wrap(ctrl.home));
router.get('/campanas', wrap(ctrl.campaigns));
router.get('/campanas/archivo', wrap(ctrl.campaignsArchive));
router.get('/comunicados', wrap(ctrl.announcements)); // ?category=Urgente
router.get('/donar', ctrl.donate);
router.get('/voluntariado', ctrl.showVolunteerForm);
router.post('/voluntariado', volunteerLimiter, volunteerRules, wrap(ctrl.createVolunteer));

router.get('/login', redirectIfAuthenticated, auth.showLogin);
router.post('/login', loginLimiter, loginRules, wrap(auth.login));
router.post('/logout', auth.logout);

module.exports = router;
