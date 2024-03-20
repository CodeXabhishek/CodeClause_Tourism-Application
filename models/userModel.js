const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter a name'],
  },
  email: {
    type: String,
    required: [true, 'Please Enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [8, 'Password must be minimum of 8 character'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Password are not same',
    },
  },
  passwordChangeAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/**@description: Encrypting a password when new user is created */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/**@description: Documnet middleware-setting time for password change */
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});

userSchema.pre('find', function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//----------------------------------------------------

/**@description: Comparing user password from database */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//----------------------------------------------

/**@description: Setting json web token time stamp for password change */
userSchema.methods.changePassword = function (JWTtimestamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    return JWTtimestamp < changeTimeStamp;
  }
  return false;
};
//--------------------------------------

/**@description: Hashing a token  */
userSchema.methods.resetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
