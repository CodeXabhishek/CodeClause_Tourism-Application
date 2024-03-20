//8️⃣8️⃣.) Refactoring our mvc
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const warnMessage = 'A tour must have a';
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, `${warnMessage} name`],
      unique: true,
      maxlength: [40, 'A tour must have =<40 characters'],
      minlength: [10, 'A tour must have >10 characters'],
      // validate: [validator.isAlpha, 'A tour name must conatain alphabet only'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Ratings average must be between 1-5'],
      min: [1, 'Ratings average must be between 1-5'],
      set: (val) => val.toFixed(2),
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, `${warnMessage} price`],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: `Discount price ({VALUE}) must be less than price`,
      },
    },
    duration: {
      type: Number,
      required: [true, `${warnMessage} duration`],
    },
    maxGroupSize: {
      type: Number,
      required: [true, `${warnMessage} group size`],
    },
    difficulty: {
      type: String,
      required: [true, `${warnMessage} difficulty`],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be: easy or medium or difficult',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, `${warnMessage} summary`],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, `${warnMessage} image cover`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//1️⃣0️⃣6️⃣.) Document middleware-----------------
tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(3);
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

/**@description: Creating a slug before creating a document */
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//-------------------------------------------

//1️⃣5️⃣1️⃣.) Embedding tour guide--------------
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
//---------------------------------------

/**@description: Query middleware showing only main tours*/
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//------------------------------------------

/**@description: Populating tour guide*/
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});
//------------------------------

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});
//------------------------------------------------

/**@description:Aggregation middleware */
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
//------------------------------------------------

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
