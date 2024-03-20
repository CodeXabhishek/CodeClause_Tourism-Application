const express = require('express');
const bookingController = require('./../controller/bookingController');
const authenController = require('./../controller/authenController');
const routes = express.Router();
routes.get(
  '/checkout-session/:tourID',
  authenController.protects,
  bookingController.getCheckOutSession,
);
module.exports = routes;
