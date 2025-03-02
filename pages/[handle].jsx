/* eslint-disable @next/next/no-img-element */
import LinkCard from '@/components/core/user-profile/links-card';
import TextCard from '@/components/core/user-profile/text-card';
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useUser from '@/hooks/useUser';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import Script from 'next/script';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import Head from 'next/head';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { useQuery } from '@tanstack/react-query';
import PortfolioLayout from '@/components/core/photo-book/layouts/portfolio-layout';
import MasonryLayout from '@/components/core/photo-book/layouts/masonry-layout';
import GridLayout from '@/components/core/photo-book/layouts/grid-layout';
import CarouselLayout from '@/components/core/photo-book/layouts/carousel-layout';

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

  const handleRegisterClick = async id => {
    await mutation.mutateAsync(id);

    // Track the click in Tinybird using the web analytics template
    if (window.flock && userLinks) {
      const clickedLink = userLinks.find(link => link.id === id);
      if (clickedLink) {
        window.flock.push({
          event_name: 'click',
          data: {
            link_id: id,
            link_title: clickedLink.title,
            link_url: clickedLink.url,
            handle: `/${handle}`,
          },
        });
      }
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
      {!query.isIframe ? (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-host="https://api.us-east.tinybird.co"
          data-token={process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN}
        />
      ) : (
        ''
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
                    registerClicks={() => handleRegisterClick(id)}
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
                        registerClicks={() => handleRegisterClick(item.id)}
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
                      registerClicks={() => handleRegisterClick(item.id)}
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
              const photoBookContent = <div className="w-full">{renderPhotoBook()}</div>;

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
                      registerClicks={() => handleRegisterClick(item.id)}
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
