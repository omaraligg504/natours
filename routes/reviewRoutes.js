const mongoose=require('mongoose');
const reviewController=require('./../controllers/reviewController')
const authController=require('./../controllers/authController')
const express=require('express')
const router =express.Router({mergeParams:true});
router.use(authController.protected)
router
.route('/')
.post(authController.restrictedto('user'),reviewController.setTourUserId,reviewController.createReview)
.get(reviewController.getAllReviews)
router
.route('/:id')
.delete(authController.restrictedto('admin','user'),reviewController.deleteReview)
.patch(authController.restrictedto('adimn','user'),reviewController.updateReview)
.get(reviewController.getReview)
module.exports=router;