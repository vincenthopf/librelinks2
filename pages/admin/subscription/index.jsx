import { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import useCurrentUser from '@/hooks/useCurrentUser';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Check } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import CustomAlert from '@/components/shared/alerts/custom-alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Define features with descriptions
const features = [
  {
    name: 'Unlimited Links',
    description:
      'Connect your audience to everything you are, everywhere, with limitless link sharing.',
    free: true,
    premium: true,
  },
  {
    name: 'Text Blocks',
    description:
      'Craft your narrative with descriptive text sections that guide and inform your visitors.',
    free: true,
    premium: true,
  },
  {
    name: 'Theme & Button Styles',
    description:
      "Instantly transform your profile's look with curated themes and stylish button designs.",
    free: true,
    premium: true,
  },
  {
    name: 'Social Media Icons',
    description:
      'Effortlessly display prominent, clickable icons for all your social media profiles.',
    free: true,
    premium: true,
  },
  {
    name: 'Photo Book Gallery',
    description:
      'Showcase your visual work beautifully with stunning image galleries in multiple layouts.',
    free: true,
    premium: true,
  },
  {
    name: 'Profile Layout Templates',
    description:
      'Get started quickly or find new inspiration using professionally designed profile layouts.',
    free: true,
    premium: true,
  },
  {
    name: 'Rich Media Embeds',
    description:
      'Bring your profile to life by directly embedding playable content from YouTube, Spotify, TikTok, and more.',
    free: true,
    premium: true,
  },
  {
    name: 'Font & Size Customization',
    description:
      'Express your brand identity with personalized profile fonts and fine-tuned element sizing.',
    free: true,
    premium: true,
  },
  {
    name: 'Layout Spacing Control',
    description:
      'Achieve pixel-perfect design by precisely controlling the spacing and margins between elements.',
    free: true,
    premium: true,
  },
  {
    name: 'Profile Picture Frames',
    description:
      'Make your avatar pop with eye-catching frames like circles, polaroids, and custom rounded corners.',
    free: true,
    premium: true,
  },
  {
    name: 'Animation Effects',
    description:
      'Add subtle, engaging animations to your profile frame and content cards for a dynamic feel.',
    free: true,
    premium: true,
  },
  {
    name: 'Custom Backgrounds',
    description:
      'Set the perfect mood by uploading your own image or choosing from a curated background gallery.',
    free: true,
    premium: true,
  },
  // ---- Premium Only Features Below ----
  {
    name: 'Detailed Analytics Dashboard',
    description:
      'Unlock powerful insights: track views, clicks, traffic sources, visitor locations, devices, and performance over time.',
    free: false,
    premium: true,
  },
  {
    name: 'Remove Idly.pro Branding',
    description:
      'Maintain a completely professional look by removing the Idly.pro branding from your profile footer.',
    free: false,
    premium: true,
  },
];

// Helper to get features for a specific plan type
const getFeaturesForPlan = planType => features.filter(f => f[planType]);
const getPremiumOnlyFeatures = () => features.filter(f => f.premium && !f.free);

// Reusable Feature Item component
const FeatureItem = ({ text, description, iconColor = 'text-green-500' }) => (
  <li className="flex items-start space-x-3">
    <Check className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
    <span className="text-sm text-gray-700">
      <span className="font-medium text-gray-800">{text}</span>
      {description && <span className="text-gray-500 block">{description}</span>}
    </span>
  </li>
);

