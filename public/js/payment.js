const { default: Stripe } = require('stripe');
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51OpMGjSEHAa40pRoFyAPyyPRxkegQW32aBUCT5txbYOrfVClbIKvXPoReFqCIk5X4Zv5ej6gyrIshUqvHtWRnk8B005s8a0AIv',
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`,
    );
    window.location.replace(session.data.session.url);
    // console.log(session, session.data.session.url);
    // await Stripe.redirectToCheckout({
    //   sessionId: session.data.session.id,
    // });
  } catch (err) {
    showAlert('error', err.message);
  }
};
