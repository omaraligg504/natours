const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory=require('./handlerFactory')
const multer=require('multer')
const sharp=require('sharp')
// const upload =multer({dest:'public/img/users'})
 
// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb)=>{
//         const ex=file.mimetype.split('/')[1]
//         cb(null,`user-${req.user.id}-${Date.now()}.${ex}`)
//     }
// })
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
exports.uploadUserPhoto=upload.single('photo')
exports.resizeUserPhoto=catchAsync (async (req,res,next)=>{
    if(!req.file)return next();
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/users/${req.file.filename}`)
    next()
})  

exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    console.log('mohamed*******************8888')
    next();
}

exports.getAllUsers=factory.getAll(User)
exports.getUser=factory.getOne(User)
exports.updateUser=factory.updateOne(User)
exports.createUser=factory.createOne(User)
exports.deleteUser=factory.deleteOne(User)

const filterObj=(obj,...filteres)=>{
    const filtered={};
    Object.keys(obj).forEach(el=>{
        if(filteres.includes(el))filtered[el]=obj[el]
    })
    return filtered
}

exports.deleteMe=catchAsync(async function(req,res, next){
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:'success',
        data:null
    })
})
exports.updateMe=catchAsync(async function(req,res,next){
    if(req.body.password||req.body.passwordConfirm){  
        return next(new AppError('this route is not for changing the password ',404))
    }
    const filteredObj=filterObj(req.body,'name','email');
    if(req.file){filteredObj.photo=req.file.filename;}
    //console.log(req.file,req.body);
    const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredObj,{
        new:true,
        runValidators:true
    }); 
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    })
})
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZmM2Y2YxMzMwYmRkMjg1NTIwMjhkMyIsImlhdCI6MTY5NDI2NDU2MSwiZXhwIjoxNzAyMDQwNTYxfQ.a2ApAslmZ592f9TNFhtq1eyW0s16puJNgFj8_tCYvpE
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjOGExZGZhMmY4ZmI4MTRiNTZmYTE4MSIsImlhdCI6MTY5NjkzNzA2NiwiZXhwIjoxNzA0NzEzMDY2fQ.gjdAM32itTvXxXrLZrvmeqaLy4V0Lg_ZV_Iu53t90zY