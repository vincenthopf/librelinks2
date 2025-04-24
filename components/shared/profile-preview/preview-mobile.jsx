/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import LinkCard from '@/components/core/user-profile/links-card';
import Link from 'next/link';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import useCurrentUser from '@/hooks/useCurrentUser';
import { X } from 'lucide-react';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { getCurrentBaseURL } from '@/utils/helpers';
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { StackedCardsView } from '@/components/core/user-profile/stacked-cards-view';
import BentoCardsView from '@/components/core/bento-view/bento-cards-view';
// Import Photo Book Layouts
import PortfolioLayout from '@/components/core/photo-book/layouts/portfolio-layout';
import MasonryLayout from '@/components/core/photo-book/layouts/masonry-layout';
import GridLayout from '@/components/core/photo-book/layouts/grid-layout';
import CarouselLayout from '@/components/core/photo-book/layouts/carousel-layout';

// --- PreloadCard for eager loading ---
const PreloadCard = ({ item, theme, fetchedUser }) => {
  if (!item?.url || !item.embedHtml) return null;
  return (
    <div
      className="sr-only"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '100%',
        height: 'auto',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <LinkCard
        {...item}
        theme={theme}
        alwaysExpandEmbed={true}
        buttonStyle={fetchedUser?.buttonStyle}
        fontSize={fetchedUser?.linkTitleFontSize}
        fontFamily={fetchedUser?.linkTitleFontFamily}
        cardHeight={fetchedUser?.linkCardHeight}
        faviconSize={fetchedUser?.faviconSize}
      />
    </div>
  );
};

