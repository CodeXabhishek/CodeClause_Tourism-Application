const Tour = require('./../models/tourModel');
const Stripe = require('stripe');
// const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./factoryHandlers');
const Booking = require('./../models/bookingModel');

/**@description: Getting a payment detail checkout  */
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create Checkout session
  const stripe = Stripe(process.env.STRIPE_SECRETKEY);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });

  // 3) Create Session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

/**@description:  Creating a new checkout session*/
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !price && !user) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});
