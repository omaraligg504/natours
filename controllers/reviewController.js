const mongoose=require('mongoose');
const Review=require('./../models/reviewModel');
const catchAsync=require('./../utils/catchAsync')
const factory=require('./handlerFactory')
exports.setTourUserId=(req,res,next)=>{
    if(!req.body.user)req.body.user=req.user.id;
    if(!req.body.tour)req.body.tour=req.params.tourId;
    next();
}

exports.getAllReviews=factory.getAll(Review)
exports.getReview=factory.getOne(Review,{path:'user'})
exports.deleteReview=factory.deleteOne(Review)
exports.createReview=factory.createOne(Review);
exports.updateReview=factory.updateOne(Review);
