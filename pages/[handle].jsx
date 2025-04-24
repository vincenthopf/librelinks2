/* eslint-disable @next/next/no-img-element */
import LinkCard from '@/components/core/user-profile/links-card';
import TextCard from '@/components/core/user-profile/text-card';
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useUser from '@/hooks/useUser';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import Script from 'next/script';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import Head from 'next/head';
import { UserAvatarSetting } from '@/components/utils/avatar';
import PortfolioLayout from '@/components/core/photo-book/layouts/portfolio-layout';
import MasonryLayout from '@/components/core/photo-book/layouts/masonry-layout';
import GridLayout from '@/components/core/photo-book/layouts/grid-layout';
import CarouselLayout from '@/components/core/photo-book/layouts/carousel-layout';
import { ProxyFlock, trackEvent } from '@/components/analytics/ProxyFlock';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { StackedCardsView } from '@/components/core/user-profile/stacked-cards-view';
import BentoCardsView from '@/components/core/bento-view/bento-cards-view';

// Object to store last click timestamps for each link ID
const lastClickTimestamps = {};

// Helper function to generate animation props based on user's animation settings and item index
const getAnimationProps = (frameAnimation, index) => {
  if (
    !frameAnimation ||
    !frameAnimation.type ||
    frameAnimation.type === 'none' ||
    frameAnimation.enabled === false
  ) {
    return {
      className: '',
      style: {},
    };
  }

  const {
    type,
    duration = 0.5,
    delay = 0,
    staggered = false,
    staggerAmount = 0.1,
  } = frameAnimation;

  return {
    className: `animate-${type}`,
    style: {
      animationDuration: `${duration}s`,
      animationDelay: `${delay + (staggered ? index * staggerAmount : 0)}s`,
      opacity: 0,
      animationFillMode: 'forwards',
    },
  };
};

// New function for content animations
const getContentAnimationProps = (contentAnimation, index) => {
  if (!contentAnimation || !contentAnimation.type || contentAnimation.type === 'none') {
    return {
      className: '',
      style: {},
    };
  }

  const {
    type,
    duration = 0.5,
    delay = 0,
    staggered = false,
    staggerAmount = 0.1,
  } = contentAnimation;

  return {
    className: `animate-${type}`,
    style: {
      animationDuration: `${duration}s`,
      animationDelay: `${delay + (staggered ? index * staggerAmount : 0)}s`,
      opacity: 0,
      animationFillMode: 'forwards',
    },
  };
};

