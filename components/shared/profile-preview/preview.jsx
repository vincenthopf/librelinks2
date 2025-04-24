import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { StackedCardsView } from '@/components/core/user-profile/stacked-cards-view';
import BentoCardsView from '@/components/core/bento-view/bento-cards-view';
import PortfolioLayout from '@/components/core/photo-book/layouts/portfolio-layout';
import MasonryLayout from '@/components/core/photo-book/layouts/masonry-layout';
import GridLayout from '@/components/core/photo-book/layouts/grid-layout';
import CarouselLayout from '@/components/core/photo-book/layouts/carousel-layout';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { SocialCards } from '@/components/core/user-profile/social-cards';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const dimensionUpdateTimeoutRef = useRef(null);

  // *** DEBUG LOGGING ***
  console.log(
    'Preview Render - Key:',
    refreshKey,
    'ViewMode:',
    currentUser?.viewMode,
    'BG Image:',
    currentUser?.backgroundImage
  );
  // *** END DEBUG LOGGING ***

  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);
  const { photos } = usePhotoBook();

  // --- Comprehensive Dependency Object ---
  // Create a single object or string that captures ALL relevant currentUser state
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

  // Define theme based on currentUser
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

  // Filter social links from userLinks
  const socialLinks = useMemo(
    () => userLinks?.filter(link => link.isSocial && !link.archived) || [],
    [userLinks]
  );

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
      allItems = [...itemsBefore, { id: 'photobook-preview', type: 'photobook' }, ...itemsAfter];
    }
    return allItems;
  }, [userLinks, userTexts, photos, currentUser?.photoBookOrder]);

  const handleRegisterClick = (id, url, title) => {
    console.log(`Preview click registered for: ${title} (${id})`);
  };

  // --- useEffect for Content Structure Changes ---
  // This effect monitors changes in the actual items (links, texts, photos) and their order.
  // We might need to trigger a refreshKey update here ONLY if view components
  // fail to update correctly just from prop changes.
  useEffect(() => {
    console.log('Preview content structure snapshot changed:', contentStructureSnapshot);
    // Potential future addition if needed:
    // setRefreshKey(prev => prev + 1);
  }, [contentStructureSnapshot]); // Depend ONLY on content structure

  // useEffect for ResizeObserver (keep as is)
  useEffect(() => {
    if (!iframeRef.current) return;

    const observer = new ResizeObserver(() => {
      if (iframeRef.current) {
        const container = iframeRef.current.parentElement;
        if (container) {
          iframeRef.current.style.height = `${container.offsetHeight}px`;
        }
      }
    });

    observer.observe(iframeRef.current.parentElement);
    return () => observer.disconnect();
  }, []);

  // useEffect for Message Handling
  useEffect(() => {
    const handleMessage = event => {
      // *** DEBUG LOGGING ***
      console.log(
        'Preview handleMessage - Received:',
        event.data,
        'Current ViewMode:',
        currentUser?.viewMode
      );
      // *** END DEBUG LOGGING ***

      // Handle string messages
      if (event.data && typeof event.data === 'string') {
        // Explicit 'refresh' message always triggers full refresh
        if (event.data === 'refresh') {
          console.log('Preview: Received string refresh, forcing full reload.');
          setRefreshKey(prev => prev + 1);
          return;
        }

        // Update user message might need to trigger refresh
        if (event.data === 'update_user') {
          console.log('Preview: Received update_user message.');
          if (iframeRef.current && iframeRef.current.contentWindow) {
            // Forward to iframe if in Normal View
            try {
              iframeRef.current.contentWindow.postMessage(event.data, '*');
              console.log('Forwarded string message to iframe:', event.data);
            } catch (error) {
              console.error('Error forwarding string message:', error);
            }
          }
          return;
        }

        // Forward other specific string messages if iframe is active
        if (
          ['update_links'].includes(event.data) &&
          iframeRef.current &&
          iframeRef.current.contentWindow
        ) {
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
            console.log('Forwarded string message to iframe:', event.data);
            // No refresh needed here for iframe mode
          } catch (error) {
            console.error('Error forwarding string message:', error);
          }
          return;
        }
      }

      // Handle structured messages (like update_dimensions)
      if (
        event.data &&
        typeof event.data === 'object' &&
        event.data.type &&
        iframeRef.current &&
        iframeRef.current.contentWindow
      ) {
        const { type } = event.data;

        if (type === 'update_dimensions') {
          // Forward the dimension update to the iframe content
          try {
            iframeRef.current.contentWindow.postMessage(event.data, '*');
            console.log('Forwarded dimension update to iframe:', event.data);
            // Clear any existing timeout
            if (dimensionUpdateTimeoutRef.current) {
              clearTimeout(dimensionUpdateTimeoutRef.current);
            }
            return;
          } catch (error) {
            console.error('Error forwarding dimension update:', error);
            // Fall through ONLY if forwarding fails
          }
        }

        // Fallback for other *structured* messages - still refresh for safety?
        // Consider if specific structured messages can also be forwarded instead.
        console.log(
          'Preview: Received unhandled structured message, forcing full reload:',
          event.data
        );
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up timeout on unmount
      if (dimensionUpdateTimeoutRef.current) {
        clearTimeout(dimensionUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Re-render iframe when photoBookLayout changes
  useEffect(() => {
    if (currentUser?.photoBookLayout) {
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

  // Construct iframe URL (still needed for iframe mode)
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true&photoBookLayout=${currentUser?.photoBookLayout || 'grid'}&viewMode=${currentUser?.viewMode || 'normal'}`;

  // --- Conditional Background Style for Custom Views ---
  const customViewContainerStyle = {};

  if (currentUser?.viewMode === 'stacked' || currentUser?.viewMode === 'bento') {
    // Set base background color from theme first
    customViewContainerStyle.backgroundColor = theme.primary;

    // If background image exists, add it
    if (currentUser.backgroundImage) {
      customViewContainerStyle.backgroundImage = `url(${currentUser.backgroundImage})`;
      customViewContainerStyle.backgroundSize = 'cover';
      customViewContainerStyle.backgroundPosition = 'center center';
      customViewContainerStyle.backgroundRepeat = 'no-repeat';
      customViewContainerStyle.backgroundAttachment = 'fixed'; // Match public page style
    }

    // Ensure overflow for scrolling
    customViewContainerStyle.overflowY = 'auto';
  }

  return (
    <>
      <div className="relative border-[2px] lg:border-[5px] border-black rounded-[2rem] max-w-80 lg:max-w-96 xl:max-w-[28rem] aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
        {/* Apply conditional style HERE to the inner div when using custom views */}
        <div
          className={`absolute inset-0 z-10 flex ${currentUser?.viewMode !== 'normal' ? 'flex-col' : 'items-center justify-center'}`}
          style={
            currentUser?.viewMode !== 'normal'
              ? {
                  ...customViewContainerStyle,
                  // Apply horizontal padding dynamically
                  paddingLeft: `${currentUser?.pageHorizontalMargin ?? 20}px`,
                  paddingRight: `${currentUser?.pageHorizontalMargin ?? 20}px`,
                }
              : {}
          }
        >
          {currentUser && (
            <>
              {currentUser.viewMode === 'normal' ? (
                <iframe
                  ref={iframeRef}
                  key={`${refreshKey}-${comprehensiveUserSnapshot}-${contentStructureSnapshot}`}
                  seamless
                  loading="lazy"
                  title="preview"
                  id="preview"
                  className="w-full h-full"
                  style={{ height: '100%' }}
                  src={url}
                />
              ) : (
                <>
                  {/* Profile Header Section (shared between Stacked and Bento views) */}
                  <div
                    className="relative flex flex-col items-center w-full flex-shrink-0"
                    style={{
                      paddingTop: `${currentUser?.headToPicturePadding ?? 40}px`,
                      paddingBottom: `${currentUser?.betweenCardsPadding ?? 16}px`,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className={`relative ${currentUser?.frameAnimation?.type && currentUser?.frameAnimation?.enabled ? `animate-frame-${currentUser.frameAnimation.type}` : ''}`}
                      style={{ zIndex: 5 }}
                    >
                      <UserAvatarSetting isPreview={true} handle={currentUser?.handle} />
                    </div>
                    {/* Text content */}
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
                    {/* Social icons */}
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

                  {/* Content View - Conditionally render StackedCardsView or BentoCardsView */}
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
                        // Pass ALL links and texts, not just the filtered combinedItems
                        items={[
                          ...(userLinks?.filter(link => !link.archived) || []).map(l => ({
                            ...l,
                            type: 'link',
                          })),
                          ...(userTexts?.filter(text => !text.archived) || []).map(t => ({
                            ...t,
                            type: 'text',
                          })),
                        ]}
                        photos={photos} // Pass the separate photos array
                        fetchedUser={currentUser} // Pass the full user object with bentoItems
                        theme={theme}
                        registerClicks={handleRegisterClick}
                        renderPhotoBook={renderPhotoBook} // Needed if photobook item exists
                      />
                    ) : null}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Preview;
