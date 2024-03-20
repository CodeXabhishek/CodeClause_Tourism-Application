const express = require('express');

const tourController = require('./../controller/tour-controller');
const authenController = require('./../controller/authenController');
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./review-router');
const routes = express.Router();

routes
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

routes.route('/tours-stat').get(tourController.getTourStats);

routes.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

routes
  .route('/tour-nearby/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourNearBy);

routes.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);

//6️⃣4️⃣.) Param Middleware------------------
// routes.param('id',tourController.checkID)
routes
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authenController.protects,
    authenController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

routes
  .route('/:id')
  .get(tourController.singleTour)
  .patch(
    authenController.protects,
    authenController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authenController.protects,
    authenController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

//1️⃣5️⃣8️⃣.) Simple nested route-------------
// routes
//   .route('/:tourId/reviews')
//   .post(
//     authenController.protects,
//     authenController.restrictTo('user'),
//     reviewController.createReviews,
//   );
routes.use('/:tourId/reviews', reviewRouter);

module.exports = routes;
