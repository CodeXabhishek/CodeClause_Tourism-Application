const mongoose = require('mongoose');
// const User = require('./userModal');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      max: [5, 'Ratings average must be between 1-5'],
      min: [1, 'Ratings average must be between 1-5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/**@description: pre query middleware for popualting data */
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({ path: 'user', select: 'name' });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

/**@description: Average rating calculations on each tour after a new reviews */
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

/**@description: Document middleware for default average rating */
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
//-----------------------------------------
//1️⃣6️⃣9️⃣.) Calc Avg Rating on Tour------------
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   console.log(this.findOne());
//   this.reviewPre = await this.clone().findOne();
//   next();
// });
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
  // await this.reviewPre.constructor.calcAverageRatings(this.reviewPre.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
