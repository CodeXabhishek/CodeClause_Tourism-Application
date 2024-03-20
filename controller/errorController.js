const AppError = require('./../utils/appError');

const handlerCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Try another one!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token.Please login again', 401);
const handleJWTExpiredError = (err) =>
  new AppError('Token is expired.Login again!', 401);

const sendErrorDevelopment = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR 🚫', err.path, err.value);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: 'Plese try again later!',
    });
  }
};

/**@description: Diffrent Error handling function */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    // const str = String(err.message).split(':');
    // console.log('development', str[str.length - 1].split(' }')[0]);

    sendErrorDevelopment(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') {
      error = handlerCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }
    sendErrorProduction(error, req, res);
  }
};
