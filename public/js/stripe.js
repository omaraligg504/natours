import axios from 'axios';
// import Stripe from "stripe";
// const stripe=Stripe('pk_test_51NtUq8FpWLtkJm1zLmjLenCeuQLOO1GiYRNEgZCVhn2Go2ftAmtaGf3cwutntHne7ZuPpaY1XeeJrDd2TxO0cdUj00NDgyLzUs')
// export const bookTour=async tourId=>{
//     const session =await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`)
//     console.log(session);
// }

export const bookTour = async (tourId) => {
  const session = await axios(
    `http://127.0.0.1:8000/api/v1/bookings/book/${tourId}`,
  );
  console.log(session);
};