const PreviewMobile = ({ close }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef(null);
  const dimensionUpdateTimeoutRef = useRef(null);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { photos } = usePhotoBook();

  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);

  // --- Comprehensive Dependency Object ---
  // Create a single object or string that captures ALL relevant currentUser state
  // This ensures the useEffect hook triggers on any customization change.
  const comprehensiveUserSnapshot = useMemo(() => {
    if (!currentUser) return '{}';
    // Select ALL properties that affect visual rendering
    const relevantProps = {
      handle: currentUser.handle,
      name: currentUser.name,
      bio: currentUser.bio,
      themePalette: currentUser.themePalette,
      backgroundImage: currentUser.backgroundImage,
      buttonStyle: currentUser.buttonStyle,
      textCardButtonStyle: currentUser.textCardButtonStyle,
      animationSettings: {
        frame: currentUser.frameAnimation,
        content: currentUser.contentAnimation,
      },
      padding: currentUser.customPadding,
      fonts: {
        profileName: currentUser.profileNameFontFamily,
        bio: currentUser.bioFontFamily,
        linkTitle: currentUser.linkTitleFontFamily,
      },
      sizes: {
        profileName: currentUser.profileNameFontSize,
        bio: currentUser.bioFontSize,
        linkTitle: currentUser.linkTitleFontSize,
        favicon: currentUser.faviconSize,
        socialIcon: currentUser.socialIconSize,
        cardHeight: currentUser.linkCardHeight,
      },
      paddings: {
        headToPicture: currentUser.headToPicturePadding,
        pictureToName: currentUser.pictureToNamePadding,
        nameToBio: currentUser.nameToBioPadding,
        bioToSocial: currentUser.bioToSocialPadding,
        betweenCards: currentUser.betweenCardsPadding,
        pageHorizontal: currentUser.pageHorizontalMargin,
      },
      viewMode: currentUser.viewMode,
      bentoItems: currentUser.bentoItems,
      photoBookLayout: currentUser.photoBookLayout,
      photoBookOrder: currentUser.photoBookOrder,
      linkAlwaysExpandEmbed: currentUser.linkAlwaysExpandEmbed,
      // Add any other relevant visual settings here...
    };
    return JSON.stringify(relevantProps);
  }, [currentUser]); // Depend only on the main currentUser object

  // Snapshot of link/text/photo structure and order
  const contentStructureSnapshot = useMemo(() => {
    const links = userLinks
      ? JSON.stringify(userLinks.map(l => ({ id: l.id, order: l.order })))
      : '[]';
    const texts = userTexts
      ? JSON.stringify(userTexts.map(t => ({ id: t.id, order: t.order })))
      : '[]';
    const photoItems = photos
      ? JSON.stringify(photos.map(p => ({ id: p.id, order: p.order })))
      : '[]';
    return `${links}|${texts}|${photoItems}`;
  }, [userLinks, userTexts, photos]);

  // Create a value that changes when link orders change
  const linksOrderString = useMemo(() => {
    if (!userLinks) return '';
    // Sort the links by order to create a consistent ordering before joining
    return [...userLinks]
      .sort((a, b) => a.order - b.order)
      .map(link => `${link.id}-${link.order}`)
      .join('|');
  }, [userLinks]);

  // Create a value that changes when text orders change
  const textsOrderString = useMemo(() => {
    if (!userTexts) return '';
    // Sort the texts by order to create a consistent ordering before joining
    return [...userTexts]
      .sort((a, b) => a.order - b.order)
      .map(text => `${text.id}-${text.order}`)
      .join('|');
  }, [userTexts]);

  // Create a value that changes when photo orders change
  const photosOrderString = useMemo(() => {
    if (!photos) return '';
    // Sort photos by order before creating the string for consistency
    return [...photos]
      .sort((a, b) => a.order - b.order)
      .map(p => `${p.id}-${p.order}`)
      .join('|');
  }, [photos]);

  // Create a comprehensive string representation of links for dependency tracking
  const linksSnapshot = useMemo(() => {
    if (!userLinks) return '';
    // Sort links for consistency before stringifying
    return JSON.stringify(
      [...userLinks]
        .sort((a, b) => a.order - b.order)
        .map(link => ({
          id: link.id,
          order: link.order,
          title: link.title, // Include title
          url: link.url, // Include url
          archived: link.archived, // Include archived status
          isSocial: link.isSocial, // Include type
          alwaysExpandEmbed: link.alwaysExpandEmbed, // Include expansion state
        }))
    );
  }, [userLinks]);

  // Create a string representation of animation settings for dependency tracking
  const animationSettings = useMemo(() => {
    const frameAnimString = currentUser?.frameAnimation
      ? JSON.stringify(currentUser.frameAnimation)
      : '{}';
    const contentAnimString = currentUser?.contentAnimation
      ? JSON.stringify(currentUser.contentAnimation)
      : '{}';
    return `${frameAnimString}|${contentAnimString}`;
  }, [currentUser?.frameAnimation, currentUser?.contentAnimation]);

  const refreshDependencies = [
    currentUser?.handle,
    currentUser?.photoBookLayout,
    currentUser?.viewMode,
    userTexts?.length,
    photos?.length,
    linksSnapshot, // Use the comprehensive snapshot
    textsOrderString, // Add dependency on text orders
    photosOrderString, // Add dependency on photo order
    currentUser?.photoBookOrder, // Keep for now
    animationSettings, // Add dependency on animation settings
  ];

  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette?.palette?.[0] || '#ffffff',
      secondary: currentUser?.themePalette?.palette?.[1] || '#f8f8f8',
      accent: currentUser?.themePalette?.palette?.[2] || '#000000',
      neutral: currentUser?.themePalette?.palette?.[3] || '#888888',
      embedBackground: currentUser?.themePalette?.embedBackground || 'transparent',
    }),
    [currentUser?.themePalette]
  );

  const socialLinks = useMemo(
    () => userLinks?.filter(link => link.isSocial && !link.archived) || [],
    [userLinks]
  );

  const nonSocialLinks = useMemo(() => userLinks?.filter(link => !link.isSocial), [userLinks]);

  // --- useEffect for Content Structure Changes ---
  // Monitor changes in items (links, texts, photos) and their order.
  useEffect(() => {
    console.log('Mobile Preview content structure snapshot changed:', contentStructureSnapshot);
    // Like in preview.jsx, only add setRefreshKey here if prop updates alone are insufficient
    // setRefreshKey(prev => prev + 1);
  }, [contentStructureSnapshot]); // Depend ONLY on content structure

  useEffect(() => {
    if (currentUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [currentUser, userLinks]);

  // Restore effects
  useEffect(() => {
    const handleMessage = event => {
      // Handle string messages
      if (
        event.data &&
        typeof event.data === 'string' &&
        ['refresh', 'update_user', 'update_links'].includes(event.data) && // Re-add 'refresh'
        // NOTE: No longer checking iframeRef.current here for 'update_user' in custom views
        (iframeRef.current || currentUser?.viewMode !== 'normal')
      ) {
        // Handle 'refresh' by updating the key (primarily for iframe)
        if (event.data === 'refresh') {
          console.log('Mobile Preview: Received string refresh, forcing full reload.');
          setRefreshKey(prev => prev + 1);
          // Handle 'update_user' or 'update_links'
        } else {
          // If in Normal View, forward message to iframe
          if (
            currentUser?.viewMode === 'normal' &&
            iframeRef.current &&
            iframeRef.current.contentWindow
          ) {
            try {
              iframeRef.current.contentWindow.postMessage(event.data, '*');
              console.log('Mobile Preview: Forwarded string message to iframe:', event.data);
            } catch (error) {
              console.error('Mobile Preview: Error forwarding string message:', error);
            }
            // If in custom view and message is 'update_user', rely on data propagation (NO explicit refreshKey change)
          } else if (currentUser?.viewMode !== 'normal' && event.data === 'update_user') {
            console.log(
              'Mobile Preview: Received update_user in custom view. Relying on data update.'
            );
            // NO ACTION NEEDED HERE - Let useCurrentUser update trigger re-render
          }
          // Note: 'update_links' in custom view might need specific handling if required later
        }
        return; // Message handled (or intentionally ignored for custom view data propagation)
      }

      // Handle structured messages (like update_dimensions)
      if (event.data && typeof event.data === 'object' && event.data.type && iframeRef.current) {
        const { type } = event.data;

        // Remove explicit 'refresh' handling here

        // Forward ALL structured messages (existing behavior for update_dimensions, etc.)
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
            console.log('Mobile Preview: Forwarded structured message to iframe:', event.data);
          } catch (error) {
            console.error('Mobile Preview: Error forwarding structured message:', error);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [currentUser?.viewMode]);

  // Restore effects (but this refresh might still be problematic - monitor)
  useEffect(() => {
    if (currentUser?.photoBookLayout) {
      // Let's keep this one for now, as layout change might NEED a full refresh
      // If still issues, this might need replacing with a postMessage call too
      setRefreshKey(prev => prev + 1);
    }
  }, [currentUser?.photoBookLayout]);

  // Define the actual renderPhotoBook function
  const renderPhotoBook = useCallback(() => {
    if (!photos || photos.length === 0) return null;

    const layout = currentUser?.photoBookLayout || 'grid'; // Default to grid

    switch (layout) {
      case 'portfolio':
        return <PortfolioLayout photos={photos} theme={theme} />;
      case 'masonry':
        return <MasonryLayout photos={photos} theme={theme} />;
      case 'carousel':
        return <CarouselLayout photos={photos} theme={theme} />;
      case 'grid':
      default:
        return <GridLayout photos={photos} theme={theme} />;
    }
  }, [photos, currentUser?.photoBookLayout, theme]);

  // Combine and sort items for stacked view (links, texts, photobook)
  const combinedItems = useMemo(() => {
    const links = userLinks?.filter(link => !link.isSocial && !link.archived) || [];
    const texts = userTexts?.filter(text => !text.archived) || [];
    let allItems = [...links, ...texts].sort((a, b) => a.order - b.order);
    const shouldShowPhotoBook =
      currentUser?.photoBookOrder !== null &&
      currentUser?.photoBookOrder !== undefined &&
      photos &&
      photos.length > 0;

    if (shouldShowPhotoBook) {
      const photoBookPosition = Math.min(Math.max(0, currentUser.photoBookOrder), allItems.length);
      const itemsBefore = allItems.slice(0, photoBookPosition);
      const itemsAfter = allItems.slice(photoBookPosition);
      // Ensure the photobook item has a unique ID and type
      allItems = [
        ...itemsBefore,
        { id: 'photobook-preview-mobile', type: 'photobook' },
        ...itemsAfter,
      ];
    }
    return allItems;
  }, [userLinks, userTexts, photos, currentUser?.photoBookOrder]);

  const handleRegisterClick = (id, url, title) => {
    console.log(`Mobile Preview click registered for: ${title} (${id})`);
  };

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!currentUser?.id) {
    return <NotFound />;
  }

  // Construct URL only when currentUser is available
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser.handle}?isIframe=true&photoBookLayout=${currentUser.photoBookLayout || 'grid'}&viewMode=${currentUser?.viewMode || 'normal'}`;

  // --- Conditional Background Style ---
  const sectionStyle = {};

  if (currentUser?.viewMode !== 'normal') {
    // Set base background color from theme first
    sectionStyle.backgroundColor = theme.primary;

    // If background image exists, add it
    if (currentUser.backgroundImage) {
      sectionStyle.backgroundImage = `url(${currentUser.backgroundImage})`;
      sectionStyle.backgroundSize = 'cover';
      sectionStyle.backgroundPosition = 'center center';
      sectionStyle.backgroundRepeat = 'no-repeat';
      sectionStyle.backgroundAttachment = 'fixed';
    }
  } else {
    // Apply only the primary theme color if in Normal view
    sectionStyle.backgroundColor = theme.primary;
  }

  return (
    <>
      <section
        style={sectionStyle}
        className="h-[100vh] w-full overflow-y-auto relative flex flex-col items-center"
      >
        {currentUser?.viewMode === 'normal' ? (
          <iframe
            ref={iframeRef}
            key={`${refreshKey}-${comprehensiveUserSnapshot}-${contentStructureSnapshot}`}
            seamless
            loading="lazy"
            title="preview"
            id="preview-mobile"
            className="w-full h-full"
            style={{ height: '100%' }}
            src={url}
          />
        ) : (
          <>
            <div
              className="w-full flex flex-col items-center"
              style={{
                paddingLeft: `${currentUser?.pageHorizontalMargin ?? 20}px`,
                paddingRight: `${currentUser?.pageHorizontalMargin ?? 20}px`,
              }}
            >
              <div
                className="relative flex flex-col items-center w-full flex-shrink-0"
                style={{
                  paddingTop: `${currentUser?.headToPicturePadding ?? 40}px`,
                  paddingBottom: `${currentUser?.betweenCardsPadding ?? 16}px`,
                }}
              >
                <div
                  className={`relative ${currentUser?.frameAnimation?.type && currentUser?.frameAnimation?.enabled ? `animate-frame-${currentUser.frameAnimation.type}` : ''}`}
                  style={{ zIndex: 5 }}
                >
                  <UserAvatarSetting isPreview={true} handle={currentUser?.handle} />
                </div>
                <div
                  className={`relative text-center ${currentUser?.contentAnimation?.type ? `animate-${currentUser.contentAnimation.type}` : ''}`}
                  style={{
                    zIndex: 15,
                    marginTop: `${currentUser?.pictureToNamePadding ?? 16}px`,
                  }}
                >
                  <p
                    style={{
                      color: theme.accent,
                      fontSize: `${currentUser?.profileNameFontSize || 16}px`,
                      fontFamily: currentUser?.profileNameFontFamily || 'Inter',
                    }}
                    className="font-bold text-white"
                  >
                    {currentUser?.name}
                  </p>
                  {currentUser?.bio && (
                    <div
                      className="w-full"
                      style={{
                        marginTop: `${currentUser?.nameToBioPadding ?? 10}px`,
                      }}
                    >
                      <p
                        style={{
                          color: theme.accent,
                          fontSize: `${currentUser?.bioFontSize || 14}px`,
                          fontFamily: currentUser?.bioFontFamily || 'Inter',
                        }}
                        className="break-words whitespace-pre-wrap"
                      >
                        {currentUser?.bio}
                      </p>
                    </div>
                  )}
                </div>
                {socialLinks.length > 0 && (
                  <div
                    className={`flex flex-wrap justify-center gap-2 ${currentUser?.contentAnimation?.type ? `animate-${currentUser.contentAnimation.type}` : ''}`}
                    style={{
                      marginTop: `${currentUser?.bioToSocialPadding ?? 16}px`,
                    }}
                  >
                    {socialLinks.map(({ id, title, url }) => (
                      <SocialCards
                        key={id}
                        title={title}
                        url={url}
                        color={theme.accent}
                        socialIconSize={currentUser?.socialIconSize ?? 30}
                        registerClicks={() => handleRegisterClick(id, url, title)}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* --- Preload all embed cards for reliability --- */}
              {combinedItems.map(item => (
                <PreloadCard key={item.id} item={item} theme={theme} fetchedUser={currentUser} />
              ))}
              <div
                className="flex-grow w-full flex items-center justify-center"
                style={{ minHeight: '450px' }}
              >
                {currentUser.viewMode === 'stacked' ? (
                  <StackedCardsView
                    items={combinedItems}
                    fetchedUser={currentUser}
                    theme={theme}
                    registerClicks={handleRegisterClick}
                    renderPhotoBook={renderPhotoBook}
                    contentAnimation={currentUser?.contentAnimation}
                  />
                ) : currentUser.viewMode === 'bento' ? (
                  <BentoCardsView
                    userLinks={userLinks}
                    userTexts={userTexts}
                    photos={photos}
                    fetchedUser={currentUser}
                    theme={theme}
                    registerClicks={handleRegisterClick}
                  />
                ) : null}
              </div>
            </div>
          </>
        )}
        <div className="fixed top-4 right-4 z-[100]">
          <button
            onClick={close}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg border-2 border-white/20 hover:bg-black/50 transition-all duration-200"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>
      </section>
    </>
  );
};

export default PreviewMobile;
