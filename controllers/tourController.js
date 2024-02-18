/* eslint-disable*/
// const Tour=require('./../models/tourModel')
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
const multer=require('multer')
const sharp=require('sharp')

const multerStorage=multer.memoryStorage();
const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb(new AppError('Not an image , please upload image',400),false)
    }
}

const upload=multer({
    storage:multerStorage,
    filetFilter:multerFilter
})
exports.uploadTourImages=upload.fields([
  {name:'imageCover',maxCount:1},
  {name:'images',maxCount:3},

])
exports.resizeTourImages=catchAsync(async(req,res,next)=>{
  //console.log(req.files);
  if(!req.files.imageCover||!req.files.images)return next();
  req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000,1333)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/tours/${req.body.imageCover}`)
  req.body.images=[];
  await Promise.all(
    req.files.images.map(async(file,i)=>{
      const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`
      await sharp(file.buffer)
      .toFormat('jpeg')
      .jpeg({quality:90})
      .toFile(`public/img/tours/${filename}`)
      req.body.images.push(filename)
    })
  )
  next(); 
})
//const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.1 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        tours: { $push: '$name' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
      //     $match:{ _id:{$ne:'Easy'}}
      // }
    ]);

  res.status(200).json({
    status: 'successful',
    data: {
      stats,
    },
  });
});
exports.aliasTopCheap = (req, res, next) => {
  req.query.limit = '5';
  req.query.fields = 'name,difficulty,price,ratingsAverage';
  req.query.sort = '-ratingAverage,price';
  next();
};

exports.getAllTours =factory.getAll(Tour)
exports.getTour = factory.getOne(Tour,{path:'reviews'})
exports.createNewTour = factory.createOne(Tour)
exports.updateTour =factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour);

exports.getMonthStats = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-1-1`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  console.log(distance,lat,lng,unit,radius)

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
exports.getToursDistances=catchAsync(async function(req,res,next){
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(','); 
  const multiplier=unit==='mi'?0.000621371:0.001
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances=await Tour.aggregate([
    {$geoNear:{
      near:{
        type:'Point',
        coordinates:[lng*1,lat*1]
      },
      distanceField:'distance',
      distanceMultiplier:multiplier
      //key:'locations'
    }},
    {$project:{
      distance:1,
      name:1
    }}
  ])
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
})

//askdnaklsdn
