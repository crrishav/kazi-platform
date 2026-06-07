import Stripe from 'stripe';

let stripe: Stripe;

export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    stripe = new Stripe(key, { apiVersion: '2024-11-20.acacia' as any });
  }
  return stripe;
}
