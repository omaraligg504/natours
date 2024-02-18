const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewsController');
const bookingController = require('../controllers/bookingController');
router.get('/me', authController.protected, viewController.getAccount);
router.get('/my-tours', authController.protected, viewController.getMyTours);
router.use(authController.isLoggedIn);
router.get(
  '/',
  authController.protected,
  bookingController.checkoutRes,
  viewController.getOverview,
);
router.get('/tour/:tour', viewController.getTour);

router.get('/login', viewController.login);

module.exports = router;
