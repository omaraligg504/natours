/* eslint-disable*/
const express=require('express');
const router=express.Router();
const tourController=require('./../controllers/tourController')
const authController=require('./../controllers/authController');
const reviewRouter=require('./../routes/reviewRoutes')

router
.route('/stats')
.get(tourController.getTourStats)
router
.route('/monthly-plan/:year')
.get(authController.protected,authController.restrictedto('admin','lead-guide','guide'),tourController.getMonthStats)

router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin)

router
.route('/distances/:latlng/unit/:unit')
.get(tourController.getToursDistances)

router
.route('/top-5-cheap')
.get(tourController.aliasTopCheap,tourController.getAllTours)
//router.param('id',tourController.checkId)
router
.route('/')
.get(tourController.getAllTours)
.post(authController.protected,authController.restrictedto('admin','lead-guide'),tourController.createNewTour)


router
.route('/:id')
.delete(authController.protected,authController.restrictedto('admin','lead-guide'),tourController.deleteTour)
.patch(authController.protected,authController.restrictedto('admin','lead-guide'),tourController.uploadTourImages,tourController.resizeTourImages,tourController.updateTour)
.get(tourController.getTour)

router.use('/:tourId/reviews',reviewRouter)

// router
// .route('/:tourId/reviews')
// .post(authController.protected,authController.restrictedto('user'),reviewController.createReview)
module.exports=router
