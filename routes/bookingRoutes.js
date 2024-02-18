const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');
router.use(authController.protected);
router.get(
  '/book/:tourId',
  authController.protected,
  bookingController.getPaybomCheckoutSession,
);
router.use(authController.restrictedto('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooks)
  .post(bookingController.createBook);

router
  .route('/:id')
  .delete(bookingController.deleteBook)
  .patch(bookingController.updateBook)
  .get(bookingController.getBook);
// router.get(
//   '/checkout-session/:tourId',
//   authController.protected,
//   bookingController.getCheckoutSession,
// );
module.exports = router;
