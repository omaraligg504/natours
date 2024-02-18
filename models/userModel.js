const mongoose=require('mongoose');
const slugify=require('slugify')
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'user must have a name'],
        unique:true,
       // minlength:[5,'name must be at least 5 charcters'],
       // maxlength:[20,'name must be at most 20 charcters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: [true,'this email is already in use'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      },
    photo:{
        type:String,
        default:'default.jpg'
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        required:[true,'user must have a role'],
       // default:'user'
    },
    password:{
        type:String,
        required:[true,'user must have a password'],
        select:false
       // validate:[validator.isStrongPassword,'not strong password']
    },
    confirmPassword:{
        type:String,
        //required:[true,'user must have confirmPassword'],
        validate:{
            validator:function(val){
                return val===this.password
            },
            message:"Unmatched Password"
        }
    },
    passwordChangeAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  });
  
  userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}})
    next();
})
userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}
userSchema.methods.changePasswordAt=function(JWTTimestamp){
    if(this.passwordChangeAt){
        return parseInt(this.passwordChangeAt.getTime()/1000,10)>JWTTimestamp
    }
    return false;
}
userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');

    const hashedtoken=crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.passwordResetToken=hashedtoken;
    this.passwordResetExpires=Date.now()+10*60*1000;
    return resetToken;
}

const User=new mongoose.model('User',userSchema);
module.exports=User;