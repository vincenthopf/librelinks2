import Stripe from 'stripe';
import serverAuth from '@/lib/serverAuth';
import { db } from '@/lib/db';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Authenticate user
    const { currentUser } = await serverAuth(req, res);

    // Ensure user has a subscription
    if (!currentUser.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription at period end (user continues to have access until the end of their current billing period)
    const subscription = await stripe.subscriptions.update(currentUser.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // API response will have subscription.cancel_at (timestamp when the subscription will be canceled)
    // But we don't need to update our DB as the subscription.status remains 'active' until that time,
    // and we'll receive a webhook when it actually cancels

    return res.status(200).json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);

    // Handle common Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid subscription information' });
    }

    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