const SubscriptionPage = () => {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isSubscribed = currentUser?.stripeSubscriptionStatus === 'active';

  const freeFeatures = getFeaturesForPlan('free');
  const premiumOnlyFeatures = getPremiumOnlyFeatures();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    toast.loading('Redirecting to checkout...');

    try {
      const origin = window.location.origin + '/admin/subscription';

      const { data } = await axios.post('/api/stripe/create-checkout-session', {
        origin: origin,
      });

      const { sessionId } = data;

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('Stripe redirectToCheckout error:', error);
        toast.dismiss();
        toast.error(`Checkout error: ${error.message}`);
      }
    } catch (err) {
      console.error('Error during subscription process:', err);
      toast.dismiss();
      toast.error(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    toast.loading('Processing your request...');

    try {
      await axios.post('/api/stripe/cancel-subscription');
      toast.dismiss();
      toast.success(
        'Your subscription has been canceled. Access remains until your billing period ends.'
      );
      setShowCancelConfirm(false);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Error canceling subscription:', err);
      toast.dismiss();
      toast.error(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAlertProps = {
    action: handleCancelSubscription,
    title: 'Confirm Subscription Cancellation',
    desc: "Are you sure you want to cancel your Premium subscription? You'll continue to have access to premium features until the end of your current billing period.",
    confirmMsg: 'Yes, Cancel Subscription',
  };

  if (isUserLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Idly.pro | Subscription Plans</title>
      </Head>
      <Layout>
        <div className="w-full px-4 py-12 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
              Subscription Plans
            </h1>

            <div className="space-y-8">
              {/* --- Free Plan Section --- */}
              <div className="flex flex-col md:flex-row bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Plan Details (Left) */}
                <div className="p-8 md:w-2/5 lg:w-1/3 flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-green-600 mb-1">
                      Free
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                      The quickest and easiest way to get started.
                    </p>
                    <p className="text-5xl font-bold text-gray-900 mb-1">$0</p>
                    <p className="text-sm text-gray-500 mb-6">Free forever</p>
                  </div>
                  {isSubscribed ? (
                    <AlertDialog.Root open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
                      <AlertDialog.Trigger asChild>
                        <button
                          className={`w-full py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer`}
                        >
                          Switch to Free
                        </button>
                      </AlertDialog.Trigger>
                      <CustomAlert
                        {...cancelAlertProps}
                        close={() => setShowCancelConfirm(false)}
                      />
                    </AlertDialog.Root>
                  ) : (
                    <button
                      disabled={true}
                      className={`w-full py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors border bg-gray-100 text-gray-700 border-gray-300 cursor-default`}
                    >
                      Current Plan
                    </button>
                  )}
                </div>
                {/* Features List (Right) */}
                <div className="p-8 md:w-3/5 lg:w-2/3 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-200/60">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Available features on free plan:
                  </h3>
                  <ul className="space-y-3">
                    {freeFeatures.map(feature => (
                      <FeatureItem
                        key={feature.name}
                        text={feature.name}
                        description={feature.description}
                      />
                    ))}
                  </ul>
                </div>
              </div>

              {/* --- Premium Plan Section --- */}
              <div
                className={`flex flex-col md:flex-row bg-white rounded-xl border shadow-sm overflow-hidden ${isSubscribed ? 'border-blue-500 ring-2 ring-blue-400/50' : 'border-gray-200'}`}
              >
                {/* Plan Details (Left) */}
                <div className="p-8 md:w-2/5 lg:w-1/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        Premium
                      </h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        🔥 Most Popular
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                      Unlock detailed analytics and remove branding.
                    </p>
                    <p className="text-5xl font-bold text-gray-900 mb-1">
                      $4<span className="text-lg font-medium text-gray-500">/mo</span>
                    </p>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing || isSubscribed}
                    className={`w-full py-2.5 px-5 rounded-lg text-sm font-semibold transition-colors border ${
                      isSubscribed
                        ? 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                  >
                    {isSubscribed
                      ? 'Current Plan'
                      : isProcessing
                        ? 'Processing...'
                        : 'Upgrade to Premium'}
                  </button>
                </div>
                {/* Features List (Right) */}
                <div className="p-8 md:w-3/5 lg:w-2/3 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-200/60">
                  <h3 className="text-base font-semibold text-gray-700 mb-4">
                    Everything in our <span className="font-semibold text-gray-800">Free</span>{' '}
                    plan, plus:
                  </h3>
                  <ul className="space-y-3">
                    {premiumOnlyFeatures.map(feature => (
                      <FeatureItem
                        key={feature.name}
                        text={feature.name}
                        description={feature.description}
                        iconColor="text-blue-500"
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SubscriptionPage;
