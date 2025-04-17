import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '@/lib/db';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable Next.js body parsing for this route
// Stripe requires the raw request body to verify the signature
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  if (!webhookSecret) {
    console.error('Stripe Webhook Secret is not configured in .env');
    return res.status(500).send('Webhook Error: Missing webhook secret configuration');
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Error verifying webhook signature: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`Received Stripe event: ${event.type}`);
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Processing checkout.session.completed for session:', session.id);

      // Ensure metadata and userId exist
      if (!session.metadata || !session.metadata.userId) {
        console.error(`Webhook Error: Missing userId in metadata for session: ${session.id}`);
        // Return 200 to prevent Stripe retries for this issue, but log the error.
        return res.status(200).json({ received: true, error: 'Missing metadata' });
      }

      const userId = session.metadata.userId;
      const customerId = session.customer; // The Stripe Customer ID (could be new or existing)

      // Check if the session was for a subscription
      if (session.mode === 'subscription' && session.subscription) {
        const subscriptionId = session.subscription;

        try {
          // Retrieve the subscription details to get status and current period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          // Prepare data for update, starting with mandatory fields
          const updateData = {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionStatus: subscription.status,
            stripePriceId: subscription.items.data[0]?.price.id,
            // Initialize date field as undefined
            stripeCurrentPeriodEnd: undefined,
          };

          // Check if current_period_end is a valid number before creating Date
          if (typeof subscription.current_period_end === 'number') {
            updateData.stripeCurrentPeriodEnd = new Date(subscription.current_period_end * 1000);
          } else {
            console.warn(
              `Webhook Warning: Invalid or missing current_period_end (${subscription.current_period_end}) for subscription ${subscription.id}. Skipping date update.`
            );
          }

          // Update user record using the userId from metadata
          await db.user.update({
            where: { id: userId },
            data: updateData, // Use the prepared update data
          });
          console.log(
            `Successfully updated user ${userId} with subscription ${subscription.id} and customer ${customerId}`
          );
        } catch (dbError) {
          console.error(`Webhook Error: Database update failed for user ${userId}:`, dbError);
          // Potentially return 500 if this is likely a persistent issue
          // For now, return 200 to avoid excessive retries, but log it.
          return res.status(200).json({ received: true, error: 'Database update failed' });
        }
      } else {
        console.log(
          `Skipping checkout session ${session.id}: Mode is not subscription or subscription ID missing.`
        );
      }
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object;
      console.log(
        'Processing customer.subscription.updated for subscription:',
        subscriptionUpdated.id
      );
      try {
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionUpdated.id },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionStatus: subscriptionUpdated.status,
              stripePriceId: subscriptionUpdated.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(subscriptionUpdated.current_period_end * 1000),
            },
          });
          console.log(
            `Successfully updated user ${user.id} subscription status to ${subscriptionUpdated.status}`
          );
        } else {
          console.error(
            `Webhook Error: User not found for Stripe Subscription ID: ${subscriptionUpdated.id}`
          );
        }
      } catch (dbError) {
        console.error('Webhook Error: Database update failed for subscription update:', dbError);
      }
      break;

    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object;
      console.log(
        'Processing customer.subscription.deleted for subscription:',
        subscriptionDeleted.id
      );
      // When a subscription is canceled/deleted, update the status
      try {
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionDeleted.id },
        });

        if (user) {
          await db.user.update({
            where: { id: user.id },
            // Update status, potentially clear other fields if desired
            data: {
              stripeSubscriptionStatus: subscriptionDeleted.status, // Should be 'canceled' or similar
              // Optionally clear stripeCurrentPeriodEnd, stripePriceId
            },
          });
          console.log(
            `Successfully updated user ${user.id} subscription status to ${subscriptionDeleted.status} (deleted)`
          );
        } else {
          console.error(
            `Webhook Error: User not found for deleted Stripe Subscription ID: ${subscriptionDeleted.id}`
          );
        }
      } catch (dbError) {
        console.error('Webhook Error: Database update failed for subscription deletion:', dbError);
      }
      break;

    // ... handle other event types as needed, e.g.:
    // case 'invoice.payment_failed':
    //   // Handle failed payments, maybe notify user or update status
    //   break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

export default handler;
