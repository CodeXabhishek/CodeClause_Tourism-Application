const fs = require('fs');

const Tour = require('./../models/tourModel');
const { query } = require('express');

const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryHandlers');

const sharp = require('sharp');
const multer = require('multer');

/**@description: Checking file is image or not */
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else {
    cb(new AppError('Not an image. Please upload an image file', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

/**@description: Setting number of images to be upload */
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

/**@description: Setting size of image before upload */
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    }),
  );

  next();
});

/**@description: Top five tours fetching function */
exports.aliasTopTours = (req, res, next) => {
  // eslint-disable-next-line no-unused-expressions
  (req.query.limit = 5),
    (req.query.sort = 'price ratingsAverage'),
    (req.query.fields =
      'name price duration difficulty summary ratingsAverage'),
    next();
};

/**@description: Getting all tours on home page */
exports.getAllTours = factory.getAll(Tour);

/**@description: Creating a new tour function */
exports.createTour = factory.createOne(Tour);

/**@description: Getting single tour on detail page */
exports.singleTour = factory.getOne(Tour, { path: 'reviews' });

/**@description: Upadating single tour  */
exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

/**@description: Aggregating different tours based on rating average */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

/**@description: Aggregating different tours based on months */
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    totalObj: plan.length,
    data: {
      plan,
    },
  });
});

/**@description: Getting a nearby tour */
exports.getTourNearBy = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide coordinates in format latitude,longitude',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

/**@description: Get distance of tour from current location */
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide coordinates in format latitude,longitude',
        400,
      ),
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
