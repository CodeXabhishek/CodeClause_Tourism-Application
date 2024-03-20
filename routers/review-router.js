const express = require('express');
const reviewController = require('./../controller/reviewController');

const authenController = require('./../controller/authenController');
const routes = express.Router({ mergeParams: true });

routes.use(authenController.protects);

routes
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenController.restrictTo('user'),
    reviewController.getUserTour_Id,
    reviewController.createReviews,
  );

routes
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authenController.restrictTo('user', 'admin'),
    reviewController.updateReviews,
  )
  .delete(
    authenController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );
module.exports = routes;
