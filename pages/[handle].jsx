/* eslint-disable @next/next/no-img-element */
import LinkCard from '@/components/core/user-profile/links-card';
import TextCard from '@/components/core/user-profile/text-card';
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';
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

const ProfilePage = () => {
  const { query } = useRouter();
  const { handle, photoBookLayout: queryLayout } = query;

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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['links', fetchedUser?.id] });
        queryClient.invalidateQueries({ queryKey: ['users', fetchedUser?.id] });
      },
    }
  );

  const handleRegisterClick = async (linkId, linkUrl, linkTitle) => {
    try {
      console.log(`Handling click for link: ${linkTitle} (${linkUrl})`);

      // First, increment the click count in the database
      console.log(`Incrementing click count for link ID: ${linkId}`);
      try {
        await fetch(`/api/links/${linkId}/click`, {
          method: 'POST',
        });
        console.log('Database click count incremented successfully');
      } catch (dbError) {
        console.error('Error incrementing database click count:', dbError);
      }

      // Track the click event in Tinybird
      if (typeof window !== 'undefined') {
        // Prepare the event data - format specifically for Tinybird events tracking
        const clickData = {
          timestamp: new Date().toISOString(),
          handle: handle,
          url: linkUrl,
          title: linkTitle,
          link_id: linkId,
          event_name: 'click',
        };

        console.log('Click event data:', clickData);

        let trackingSuccess = false;

        // Try to use window.flock if available (direct Tinybird script)
        if (window.flock) {
          console.log('Using window.flock to track event');
          try {
            // Use the push method for compatibility with Tinybird's API
            window.flock.push(clickData);
            trackingSuccess = true;
            console.log('Successfully tracked event with window.flock');
          } catch (flockError) {
            console.error('Error tracking with window.flock:', flockError);
            trackingSuccess = false;
          }
        }

        // If direct tracking failed or flock isn't available, use our proxy
        if (!trackingSuccess) {
          console.log('Using ProxyFlock trackEvent as fallback');
          try {
            trackingSuccess = await trackEvent('click', clickData);
            console.log('ProxyFlock tracking result:', trackingSuccess);
          } catch (proxyError) {
            console.error('Error tracking with ProxyFlock:', proxyError);
            trackingSuccess = false;
          }
        }

        // If both methods failed, try direct Tinybird API call
        if (!trackingSuccess) {
          console.log('All tracking methods failed, attempting direct Tinybird API call');

          try {
            // Get the token from a meta tag or environment variable
            const token =
              document.querySelector('meta[name="tinybird-token"]')?.getAttribute('content') ||
              process.env.NEXT_PUBLIC_ANALYTICS_TOKEN;

            if (token) {
              // Try the events endpoint directly
              try {
                const apiBaseUrl = 'https://api.us-east.tinybird.co';
                const clicksResponse = await fetch(
                  `${apiBaseUrl}/v0/events?name=click&token=${token}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(clickData),
                  }
                );

                console.log('Direct Tinybird events response:', clicksResponse.status);
                if (clicksResponse.ok) {
                  console.log('Successfully tracked event directly with Tinybird events endpoint');
                  trackingSuccess = true;
                } else {
                  console.error('Failed to track event with events endpoint');
                  const responseText = await clicksResponse.text();
                  console.error('Error details:', responseText);

                  // Try the datasource endpoint as fallback
                  const datasourceResponse = await fetch(
                    `${apiBaseUrl}/v0/datasources/events?token=${token}`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(clickData),
                    }
                  );

                  console.log('Direct Tinybird datasource response:', datasourceResponse.status);
                  if (datasourceResponse.ok) {
                    console.log('Successfully tracked event directly with Tinybird datasource');
                    trackingSuccess = true;
                  } else {
                    console.error('Failed to track event with datasource endpoint');
                    const dsResponseText = await datasourceResponse.text();
                    console.error('Error details:', dsResponseText);
                  }
                }
              } catch (directError) {
                console.error('Error making direct Tinybird API call:', directError);
              }
            } else {
              console.error('No Tinybird token available for direct API call');
            }
          } catch (directError) {
            console.error('Error making direct Tinybird API call:', directError);
          }
        }

        // Log final tracking status
        console.log('Final tracking status:', trackingSuccess ? 'Success' : 'Failed');
      }

      // Open the link in a new tab
      window.open(linkUrl, '_blank');
    } catch (error) {
      console.error('Error handling link click:', error);
      // Still open the link even if tracking fails
      window.open(linkUrl, '_blank');
    }
  };

  useEffect(() => {
    if (fetchedUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [fetchedUser, userLinks]);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!fetchedUser?.id) {
    return <NotFound />;
  }

  const buttonStyle = fetchedUser?.buttonStyle;
  const theme = {
    primary: fetchedUser?.themePalette.palette[0],
    secondary: fetchedUser?.themePalette.palette[1],
    accent: fetchedUser?.themePalette.palette[2],
    neutral: fetchedUser?.themePalette.palette[3],
  };

  // Background image styles
  // Include theme.primary as the background color behind the image
  // This ensures the theme color shows while the image is loading
  // and provides a fallback if the image fails to load
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

  return (
    <>
      <Head>
        <title> @{handle} | Librelinks</title>
      </Head>

      {/* Use our ProxyFlock component as a fallback */}
      {useFallback && <ProxyFlock handle={handle} debug={process.env.NODE_ENV === 'development'} />}

      {!query.isIframe && (
        <Script
          id="tinybird-analytics-check"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.setTimeout(function() {
                  if (!window.flock) {
                    console.warn('Tinybird Flock.js not loaded, activating fallback tracking');
                    window.dispatchEvent(new CustomEvent('activateFallbackTracking'));
                  } else {
                    console.log('Tinybird Flock.js loaded for handle: ${handle}');
                  }
                }, 1000);
              })();
            `,
          }}
        />
      )}
      <section
        style={{
          // CSS precedence solution:
          // If background image exists, use backgroundImageStyles which includes both
          // the theme color and background image with proper layering
          // If no background image, just use theme color with transition
          ...(fetchedUser?.backgroundImage
            ? backgroundImageStyles
            : {
                backgroundColor: theme.primary,
                transition: 'background-color 0.3s ease-in-out',
                // Set default background properties to avoid shift when adding image
                backgroundPosition: 'center center',
                backgroundSize: 'cover',
              }),
        }}
        className="h-[100vh] w-[100vw] overflow-auto"
      >
        <div
          className="flex items-center w-full flex-col mx-auto max-w-3xl justify-center px-8"
          style={{
            paddingTop: `${fetchedUser?.headToPicturePadding || 40}px`,
            paddingBottom: `${fetchedUser?.headToPicturePadding || 40}px`,
          }}
        >
          {(isLinksFetching || isUserFetching) && (
            <div className="absolute -top-5 left-2">
              <Loader strokeWidth={7} width={15} height={15} bgColor={theme.accent} />
            </div>
          )}

          {/* Profile section with improved z-index management */}
          <div className="relative flex flex-col items-center">
            {/* Avatar wrapper with lower z-index */}
            <div className="relative" style={{ zIndex: 5 }}>
              <UserAvatarSetting isPreview={true} handle={handle} />
            </div>

            {/* Text content with higher z-index to ensure it's above the image */}
            <div
              className="relative"
              style={{
                zIndex: 15,
                marginTop: `${fetchedUser?.pictureToNamePadding || 16}px`,
              }}
            >
              <p
                style={{
                  color: theme.accent,
                  fontSize: `${fetchedUser?.profileNameFontSize || 16}px`,
                  fontFamily: fetchedUser?.profileNameFontFamily || 'Inter',
                }}
                className="font-bold text-white text-center mb-2 lg:mt-4"
              >
                {fetchedUser?.name}
              </p>

              {fetchedUser?.bio && (
                <div
                  className="w-full"
                  style={{
                    marginTop: `${fetchedUser?.nameToBioPadding || 10}px`,
                  }}
                >
                  <p
                    style={{
                      color: theme.accent,
                      fontSize: `${fetchedUser?.bioFontSize || 14}px`,
                      fontFamily: fetchedUser?.bioFontFamily || 'Inter',
                    }}
                    className="text-center mb-4 break-words whitespace-pre-wrap"
                  >
                    {fetchedUser?.bio}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-max flex flex-wrap gap-2 mb-8 lg:w-fit lg:gap-4">
            {userLinks
              ?.filter(link => link.isSocial && !link.archived)
              .map(({ id, title, url }) => {
                return (
                  <SocialCards
                    key={title}
                    title={title}
                    url={url}
                    color={theme.accent}
                    registerClicks={() => handleRegisterClick(id, url, title)}
                  />
                );
              })}
          </div>

          {/* Combined Links and Photo Book Section */}
          <div
            className="w-full flex flex-col"
            style={{
              gap: `${fetchedUser?.betweenCardsPadding || 16}px`,
              marginTop: `${fetchedUser?.bioToFirstCardPadding || 24}px`,
            }}
          >
            {/* Render content based on photoBookOrder */}
            {(() => {
              // If there are no photos or no links, just render what exists
              if (!photos || photos.length === 0) {
                // Combine links and texts
                const allItems = [
                  ...(userLinks?.filter(link => !link.isSocial && !link.archived) || []),
                  ...(userTexts || []),
                ].sort((a, b) => a.order - b.order);

                return allItems.map(item => {
                  // If it has URL property, it's a link
                  if ('url' in item) {
                    return (
                      <LinkCard
                        buttonStyle={buttonStyle}
                        theme={theme}
                        id={item.id}
                        key={item.id}
                        fontSize={fetchedUser?.linkTitleFontSize || 14}
                        fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                        cardHeight={fetchedUser?.linkCardHeight || 16}
                        {...item}
                        registerClicks={() => handleRegisterClick(item.id, item.url, item.title)}
                      />
                    );
                  } else {
                    // Otherwise it's a text item
                    return (
                      <TextCard
                        buttonStyle={buttonStyle}
                        theme={theme}
                        id={item.id}
                        key={item.id}
                        fontSize={fetchedUser?.linkTitleFontSize || 14}
                        fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                        cardHeight={fetchedUser?.linkCardHeight || 16}
                        {...item}
                      />
                    );
                  }
                });
              }

              if (
                !userLinks &&
                !userTexts &&
                !userLinks?.filter(l => !l.isSocial && !l.archived).length === 0 &&
                !userTexts?.length === 0
              ) {
                // Just render photo book (no links or texts)
                return <div className="w-full">{renderPhotoBook()}</div>;
              }

              // Combine regular links and texts
              const regularLinks =
                userLinks?.filter(link => !link.isSocial && !link.archived) || [];
              const allItems = [...regularLinks, ...(userTexts || [])].sort(
                (a, b) => a.order - b.order
              );

              // Determine photo book position based on photoBookOrder
              const photoBookOrder = fetchedUser?.photoBookOrder || 9999;
              const photoBookPosition = Math.min(photoBookOrder, allItems.length);

              // Split items into before and after photo book
              const itemsBeforePhotoBook = allItems.slice(0, photoBookPosition);
              const itemsAfterPhotoBook = allItems.slice(photoBookPosition);

              // Render items before photo book
              const beforeContent = itemsBeforePhotoBook.map(item => {
                // If it has URL property, it's a link
                if ('url' in item) {
                  return (
                    <LinkCard
                      buttonStyle={buttonStyle}
                      theme={theme}
                      id={item.id}
                      key={item.id}
                      fontSize={fetchedUser?.linkTitleFontSize || 14}
                      fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                      cardHeight={fetchedUser?.linkCardHeight || 16}
                      {...item}
                      registerClicks={() => handleRegisterClick(item.id, item.url, item.title)}
                    />
                  );
                } else {
                  // Otherwise it's a text item
                  return (
                    <TextCard
                      buttonStyle={buttonStyle}
                      theme={theme}
                      id={item.id}
                      key={item.id}
                      fontSize={fetchedUser?.linkTitleFontSize || 14}
                      fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                      cardHeight={fetchedUser?.linkCardHeight || 16}
                      {...item}
                    />
                  );
                }
              });

              // Render photo book
              const photoBookContent =
                photos && photos.length > 0 ? (
                  <div key="photo-book" className="w-full">
                    {renderPhotoBook()}
                  </div>
                ) : null;

              // Render items after photo book
              const afterContent = itemsAfterPhotoBook.map(item => {
                // If it has URL property, it's a link
                if ('url' in item) {
                  return (
                    <LinkCard
                      buttonStyle={buttonStyle}
                      theme={theme}
                      id={item.id}
                      key={item.id}
                      fontSize={fetchedUser?.linkTitleFontSize || 14}
                      fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                      cardHeight={fetchedUser?.linkCardHeight || 16}
                      {...item}
                      registerClicks={() => handleRegisterClick(item.id, item.url, item.title)}
                    />
                  );
                } else {
                  // Otherwise it's a text item
                  return (
                    <TextCard
                      buttonStyle={buttonStyle}
                      theme={theme}
                      id={item.id}
                      key={item.id}
                      fontSize={fetchedUser?.linkTitleFontSize || 14}
                      fontFamily={fetchedUser?.linkTitleFontFamily || 'Inter'}
                      cardHeight={fetchedUser?.linkCardHeight || 16}
                      {...item}
                    />
                  );
                }
              });

              // Combine all content in the correct order
              return [...beforeContent, photoBookContent, ...afterContent];
            })()}
          </div>

          {userLinks?.length === 0 && !photos?.length && (!userTexts || userTexts.length === 0) && (
            <div className="flex justify-center">
              <h3
                style={{ color: theme.neutral }}
                className="pt-8 text-md text-white font-semibold lg:text-2xl"
              >
                Hello World 🚀
              </h3>
            </div>
          )}
        </div>
        <div className="my-10 lg:my-24" />
        {userLinks?.length > 0 ? (
          <footer className="relative left-1/2 bottom-0 transform -translate-x-1/2 w-[200px]">
            <p
              style={{ color: theme.accent }}
              className="text-sm text-semibold text-center w lg:text-lg"
            >
              Made with{' '}
              <Link className="font-semibold" target="_blank" href="https://librelinks.vercel.app/">
                Librelinks
              </Link>
            </p>
          </footer>
        ) : (
          ''
        )}
      </section>
    </>
  );
};

export default ProfilePage;
