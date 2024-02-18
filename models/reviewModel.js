const mongoose=require('mongoose')
const User = require('./userModel');
const Tour = require('./tourModel');
const reviewSchema=new mongoose.Schema({
    review:{type:String,
    required:[true,'review must have a text']
    },
    rating:{type:Number,
        min:1,
        max:5,
    //required:[true,'review must have a rating']
    },
    createdAt:{    
        type:Date,
        default:Date.now()
    },
    user:{type:mongoose.Schema.ObjectId,
    ref:'User',
    required:[true,'review must have a user']

    },
    tour:{type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'review must have a tour']
        },

}
,{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
reviewSchema.pre(/^find/,function(next){
    //console.log('omar');
    this.populate('user');
    //this.populate('tour');
    next();
 })

 reviewSchema.statics.calcAverageRatings=async function(tourId){
    const stats=await this.aggregate(
        [
            {$match:{tour:tourId}},
            {$group:{
                _id:'tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }}
        ]
    )
    
    if(stats.length<=0){
        
        await Tour.findByIdAndUpdate(tourId,{
        ratingsAverage:4.5,
        ratingsQuantity:0
    })}
    else{await Tour.findByIdAndUpdate(tourId,{
        ratingsAverage:stats[0].avgRating,
        ratingsQuantity:stats[0].nRating
    })
}
    
 }

 reviewSchema.post('save',function(){
    this.constructor.calcAverageRatings(this.tour);
 })
 reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


 reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r=await this.findOne();
    //console.log(this.r);
    next();
 })
 reviewSchema.post(/^findOneAnd/,async function(){
    //console.log(this.r);
    await this.r.constructor.calcAverageRatings(this.r.tour)
 })
//  reviewSchema.pre('save',function(next){
//     this.populate('user');
//     this.populate('tour');
//     next();
//  })
const Review=mongoose.model('Review',reviewSchema)
module.exports=Review 