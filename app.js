const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoDBSanitize = require('express-mongo-sanitize');
const XSS = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const userRouter = require('./routers/user-router');
const tourRouter = require('./routers/tour-router');
const reviewRouter = require('./routers/review-router');
const viewRouter = require('./routers/viewRouter');
const bookingRouter = require('./routers/booking-router');

const morgan = require('morgan'); //6️⃣0️⃣Using 3rd party middlew

// app.use(morgan('dev'));
// console.log(process.env.NODE_ENV)
// 1️⃣4️⃣4️⃣ HTTP HEADERS
app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
//       scriptSrc: ["'self'", 'https://*.mapbox.com', "'unsafe-inline'", 'blob:'],
//     },
//   }),
// );
// const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
// const styleSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://fonts.googleapis.com/',
// ];
// const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: [],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   }),
// );
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**@description: Cleint request limiter */
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from same IP. Wait for an hoour',
});
app.use('/api', limiter);
//----------------------------

app.use(mongoDBSanitize());
app.use(XSS());
app.use(
  hpp({
    whitelist: ['duration', 'price'],
  }),
);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json()); //5️⃣3️⃣.) Handling Post Request-
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Hello from middleware function');
  // console.log(req.cookies);
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

/**@description:Handling unhandled routes */
app.all('*', (req, res, next) => {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `Can't find ${req.originalUrl}`,
  //   });
  //   next();
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

/**@description: Sending error to Global error handler */
app.use(globalErrorHandler);

module.exports = app;
