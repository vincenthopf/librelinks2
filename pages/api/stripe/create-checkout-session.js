import Stripe from 'stripe';
import serverAuth from '@/lib/serverAuth';
import { db } from '@/lib/db'; // Assuming db is exported from here

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const priceId = process.env.STRIPE_PRICE_ID; // Get Price ID from .env

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!priceId) {
    console.error('Stripe Price ID is not configured in .env');
    return res.status(500).json({ error: 'Internal server error: Stripe Price ID missing' });
  }

  try {
    // Authenticate user
    const { currentUser } = await serverAuth(req, res);

    // Get the origin URL from the request body (where the user clicked subscribe)
    const { origin } = req.body;
    if (!origin) {
      return res.status(400).json({ error: 'Origin URL is required' });
    }

    // Construct success and cancel URLs using the origin
    // Adding query parameters helps the frontend know the checkout outcome
    const success_url = `${origin}?subscribed=true`;
    const cancel_url = `${origin}?canceled=true`;

    // Prepare parameters for Stripe Checkout Session
    const checkoutParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
    };

    // Use existing Stripe Customer ID if available, otherwise pass email
    if (currentUser.stripeCustomerId) {
      checkoutParams.customer = currentUser.stripeCustomerId;
    } else {
      checkoutParams.customer_email = currentUser.email;
      // customer_creation = 'always' removed as it's not allowed in subscription mode.
      // Stripe automatically creates a customer if email is provided and customer doesn't exist.
    }

    // Add internal userId to metadata for webhook reference
    checkoutParams.metadata = {
      userId: currentUser.id,
    };

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create(checkoutParams);

    // Return the session ID to the frontend
    // The frontend will use this ID with Stripe.js to redirect
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    // Handle potential errors like user not found from serverAuth
    if (error.message === 'Not signed in') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
}