const ProfilePage = () => {
  const { query } = useRouter();
  const { handle, photoBookLayout: queryLayout, viewMode: queryViewMode } = query;

  // Initialize QueryClient at the top of the component
  const queryClient = useQueryClient();

  // Replace the message handler with a more optimized version that uses data fetching instead of invalidation
  const handleMessage = useCallback(
    event => {
      if (!event.data || typeof event.data !== 'string') return;

      try {
        const userId = handle; // Use handle as the id for queries

        // Don't process if we don't have a valid user ID
        if (!userId) return;

        // Use direct refetch instead of invalidation for faster updates
        if (event.data === 'update_links') {
          // Use fetchQuery for immediate data fetch without waiting for components
          queryClient.refetchQueries({ queryKey: ['links', userId], type: 'active' });
        } else if (event.data === 'update_user') {
          queryClient.refetchQueries({ queryKey: ['users', userId], type: 'active' });
        } else if (event.data === 'refresh') {
          // Batch refetches for better performance
          Promise.all([
            queryClient.refetchQueries({ queryKey: ['links', userId], type: 'active' }),
            queryClient.refetchQueries({ queryKey: ['users', userId], type: 'active' }),
            queryClient.refetchQueries({ queryKey: ['photobook', userId], type: 'active' }),
          ]);
        }
      } catch (error) {
        console.error('Error handling iframe message:', error);
      }
    },
    [handle, queryClient]
  );

  // Only add the listener when in iframe mode
  useEffect(() => {
    if (query.isIframe && handle) {
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [query.isIframe, handle, handleMessage]);

  const {
    data: fetchedUser,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useUser(handle);

  const { data: userLinks, isFetching: isLinksFetching } = useLinks(fetchedUser?.id);

  // Fetch text items
  const { data: userTexts, isFetching: isTextsFetching } = useTexts(fetchedUser?.id);

  // Fetch photo book images
  const { data: photos } = useQuery(
    ['photobook', fetchedUser?.id],
    async () => {
      if (!fetchedUser || !fetchedUser.id) {
        return [];
      }
      try {
        const { data } = await axios.get(`/api/photobook/photos?userId=${fetchedUser.id}`);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        return [];
      }
    },
    {
      enabled: !!fetchedUser?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const [, setIsDataLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Effect to listen for the fallback activation event
  useEffect(() => {
    const handleFallbackActivation = () => {
      console.log('Activating fallback tracking');
      setUseFallback(true);
    };

    window.addEventListener('activateFallbackTracking', handleFallbackActivation);
    return () => {
      window.removeEventListener('activateFallbackTracking', handleFallbackActivation);
    };
  }, []);

  const mutation = useMutation(
    async id => {
      await axios.patch(`/api/analytics/clicks/${id}`);
    },
    {
      onError: error => {
        toast.error((error.response && error.response.data.message) || 'An error occurred');
      },
    }
  );

  const handleRegisterClick = async (linkId, linkUrl, linkTitle) => {
    // Skip tracking if same link was clicked recently (debounce)
    const now = Date.now();
    const lastClickTime = lastClickTimestamps[linkId] || 0;
    // 3 second debounce period
    if (now - lastClickTime < 3000) {
      return;
    }
    lastClickTimestamps[linkId] = now;

    // Update clicks in the database
    try {
      mutation.mutate(linkId);
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Determine if we should use fallback tracking
    if (useFallback) {
      // Use a local click tracking and console logging as fallback
      console.log(`Tracked click on: ${linkTitle} (${linkId}) [FALLBACK MODE]`);
    } else {
      // Track the event using ProxyFlock
      trackEvent({
        event_name: 'link_clicked',
        event_data: {
          link_id: linkId,
          link_title: linkTitle,
          link_url: linkUrl,
          user_id: fetchedUser?.id,
        },
      });
    }
  };

  // Create the theme object based on user settings
  const theme = useMemo(
    () => ({
      primary: fetchedUser?.themePalette?.palette?.[0] || '#ffffff',
      secondary: fetchedUser?.themePalette?.palette?.[1] || '#f8f8f8',
      accent: fetchedUser?.themePalette?.palette?.[2] || '#000000',
      neutral: fetchedUser?.themePalette?.palette?.[3] || '#888888',
      embedBackground: fetchedUser?.themePalette?.embedBackground || 'transparent',
    }),
    [fetchedUser?.themePalette]
  );

  // Determine the active view mode (from URL param or user setting)
  const activeViewMode = useMemo(() => {
    // URL parameter takes precedence over user setting
    if (queryViewMode) {
      // Handle stackView=true/false for backward compatibility
      if (queryViewMode === 'true') return 'stacked';
      if (queryViewMode === 'false') return 'normal';
      // Otherwise, use the viewMode value directly
      return queryViewMode;
    }

    // For backward compatibility - use stackView boolean if viewMode isn't set
    if (fetchedUser?.viewMode) {
      return fetchedUser.viewMode;
    }

    // Legacy support for stackView boolean
    if (fetchedUser?.stackView === true) {
      return 'stacked';
    }

    // Default to normal view
    return 'normal';
  }, [queryViewMode, fetchedUser?.viewMode, fetchedUser?.stackView]);

  const backgroundImageStyles = fetchedUser?.backgroundImage
    ? {
        backgroundColor: theme.primary,
        backgroundImage: `url(${fetchedUser.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center', // Explicitly use center center
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed', // Keeps the background fixed during transitions
        transition: 'background-color 0.3s ease-in-out', // Only transition the color, not the image position
      }
    : {};

  // Calculate dynamic margin based on fetchedUser data
  const horizontalMarginPercent = fetchedUser?.pageHorizontalMargin ?? 8; // Default to 8%
  const dynamicMarginStyle = {
    // Apply margin to both left and right
    marginLeft: `${horizontalMarginPercent}px`,
    marginRight: `${horizontalMarginPercent}px`,
    // No need for max-width adjustment when using pixel values
  };

  // Function to render photo book based on layout
  const renderPhotoBook = () => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return null;
    }

    const layout = queryLayout || fetchedUser?.photoBookLayout || 'grid';

    try {
      switch (layout) {
        case 'portfolio':
          return <PortfolioLayout photos={photos} isPublicView={true} showTitle={true} />;
        case 'masonry':
          return <MasonryLayout photos={photos} isPublicView={true} showTitle={true} />;
        case 'carousel':
          return <CarouselLayout photos={photos} isPublicView={true} showTitle={true} />;
        case 'grid':
        default:
          return <GridLayout photos={photos} isPublicView={true} showTitle={true} />;
      }
    } catch (error) {
      console.error('Error rendering photo book:', error);
      return null;
    }
  };

  // Combine links and texts for sorting, excluding archived items
  const visibleLinks = userLinks?.filter(link => !link.isSocial && !link.archived) || [];
  const visibleTexts = userTexts?.filter(text => !text.archived) || []; // Filter archived texts too
  const allContentItems = [...visibleLinks, ...visibleTexts];

  // Sort all content items together by their order property
  allContentItems.sort((a, b) => a.order - b.order);

  // Prepare the final list of items to display, including the photo book placeholder
  const displayItems = [];
  const photoBookOrder = fetchedUser?.photoBookOrder;
  const photosExist = photos && Array.isArray(photos) && photos.length > 0;
  let photoBookInserted = false;

  // If photo book should be shown and has a valid order, try to insert it
  if (photosExist && photoBookOrder !== null && photoBookOrder !== undefined) {
    // Determine the proper insertion point
    const insertionIndex = Math.min(Math.max(0, photoBookOrder), allContentItems.length);

    // Add items before the insertion point
    for (let i = 0; i < insertionIndex; i++) {
      displayItems.push(allContentItems[i]);
    }

    // Insert the photobook placeholder
    displayItems.push({ type: 'photobook', id: 'photobook' });
    photoBookInserted = true;

    // Add items after the insertion point
    for (let i = insertionIndex; i < allContentItems.length; i++) {
      displayItems.push(allContentItems[i]);
    }
  } else {
    // Just add all content items in order
    displayItems.push(...allContentItems);
  }

  return (
    <>
      <Head>
        <title>{`Idly.pro | ${fetchedUser?.name ?? handle}`}</title>
        <meta name="description" content={fetchedUser?.bio ?? 'Your personal link hub'} />
        {fetchedUser?.image && <meta property="og:image" content={fetchedUser.image} />}
        {/* Optional: Add Twitter card meta tags */}
      </Head>

      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
      )}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      )}

      {/* Conditionally include ProxyFlock */}
      {useFallback ? (
        <Script
          id="fallback-tracker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `console.log("Fallback tracker script loaded")`,
          }}
        />
      ) : (
        <ProxyFlock
          apiKey={process.env.NEXT_PUBLIC_PROXYFLOCK_API_KEY}
          campaignId={fetchedUser?.id}
          trackPageViews={true}
        />
      )}

      <main
        style={{
          background: theme.primary,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: fetchedUser?.backgroundImage
            ? `url(${fetchedUser.backgroundImage})`
            : 'none',
          paddingBottom: fetchedUser?.customPadding?.paddingBottom || '32px', // Default 32px (was 2rem)
          paddingLeft: fetchedUser?.customPadding?.paddingSide || '12px', // Default 12px (was 0.75rem)
          paddingRight: fetchedUser?.customPadding?.paddingSide || '12px', // Default 12px (was 0.75rem)
        }}
        className={`flex flex-col items-center relative min-h-screen`}
      >
        <div
          className={`flex items-center w-full flex-col mx-auto max-w-3xl justify-center`}
          style={{
            paddingLeft: `${typeof fetchedUser?.pageHorizontalMargin === 'number' ? fetchedUser.pageHorizontalMargin : 20}px`, // Default: 20
            paddingRight: `${typeof fetchedUser?.pageHorizontalMargin === 'number' ? fetchedUser.pageHorizontalMargin : 20}px`, // Default: 20
            paddingTop: `${fetchedUser?.headToPicturePadding ?? 40}px`, // Default: 40
            paddingBottom: `${fetchedUser?.betweenCardsPadding ?? 16}px`, // Default: 16
          }}
        >
          {(isLinksFetching || isUserFetching) && (
            <div className="absolute -top-5 left-2">
              <Loader strokeWidth={7} width={15} height={15} bgColor={theme.accent} />
            </div>
          )}

          {/* Profile section with animation */}
          <div className="relative flex flex-col items-center">
            {/* Avatar wrapper with animation */}
            <div
              className={`relative ${fetchedUser?.frameAnimation?.type && fetchedUser?.frameAnimation?.enabled ? `animate-frame-${fetchedUser.frameAnimation.type}` : ''}`}
              style={{
                zIndex: 5,
              }}
            >
              <UserAvatarSetting isPreview={true} handle={handle} />
            </div>

            {/* Text content with animation */}
            <div
              className={`relative ${fetchedUser?.contentAnimation?.type ? `animate-${fetchedUser.contentAnimation.type}` : ''}`}
              style={{
                zIndex: 15,
                marginTop: `${fetchedUser?.pictureToNamePadding ?? 16}px`,
                ...(fetchedUser?.contentAnimation?.type && {
                  animationDuration: `${fetchedUser.contentAnimation.duration || 0.5}s`,
                  animationDelay: `${(fetchedUser.contentAnimation.delay || 0) + (fetchedUser.contentAnimation.staggered ? 0.1 : 0)}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }),
              }}
            >
              <p
                style={{
                  color: theme.accent,
                  fontSize: `${fetchedUser?.profileNameFontSize || 16}px`,
                  fontFamily: fetchedUser?.profileNameFontFamily || 'Inter',
                }}
                className="font-bold text-white text-center"
              >
                {fetchedUser?.name}
              </p>

              {fetchedUser?.bio && (
                <div
                  className="w-full"
                  style={{
                    marginTop: `${fetchedUser?.nameToBioPadding ?? 10}px`,
                  }}
                >
                  <p
                    style={{
                      color: theme.accent,
                      fontSize: `${fetchedUser?.bioFontSize || 14}px`,
                      fontFamily: fetchedUser?.bioFontFamily || 'Inter',
                    }}
                    className="text-center break-words whitespace-pre-wrap"
                  >
                    {fetchedUser?.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Social icons with animation */}
          <div
            className={`min-w-max flex flex-wrap gap-2 lg:w-fit lg:gap-4 ${fetchedUser?.contentAnimation?.type ? `animate-${fetchedUser.contentAnimation.type}` : ''}`}
            style={{
              marginTop: `${fetchedUser?.bioToSocialPadding ?? 16}px`,
              marginBottom: `${fetchedUser?.betweenCardsPadding ?? 16}px`,
              ...(fetchedUser?.contentAnimation?.type && {
                animationDuration: `${fetchedUser.contentAnimation.duration || 0.5}s`,
                animationDelay: `${(fetchedUser.contentAnimation.delay || 0) + (fetchedUser.contentAnimation.staggered ? 0.2 : 0)}s`,
                opacity: 0,
                animationFillMode: 'forwards',
              }),
            }}
          >
            {userLinks
              ?.filter(link => link.isSocial && !link.archived)
              .map(({ id, title, url }) => {
                return (
                  <SocialCards
                    key={title}
                    title={title}
                    url={url}
                    color={theme.accent}
                    socialIconSize={fetchedUser?.socialIconSize ?? 30}
                    registerClicks={() => handleRegisterClick(id, url, title)}
                  />
                );
              })}
          </div>

          {/* Main content items (links, texts, photobook) with animations */}
          <div className="w-full mx-auto" style={dynamicMarginStyle}>
            <div
              className="flex flex-col items-center w-full mx-auto max-w-3xl pb-10"
              style={{
                gap: `${fetchedUser?.betweenCardsPadding ?? 16}px`,
              }}
            >
              {activeViewMode === 'stacked' ? (
                <StackedCardsView
                  items={displayItems}
                  fetchedUser={fetchedUser}
                  theme={theme}
                  registerClicks={handleRegisterClick}
                  renderPhotoBook={renderPhotoBook}
                  contentAnimation={fetchedUser?.contentAnimation}
                />
              ) : activeViewMode === 'bento' ? (
                <BentoCardsView
                  items={displayItems}
                  fetchedUser={fetchedUser}
                  theme={theme}
                  registerClicks={handleRegisterClick}
                  renderPhotoBook={renderPhotoBook}
                  photos={photos}
                />
              ) : (
                displayItems.map((item, index) => {
                  // Get animation props based on the item's index
                  const animationProps = getContentAnimationProps(
                    fetchedUser?.contentAnimation,
                    index
                  );

                  // Apply animation to photobook
                  if (item.type === 'photobook') {
                    return (
                      <div
                        key={item.id}
                        className={`w-full ${animationProps.className}`}
                        style={animationProps.style}
                      >
                        {renderPhotoBook()}
                      </div>
                    );
                  }
                  // Apply animation directly to link cards without extra wrapper
                  else if (item.url) {
                    return (
                      <LinkCard
                        key={item.id}
                        {...item}
                        fontSize={fetchedUser?.linkTitleFontSize}
                        fontFamily={fetchedUser?.linkTitleFontFamily}
                        buttonStyle={fetchedUser?.buttonStyle}
                        theme={theme}
                        faviconSize={fetchedUser?.faviconSize ?? 32}
                        cardHeight={fetchedUser?.linkCardHeight}
                        registerClicks={() => handleRegisterClick(item.id, item.url, item.title)}
                        alwaysExpandEmbed={fetchedUser?.linkExpansionStates?.[item.id] ?? false}
                        className={animationProps.className}
                        animationStyle={animationProps.style}
                        contentAnimation={fetchedUser?.contentAnimation}
                      />
                    );
                  }
                  // Apply animation directly to text cards without extra wrapper
                  else {
                    return (
                      <TextCard
                        key={item.id}
                        title={item.title}
                        content={item.content}
                        buttonStyle={fetchedUser?.textCardButtonStyle}
                        theme={theme}
                        fontSize={fetchedUser?.linkTitleFontSize}
                        fontFamily={fetchedUser?.linkTitleFontFamily}
                        className={animationProps.className}
                        style={animationProps.style}
                      />
                    );
                  }
                })
              )}
            </div>
          </div>

          {/* Commenting out the "Hello World" placeholder */}
          {/* {userLinks?.length === 0 && !photos?.length && (!userTexts || userTexts.length === 0) && (
            <div className="flex justify-center">
              <h3
                style={{ color: theme.neutral }}
                className="pt-8 text-md text-white font-semibold lg:text-2xl"
              >
                Hello World 🚀
              </h3>
            </div>
          )} */}
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
