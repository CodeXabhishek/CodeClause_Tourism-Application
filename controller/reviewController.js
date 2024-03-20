const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryHandlers');

exports.getAllReviews = factory.getAll(Review);

exports.getUserTour_Id = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReviews = factory.createOne(Review); //162
exports.deleteReview = factory.deleteOne(Review);
exports.updateReviews = factory.updateOne(Review);
