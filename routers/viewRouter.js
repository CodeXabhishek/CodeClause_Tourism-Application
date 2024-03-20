const express = require('express');
const routes = express.Router();
const viewsController = require('./../controller/viewsController');
const authenController = require('./../controller/authenController');
const bookingController = require('./../controller/bookingController');

routes.get('/signup', viewsController.getSignUpForm);

routes.get('/me', authenController.protects, viewsController.getAccount);
routes.post(
  '/submit-user-data',
  authenController.protects,
  viewsController.updateUserData,
);

routes.get('/my-tours', authenController.protects, viewsController.getMyTours);

routes.use(authenController.isLoggedIn);
routes.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview,
);
routes.get('/tour/:slug', viewsController.getTour);
routes.get('/login', viewsController.getLoginForm);

module.exports = routes;
