const mongoose=require('mongoose')
const slugify=require('slugify')
const validator=require('validator');
const User = require('./userModel');
const tourSchema=new mongoose.Schema({
    name :{
        type:String,
        unique:true,
        required:[true,'Tour must have a name'],
        minlength:[10,'Tour name must be at least 10 charcters'],
        maxlength:[40,'Tour name must be at most 40 charcters'],
        //validate:[validator.isAlpha,'Tour must contain only charcters ']
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be at least 1'],
        max:[5,'Rating must be at most 5'],
        set:val=>Math.round(val*10)/10
    },
    slug:String,
    ratingsQuantity:{
        type:Number,
        default:0
    },
    duration:{
        type:Number,
        required:[true,'the tour must have a duration'],

    },
    maxGroupSize:{
        type:Number,
        required:[true,'the tour must have a group size'],
    },
    difficulty:{
        type:String,
        required:[true,"tour must have a difficulty"],
        enum:{
            values:['easy','difficult','medium'],
            message:'Difficulty must be either easy , midium or difficult'
        }
    },
    price:{
        type:Number,
        required:[true,'tour must have price']
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val<this.price
            },
            message:'the discount must be smaller than the price'
        }
    },
    description:{
        type:String,
        trim:true,
        //required:[true,'a thour must have a description']
    },
    imageCover:{
        type:String,
        required:[true,'a tour must have a imagecover']
    },
    secret:{
        type:Boolean,
        default:false
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    }],
    guides:[
        {type:mongoose.Schema.ObjectId,
        ref:'User'
    }
    ],
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({ startLocation: '2dsphere' });
 tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
 })

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

 tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true})
    next();
 })
 tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
 })
 tourSchema.pre(/^find/,function(next){
    this.populate('guides')
    next();
 })
 tourSchema.pre(/^find/,function(next){
    this.find({secret:{$ne:true}})
    this.start=Date.now();
    next();
 })
//  tourSchema.pre('save',async function(next){
//     const guidePromises=this.guides.map(async id=>await User.findById(id));
//     this.guides=await Promise.all(guidePromises);
//     next();
//  })
 tourSchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now()-this.start} milliseconds`);
    next();
 })
//  tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({
//         $match:{secret:{$ne:true}}
//     })
//     next();
//  })
const Tour=new mongoose.model('Tour',tourSchema);
module.exports=Tour; 