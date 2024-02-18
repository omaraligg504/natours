const mongoose=require('mongoose');
const {promisify}=require('util')
const jwt=require('jsonwebtoken')
const catchAsync = require('../utils/catchAsync');
const User=require('./../models/userModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const crypto=require('crypto');
const signToken=function(id){
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })   
}
const createSendToken=(user,statusCode,res)=>{
    //console.log(user);
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date( Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV==='production')cookieOptions.secure=true;
    //user.password=undefined
    res.cookie('jwt',token,cookieOptions)
    //console.log(res);
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}
exports.signup=catchAsync(async(req,res,next)=>{

    const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role:req.body.role
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
})
exports.login=catchAsync(async function(req,res,next){
    //console.log('omar is in log in function');
    const {email,password}=req.body;
    if(!email||!password){return next(new AppError('enter Password and email',400))}
    const user=await User.findOne({email}).select('+password');
   
    if(!user||!(await user.correctPassword(password,user.password))){
        
       return next(new AppError('Ivalid password or email',401))
    }
    //res.locals.user =user;
    //console.log(res.locals);
    createSendToken(user,201,res);
    //console.log(res.cookie.token);

})
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now()),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protected=catchAsync(async (req,res,next)=>{
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      token = req.headers.cookie;
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
   if(token.startsWith('jwt')){
    token=token.split('jwt=')[1]
   }

    // 2) Verification token
    //console.log(token);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changePasswordAt(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
})
exports.isLoggedIn=async (req,res,next)=>{
    
    //console.log('omar is not here');
     if(req.headers.cookie){
      try{
        token=req.headers.cookie
        token=token.split('jwt=')[1]
        const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        const currentUser=await User.findById(decoded.id);
        //console.log(decoded);
        if(!currentUser){
            return next()
        } 
        if(currentUser.changePasswordAt(decoded.iat)){
            return next()
        }
        res.locals.user=currentUser;
        return next();}
        catch(err){next()}  
    }
    next()
}

exports.restrictedto=function(...role){
    return (req,res,next)=>{
        
        if(!role.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action',403 ))
        }
        next();
    }
}
exports.forgetPassword=catchAsync(async (req,res,next)=>{
    const user =await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('there is no email with this email',404));
    }
    const resetToken=user.createPasswordResetToken();
    //console.log(user);
    await user.save({validateBeforeSave:false});
    //console.log(resetURL);
    try{      
    const resetURL=`${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetURL);
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
        status:'success',
        message:'Token sent to email!'
    })}catch (err) {
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        console.log(err);
        return next(new AppError('There error sending to this email',500))
    }
    //next();
}
)

exports.resetPassword=catchAsync(async function(req,res,next){
   const hashedToken = crypto
   .createHash('sha256')
   .update(req.params.token)
   .digest('hex')
   //console.log(hashedToken);
   const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}})
   if(!user){
    return next(new AppError('Invalid token or Expired token'))
   }
   user.password=req.body.password;
   user.passwordConfirm=req.body.passwordConfirm
   user.passwordResetToken=undefined
   user.passwordResetExpires=undefined
   await user.save();

   createSendToken(user,200,res);

})

exports.updatePassword=catchAsync( async function(req,res,next){
      const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
})
