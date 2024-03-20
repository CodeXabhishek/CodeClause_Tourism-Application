const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');
const util = require('util');

/**@description: Signing json web token with secret key */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**@description: Sending web token with cookies */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

/**@description: Creating a new user */
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  //2️⃣0️⃣7️⃣.) Email template with pug----------
  // const url = `${req.protocol}://${req.get('host')}/me`;
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

/**@description: Login current register user */
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please enter password and email', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email and password', 401));
  }
  createSendToken(user, 200, res);
});

/**@description: Log out current user */
exports.logOut = (req, res) => {
  res.cookie('jwt', 'logOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

/**@description: Protecting different routes */
exports.protects = catchAsync(async (req, res, next) => {
  //Getting a token--------
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }

  //verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  );

  //Check if user exit
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User belonging to this token does not exit', 401),
    );
  }
  if (currentUser.changePassword(decoded.iat)) {
    return next(new AppError('Please login with change password', 401));
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

/**@description: Checking if user is logged in or not */
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.changePassword(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

/**@description: Restricting certain action to admin, user, guides */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

/**@description: Sending a forgot password request */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User does not exit with email adddress', 404));
  }
  const resetToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetpassword/${resetToken} `;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return new AppError('There was an error sending an email. Try again', 500);
  }
  // next();
});

/**@description: Setting a new password */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or expires', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

/**@description: Updating a password */
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res);
  // next();
});
