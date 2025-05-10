import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { amount, userId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: 'Smart Saving Payment',
        },
        unit_amount: Math.round(amount * 100), // in paise
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `http://localhost:3000/success?userId=${userId}&amount=${amount}`,
    cancel_url: `http://localhost:3000/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
