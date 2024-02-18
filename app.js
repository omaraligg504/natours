const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter= require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const limitrate = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
// MIDDLE WARES
// app.use(helmet.contentSecurityPolicy({
//   useDefaults: true,
//   directives: {
//     "img-src": ["'self'", "https: data:"]
//   }
// }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const limiter = limitrate({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'too many requests from this IP',
});
app.use('/api', limiter);
// ROUTERS

// ROUTE HANDLER
app.use(hpp());
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/',viewRouter);
app.all('*', (req, _res, next) => {
  next(
    new AppError(
      `couldn't find the link ${req.originalUrl} on this server`,
      404,
    ),
  );
});
app.use(globalErrorHandler);
module.exports = app;
