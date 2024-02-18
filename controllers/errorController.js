const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
const value = err.keyValue;
const message = `This ${Object.keys(value)}--> ${Object.values(value)} is already used. Please use another value!`;
return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

  const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl) {
      if(req.originalUrl.startsWith('/api')){
      //console.log(req.originalUrl);
      //console.log(err);
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });}
    }
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
  };
  
  const sendErrorProd = (err, req, res) => {
      if (req.originalUrl) {
      if(req.originalUrl.startsWith('/api')){
      // A) Operational, trusted error: send message to client
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      }
    }
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
      console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
  }
module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err,req,res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign({},err)
    //console.log(err.name);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError'){
      error = handleValidationErrorDB(err);    
    }
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
