const axios = require('axios');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory=require('../controllers/handlerFactory')
const Booking = require('../models/bookingModel');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.tourId);
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${req.protocol}://${req.get('host')}/`,
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email: req.user.email,
//     mode:'payment',
//     client_reference_id: req.params.tourId,
//     line_items: [
//       {
//         price_data:{
//           currency:'usd',
//           product_data:{
//             name:`${tour.slug}`
//           },
//           unit_amount:tour.price*100
//         },
//         quantity:1
//       }
//     ],
//   });
//   res.status(200).json({
//     status: 'success',
//     session,
//   });
// });
exports.getPaybomCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const authRequest = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/auth/tokens',
    data: {
      api_key:
        'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2T1RReE56azBMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuaHVUcWRKSG40V1BYN1F5MUZaRTFxTjBESG5pTHNuQzFYSENqNVNVNmRHelM2dXZ6MU5hbWFzSmlDb2d0eHN3V04xWnR2Ym1yNzZoV0c0el9ybWhrQlE=',
    },
  });
  const orderReqistration = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/ecommerce/orders',
    data: {
      auth_token: authRequest.data.token,
      delivery_needed: 'false',
      amount_cents: tour.price * 1000,
      currency: 'USD',
      items: [
        {
          name: tour.id,
          amount_cents: tour.price,
          discont: '10',
          description: tour.description,
          quantity: '1',
          user: req.params,
          price: tour.price,
        },
      ],
    },
  });
  const successUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/payment/success?orderId=${
    orderReqistration.data.id
  }&items=${JSON.stringify([
    {
      name: tour.name,
      price: tour.price,
      description: tour.description,
      quantity: '1',
    },
  ])}`;
  const paymentKeyRequest = await axios({
    method: 'POST',
    url: 'https://accept.paymob.com/api/acceptance/payment_keys',
    data: {
      auth_token: authRequest.data.token,
      amount_cents: '100',
      expiration: 3600,
      order_id: orderReqistration.data.id,
      billing_data: {
        apartment: 803,
        email: req.user.email,
        floor: 42,
        first_name: req.user.name,
        street: 'Ethan Land',
        building: 8028,
        phone_number: '+86(8)9135210487',
        shipping_method: 'PKG',
        postal_code: '01898',
        city: 'Jaskolskiburgh',
        country: 'CR',
        last_name: 'Nicolas',
        state: 'Utah',
        tour,
        user: req.params.user,
        price: tour.price,
      },
      currency: 'EGP',
      integration_id: 4363407,
      lock_order_when_paid: false,
    },
  });
  const url = `https://accept.paymob.com/api/acceptance/iframes/803949?payment_token=${paymentKeyRequest.data.token}`;
  res.status(200).json({
    url,
    status: 'success',
  });
});
exports.checkoutRes = catchAsync(async (req, res, next) => {
  const { pending } = req.query;
  if (!pending) {
    return next();
  } else {
    const authRequest = await axios({
      method: 'POST',
      url: 'https://accept.paymob.com/api/auth/tokens',
      data: {
        api_key:
          'ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2T1RReE56azBMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuaHVUcWRKSG40V1BYN1F5MUZaRTFxTjBESG5pTHNuQzFYSENqNVNVNmRHelM2dXZ6MU5hbWFzSmlDb2d0eHN3V04xWnR2Ym1yNzZoV0c0el9ybWhrQlE=',
      },
    });
    const getOrderDetails = async (orderId) => {
      try {
        const authToken = authRequest.data.token;
        const response = await axios.get(
          `https://accept.paymob.com/api/ecommerce/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        return response.data;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to retrieve order details');
      }
    };
    const orderDetails = await getOrderDetails(req.query.order);
    const tour = orderDetails.items[0].name;
    const user = req.user;
    const price = orderDetails.items[0].amount_cents;
    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
  }
});
exports.getAllBooks = factory.getAll(Booking);
exports.getBook = factory.getOne(Booking);
exports.deleteBook = factory.deleteOne(Booking);
exports.createBook = factory.createOne(Booking);
exports.updateBook = factory.updateOne(Booking);
